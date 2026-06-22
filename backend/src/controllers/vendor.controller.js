import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Payout from "../models/Payout.js";
import Commission from "../models/Commission.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/vendor/dashboard
// ─────────────────────────────────────────────────────────────────────────────
export const getVendorDashboard = asyncHandler(async (req, res) => {
  const vendorId = new mongoose.Types.ObjectId(req.user.id);

  const [
    totalProducts,
    totalOrders,
    recentOrders,
    topProducts,
    lowStockProducts,
  ] = await Promise.all([
    Product.countDocuments({ vendorId }),

    Order.countDocuments({ "items.vendorId": vendorId }),

    Order.find({ "items.vendorId": vendorId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("status totalAmount createdAt userId items")
      .populate("userId", "name email"),

    Product.find({ vendorId })
      .sort({ sold: -1 })
      .limit(5)
      .select("name images price sold stock status"),

    Product.find({ vendorId, stock: { $lte: 10, $gt: 0 } })
      .select("name stock images"),
  ]);

  // Total revenue from delivered orders
  const revenueAgg = await Order.aggregate([
    { $match: { "items.vendorId": vendorId, status: "Delivered" } },
    { $unwind: "$items" },
    { $match: { "items.vendorId": vendorId } },
    { $group: { _id: null, total: { $sum: { $multiply: ["$items.price", "$items.qty"] } } } },
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  const pendingOrders = await Order.countDocuments({
    "items.vendorId": vendorId,
    status: "Pending",
  });

  res.status(200).json({
    success: true,
    data: {
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      recentOrders,
      topProducts,
      lowStockProducts,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/vendor/products
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, vendorId: req.user.id, status: "pending" });
  res.status(201).json({ success: true, message: "Product submitted for approval.", data: product });
});

// GET /api/vendor/products
export const getVendorProducts = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = { vendorId: req.user.id };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("category", "name icon")
      .select("-__v"),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: products,
  });
});

// GET /api/vendor/products/:id
export const getVendorProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id, vendorId: req.user.id })
    .populate("category", "name icon");
  if (!product) return next(new AppError("Product not found.", 404));
  res.status(200).json({ success: true, data: product });
});

// PUT /api/vendor/products/:id
export const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findOne({ _id: req.params.id, vendorId: req.user.id });
  if (!product) return next(new AppError("Product not found.", 404));

  // Re-submit for approval on significant changes
  const triggerReview = ["price", "name", "images", "description"];
  const needsReview = triggerReview.some((f) => req.body[f] !== undefined);
  if (needsReview) req.body.status = "pending";

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: product });
});

// DELETE /api/vendor/products/:id
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id, vendorId: req.user.id });
  if (!product) return next(new AppError("Product not found.", 404));

  await Product.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: "Product deleted." });
});

// ─────────────────────────────────────────────────────────────────────────────
// INVENTORY
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/vendor/inventory
export const getInventory = asyncHandler(async (req, res) => {
  const products = await Product.find({ vendorId: req.user.id })
    .sort({ stock: 1 })
    .select("name images stock sold status category price")
    .populate("category", "name");

  const summary = {
    total: products.length,
    inStock: products.filter((p) => p.stock > 10).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock <= 10).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  };

  res.status(200).json({ success: true, summary, data: products });
});

// PATCH /api/vendor/inventory/:id
// body: { stock }
export const updateStock = asyncHandler(async (req, res, next) => {
  const { stock } = req.body;
  if (stock === undefined || stock < 0) return next(new AppError("Valid stock value is required.", 400));

  const product = await Product.findOne({ _id: req.params.id, vendorId: req.user.id });
  if (!product) return next(new AppError("Product not found.", 404));

  product.stock = stock;
  // Auto-update status based on stock
  if (stock === 0 && product.status === "approved") product.status = "approved"; // keep approved, just 0 stock
  await product.save();

  res.status(200).json({ success: true, message: "Stock updated.", data: { _id: product._id, name: product.name, stock: product.stock } });
});

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/vendor/orders
export const getVendorOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const vendorId = req.user.id;

  const filter = { "items.vendorId": vendorId };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("userId", "name email phone")
      .select("status totalAmount createdAt shippingAddress items userId"),
    Order.countDocuments(filter),
  ]);

  // Filter items to only show this vendor's items
  const filtered = orders.map((o) => ({
    ...o.toObject(),
    items: o.items.filter((i) => i.vendorId.toString() === vendorId.toString()),
  }));

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: filtered,
  });
});

// GET /api/vendor/orders/:id
export const getVendorOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.id,
    "items.vendorId": req.user.id,
  })
    .populate("userId", "name email phone")
    .select("status totalAmount createdAt shippingAddress items userId issue");

  if (!order) return next(new AppError("Order not found.", 404));

  const vendorItems = order.items.filter(
    (i) => i.vendorId.toString() === req.user.id.toString()
  );

  res.status(200).json({
    success: true,
    data: { ...order.toObject(), items: vendorItems },
  });
});

