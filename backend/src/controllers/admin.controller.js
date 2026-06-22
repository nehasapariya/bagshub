import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import Payout from "../models/Payout.js";
import Commission from "../models/Commission.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalVendors,
    totalProducts,
    totalOrders,
    pendingProducts,
    pendingReviews,
    reportedReviews,
    recentOrders,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    User.countDocuments({ role: "vendor" }),
    Product.countDocuments(),
    Order.countDocuments(),
    Product.countDocuments({ status: "pending" }),
    Review.countDocuments({ status: "pending" }),
    Review.countDocuments({ isReported: true }),
    Order.find().sort({ createdAt: -1 }).limit(5)
      .populate("userId", "name email")
      .select("status totalAmount createdAt userId items"),
  ]);

  // Platform revenue (all delivered orders)
  const revenueAgg = await Order.aggregate([
    { $match: { status: "Delivered" } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);
  const totalRevenue = revenueAgg[0]?.total || 0;

  // Monthly revenue — last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

  const monthlyRevenue = await Order.aggregate([
    { $match: { status: "Delivered", createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const commission = await Commission.findOne().sort({ createdAt: -1 });
  const commissionRate = commission?.rate || 8.5;
  const totalCommission = (totalRevenue * commissionRate) / 100;

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      totalRevenue,
      totalCommission,
      commissionRate,
      pendingProducts,
      pendingReviews,
      reportedReviews,
      recentOrders,
      monthlyRevenue,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// USER & VENDOR MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/users?role=&status=&page=&limit=
export const getUsers = asyncHandler(async (req, res) => {
  const { role, status, search, page = 1, limit = 20 } = req.query;

  const filter = { role: { $ne: "admin" } };
  if (role) filter.role = role;
  if (status === "blocked") filter.isBlocked = true;
  if (status === "active") filter.isBlocked = false;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-password -refreshToken -passwordResetToken -passwordResetExpires"),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: users,
  });
});

// PATCH /api/admin/users/:id/block
export const toggleBlockUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found.", 404));
  if (user.role === "admin") return next(new AppError("Cannot block an admin.", 403));

  user.isBlocked = !user.isBlocked;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully.`,
    data: { _id: user._id, isBlocked: user.isBlocked },
  });
});

// PATCH /api/admin/users/:id/role
// body: { role }
export const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;
  const allowed = ["user", "vendor"];
  if (!allowed.includes(role)) return next(new AppError("Role must be 'user' or 'vendor'.", 400));

  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("User not found.", 404));
  if (user.role === "admin") return next(new AppError("Cannot change admin role.", 403));

  user.role = role;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: `User role updated to ${role}.`,
    data: { _id: user._id, role: user.role },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CONTROL
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/products?status=&category=&page=&limit=
export const getAllProducts = asyncHandler(async (req, res) => {
  const { status, category, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("vendorId", "name email")
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

// PATCH /api/admin/products/:id/approve
export const approveProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { status: "approved" },
    { new: true }
  ).populate("vendorId", "name email");

  if (!product) return next(new AppError("Product not found.", 404));

  res.status(200).json({ success: true, message: "Product approved.", data: product });
});

// PATCH /api/admin/products/:id/reject
export const rejectProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { status: "rejected" },
    { new: true }
  );

  if (!product) return next(new AppError("Product not found.", 404));

  res.status(200).json({ success: true, message: "Product rejected.", data: product });
});

// DELETE /api/admin/products/:id
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return next(new AppError("Product not found.", 404));

  res.status(200).json({ success: true, message: "Product deleted." });
});

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/orders?status=&page=&limit=
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("userId", "name email phone")
      .select("-__v"),
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

// PATCH /api/admin/orders/:id/status
// body: { status }
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const allowed = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
  if (!allowed.includes(status)) {
    return next(new AppError(`Status must be one of: ${allowed.join(", ")}.`, 400));
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate("userId", "name email");

  if (!order) return next(new AppError("Order not found.", 404));

  res.status(200).json({ success: true, message: `Order status updated to ${status}.`, data: order });
});

// ─────────────────────────────────────────────────────────────────────────────
// FINANCE
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/revenue
export const getRevenue = asyncHandler(async (req, res) => {
  // Overall totals
  const totalAgg = await Order.aggregate([
    { $match: { status: "Delivered" } },
    { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, totalOrders: { $sum: 1 } } },
  ]);

  // Monthly breakdown
  const monthly = await Order.aggregate([
    { $match: { status: "Delivered" } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  // Per-vendor revenue
  const vendorRevenue = await Order.aggregate([
    { $match: { status: "Delivered" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.vendorId",
        revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
        orders: { $sum: 1 },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "vendor",
      },
    },
    { $unwind: "$vendor" },
    { $project: { revenue: 1, orders: 1, "vendor.name": 1, "vendor.email": 1 } },
  ]);

  const commission = await Commission.findOne().sort({ createdAt: -1 });
  const commissionRate = commission?.rate || 8.5;
  const totalRevenue = totalAgg[0]?.totalRevenue || 0;

  res.status(200).json({
    success: true,
    data: {
      totalRevenue,
      totalOrders: totalAgg[0]?.totalOrders || 0,
      commissionRate,
      totalCommission: (totalRevenue * commissionRate) / 100,
      netToVendors: totalRevenue - (totalRevenue * commissionRate) / 100,
      monthly,
      vendorRevenue,
    },
  });
});

// GET /api/admin/commissions
// Also handles PATCH to update commission rate via body: { rate }
export const getCommissions = asyncHandler(async (req, res) => {
  const history = await Commission.find()
    .sort({ createdAt: -1 })
    .populate("updatedBy", "name email");

  const current = history[0];

  res.status(200).json({
    success: true,
    data: { current: current?.rate || 8.5, history },
  });
});

export const updateCommission = asyncHandler(async (req, res, next) => {
  const { rate } = req.body;
  if (rate === undefined || rate < 0 || rate > 100) {
    return next(new AppError("Commission rate must be between 0 and 100.", 400));
  }

  const commission = await Commission.create({ rate, updatedBy: req.user.id });

  res.status(200).json({
    success: true,
    message: `Commission rate updated to ${rate}%.`,
    data: commission,
  });
});

// GET /api/admin/payouts
export const getAllPayouts = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const payouts = await Payout.find(filter)
    .sort({ createdAt: -1 })
    .populate("vendorId", "name email");

  const totalPending = payouts.filter((p) => p.status === "Pending").reduce((s, p) => s + p.amount, 0);
  const totalPaid    = payouts.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);

  res.status(200).json({ success: true, data: { payouts, totalPending, totalPaid } });
});

// PATCH /api/admin/payouts/:id/pay
export const markPayoutPaid = asyncHandler(async (req, res, next) => {
  const payout = await Payout.findById(req.params.id);
  if (!payout) return next(new AppError("Payout not found.", 404));
  if (payout.status === "Paid") return next(new AppError("Payout already marked as paid.", 400));

  payout.status = "Paid";
  payout.paidAt = new Date();
  await payout.save();

  res.status(200).json({ success: true, message: "Payout marked as paid.", data: payout });
});

// ─────────────────────────────────────────────────────────────────────────────
// MODERATION
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/admin/reviews?status=&reported=
export const getAllReviews = asyncHandler(async (req, res) => {
  const { status, reported, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (reported === "true") filter.isReported = true;

  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("userId", "name avatar")
      .populate("productId", "name images"),
    Review.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    data: reviews,
  });
});

// PATCH /api/admin/reviews/:id  — approve / reject / dismiss report
// body: { status } or { isReported: false }
export const moderateReview = asyncHandler(async (req, res, next) => {
  const { status, isReported } = req.body;

  const update = {};
  if (status) {
    const allowed = ["approved", "rejected"];
    if (!allowed.includes(status)) return next(new AppError("Status must be 'approved' or 'rejected'.", 400));
    update.status = status;
  }
  if (isReported === false) update.isReported = false;

  const review = await Review.findByIdAndUpdate(req.params.id, update, { new: true })
    .populate("userId", "name")
    .populate("productId", "name");

  if (!review) return next(new AppError("Review not found.", 404));

  // Recalculate product rating whenever review status changes
  if (status) await Review.calcAverageRating(review.productId);

  res.status(200).json({ success: true, message: "Review updated.", data: review });
});

// DELETE /api/admin/reviews/:id
export const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) return next(new AppError("Review not found.", 404));

  await Review.calcAverageRating(review.productId);

  res.status(200).json({ success: true, message: "Review deleted." });
});
