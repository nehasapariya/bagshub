import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

// ─────────────────────────────────────────────────────────────────────────────
// Helper — push timeline event and save
// ─────────────────────────────────────────────────────────────────────────────
const pushTimeline = (order, status, updatedBy) => {
  order.status = status;
  order.timeline.push({
    status,
    message: Order.statusMessage[status],
    updatedBy,
    timestamp: new Date(),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// USER — POST /api/orders
// Builds order from cart → status: Pending
// ─────────────────────────────────────────────────────────────────────────────
export const placeOrder = asyncHandler(async (req, res, next) => {
  const { shippingAddress } = req.body;
  if (!shippingAddress) return next(new AppError("Shipping address is required.", 400));

  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart || cart.items.length === 0) return next(new AppError("Cart is empty.", 400));

  // Validate stock + build items
  const orderItems = [];
  for (const item of cart.items) {
    const product = await Product.findById(item.productId).select("name images price stock vendorId status");
    if (!product || product.status !== "approved") {
      return next(new AppError(`"${item.name}" is no longer available.`, 400));
    }
    if (product.stock < item.qty) {
      return next(new AppError(`Insufficient stock for "${product.name}".`, 400));
    }
    orderItems.push({
      productId: product._id,
      vendorId:  product.vendorId,
      name:      product.name,
      image:     product.images[0] || "",
      price:     product.price,
      color:     item.color,
      qty:       item.qty,
    });
  }

  const totalAmount = orderItems.reduce((s, i) => s + i.price * i.qty, 0);

  const order = await Order.create({
    userId: req.user.id,
    items: orderItems,
    shippingAddress,
    totalAmount,
    timeline: [{ status: "Pending", message: Order.statusMessage["Pending"], updatedBy: "user" }],
  });

  // Deduct stock + increment sold
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.qty, sold: item.qty },
    });
  }

  // Clear cart
  cart.items = [];
  await cart.save();

  res.status(201).json({ success: true, message: "Order placed successfully.", data: order });
});

// ─────────────────────────────────────────────────────────────────────────────
// USER — GET /api/orders/my
// ─────────────────────────────────────────────────────────────────────────────
export const getMyOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { userId: req.user.id };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("status totalAmount items createdAt shippingAddress timeline"),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: orders,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// USER — GET /api/orders/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.user.id })
    .select("status totalAmount items createdAt shippingAddress timeline");
  if (!order) return next(new AppError("Order not found.", 404));
  res.status(200).json({ success: true, data: order });
});

// ─────────────────────────────────────────────────────────────────────────────
// USER — PATCH /api/orders/:id/cancel
// User can cancel only if status is Pending
// ─────────────────────────────────────────────────────────────────────────────
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
  if (!order) return next(new AppError("Order not found.", 404));

  if (!Order.canTransition(order.status, "Cancelled", "user")) {
    return next(new AppError(`Cannot cancel an order that is already "${order.status}".`, 400));
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: item.qty, sold: -item.qty },
    });
  }

  pushTimeline(order, "Cancelled", "user");
  await order.save();

  res.status(200).json({ success: true, message: "Order cancelled.", data: order });
});

// ─────────────────────────────────────────────────────────────────────────────
// VENDOR — PATCH /api/vendor/orders/:id/status
// Vendor: Pending → Confirmed → Shipped → Delivered
// (already in vendor.controller.js — this is the shared helper used there)
// ─────────────────────────────────────────────────────────────────────────────
export const vendorUpdateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const vendorAllowed = ["Confirmed", "Shipped", "Delivered"];

  if (!vendorAllowed.includes(status)) {
    return next(new AppError(`Vendor can set status to: ${vendorAllowed.join(", ")}.`, 400));
  }

  const order = await Order.findOne({ _id: req.params.id, "items.vendorId": req.user.id });
  if (!order) return next(new AppError("Order not found.", 404));

  if (!Order.canTransition(order.status, status, "vendor")) {
    return next(new AppError(`Cannot move order from "${order.status}" to "${status}".`, 400));
  }

  pushTimeline(order, status, "vendor");
  await order.save();

  res.status(200).json({
    success: true,
    message: `Order marked as ${status}.`,
    data: { _id: order._id, status: order.status, timeline: order.timeline },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — PATCH /api/admin/orders/:id/status
// Admin can set any status (override)
// ─────────────────────────────────────────────────────────────────────────────
export const adminUpdateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const allowed = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

  if (!allowed.includes(status)) {
    return next(new AppError(`Status must be one of: ${allowed.join(", ")}.`, 400));
  }

  const order = await Order.findById(req.params.id).populate("userId", "name email");
  if (!order) return next(new AppError("Order not found.", 404));

  // Restore stock if admin cancels
  if (status === "Cancelled" && order.status !== "Cancelled") {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.qty, sold: -item.qty },
      });
    }
  }

  pushTimeline(order, status, "admin");
  await order.save();

  res.status(200).json({
    success: true,
    message: `Order status updated to ${status}.`,
    data: order,
  });
});