// PATCH /api/vendor/orders/:id/status
// body: { status }  — vendor can only move forward: Confirmed → Shipped → Delivered
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const allowed = ["Confirmed", "Shipped", "Delivered"];

  if (!allowed.includes(status)) {
    return next(new AppError(`Status must be one of: ${allowed.join(", ")}.`, 400));
  }

  const order = await Order.findOne({
    _id: req.params.id,
    "items.vendorId": req.user.id,
  });

  if (!order) return next(new AppError("Order not found.", 404));

  // Enforce forward-only progression
  const progression = ["Pending", "Confirmed", "Shipped", "Delivered"];
  const currentIdx = progression.indexOf(order.status);
  const newIdx = progression.indexOf(status);

  if (newIdx <= currentIdx) {
    return next(new AppError(`Cannot move order from "${order.status}" to "${status}".`, 400));
  }

  order.status = status;
  order.timeline = order.timeline || [];
  order.timeline.push({
    status,
    message: `Order marked as ${status}.`,
    updatedBy: "vendor",
    timestamp: new Date(),
  });
  await order.save();

  res.status(200).json({ success: true, message: `Order marked as ${status}.`, data: { _id: order._id, status: order.status } });
});

// ─────────────────────────────────────────────────────────────────────────────
// EARNINGS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/vendor/earnings
export const getEarnings = asyncHandler(async (req, res) => {
  const vendorId = new mongoose.Types.ObjectId(req.user.id);

  const commission = await Commission.findOne().sort({ createdAt: -1 });
  const commissionRate = commission?.rate || 8.5;

  const earningsAgg = await Order.aggregate([
    { $match: { "items.vendorId": vendorId, status: "Delivered" } },
    { $unwind: "$items" },
    { $match: { "items.vendorId": vendorId } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        grossRevenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Apply commission deduction per month
  const monthly = earningsAgg.map((m) => ({
    ...m,
    grossRevenue: m.grossRevenue,
    commission: parseFloat(((m.grossRevenue * commissionRate) / 100).toFixed(2)),
    revenue: parseFloat((m.grossRevenue - (m.grossRevenue * commissionRate) / 100).toFixed(2)),
  }));

  const totalGross    = monthly.reduce((s, m) => s + m.grossRevenue, 0);
  const totalCommission = parseFloat(((totalGross * commissionRate) / 100).toFixed(2));
  const totalEarnings = parseFloat((totalGross - totalCommission).toFixed(2));
  const totalDelivered = await Order.countDocuments({ "items.vendorId": vendorId, status: "Delivered" });

  res.status(200).json({
    success: true,
    data: { totalGross, totalCommission, commissionRate, totalEarnings, totalDelivered, monthly },
  });
});

// GET /api/vendor/payouts
export const getPayouts = asyncHandler(async (req, res) => {
  const vendorId = new mongoose.Types.ObjectId(req.user.id);
  const payouts = await Payout.find({ vendorId }).sort({ createdAt: -1 });

  const totalPaid    = payouts.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const totalPending = payouts.filter((p) => p.status === "Pending").reduce((s, p) => s + p.amount, 0);

  res.status(200).json({
    success: true,
    data: { totalPaid, totalPending, payouts },
  });
});

// POST /api/vendor/payouts/request
export const requestPayout = asyncHandler(async (req, res, next) => {
  const vendorId = new mongoose.Types.ObjectId(req.user.id);

  const commission = await Commission.findOne().sort({ createdAt: -1 });
  const commissionRate = commission?.rate || 8.5;

  // Gross earnings from delivered orders
  const earningsAgg = await Order.aggregate([
    { $match: { "items.vendorId": vendorId, status: "Delivered" } },
    { $unwind: "$items" },
    { $match: { "items.vendorId": vendorId } },
    { $group: { _id: null, total: { $sum: { $multiply: ["$items.price", "$items.qty"] } } } },
  ]);
  const totalGross    = earningsAgg[0]?.total || 0;
  const totalEarnings = parseFloat((totalGross - (totalGross * commissionRate) / 100).toFixed(2));

  // Subtract already claimed payouts
  const existingPayouts = await Payout.find({ vendorId });
  const alreadyClaimed  = existingPayouts.reduce((s, p) => s + p.amount, 0);
  const available = parseFloat((totalEarnings - alreadyClaimed).toFixed(2));

  if (available <= 0) {
    return next(new AppError("No available balance to request payout.", 400));
  }

  const payout = await Payout.create({ vendorId, amount: available, status: "Pending" });

  res.status(201).json({
    success: true,
    message: `Payout request of ₹${available.toLocaleString()} submitted.`,
    data: payout,
  });
});
