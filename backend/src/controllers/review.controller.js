import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

// ── POST /api/reviews ────────────────────────────────────────────────────────
// body: { productId, rating, comment }
export const addReview = asyncHandler(async (req, res, next) => {
  const { productId, rating, comment } = req.body;

  const product = await Product.findOne({ _id: productId, status: "approved" });
  if (!product) return next(new AppError("Product not found.", 404));

  // Only allow review if user has a delivered order containing this product
  const hasPurchased = await Order.findOne({
    userId: req.user.id,
    status: "Delivered",
    "items.productId": productId,
  });
  if (!hasPurchased) {
    return next(new AppError("You can only review products you have purchased and received.", 403));
  }

  // Check duplicate
  const existing = await Review.findOne({ userId: req.user.id, productId });
  if (existing) return next(new AppError("You have already reviewed this product.", 409));

  const review = await Review.create({
    userId: req.user.id,
    productId,
    rating,
    comment,
  });

  res.status(201).json({ success: true, message: "Review submitted. Pending approval.", data: review });
});

// ── GET /api/reviews/:productId ──────────────────────────────────────────────
export const getProductReviews = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return next(new AppError("Product not found.", 404));

  const reviews = await Review.find({ productId: req.params.productId, status: "approved" })
    .sort({ createdAt: -1 })
    .populate("userId", "name avatar");

  res.status(200).json({ success: true, total: reviews.length, data: reviews });
});

// ── DELETE /api/reviews/:id ──────────────────────────────────────────────────
export const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findOne({ _id: req.params.id, userId: req.user.id });
  if (!review) return next(new AppError("Review not found.", 404));

  await Review.findOneAndDelete({ _id: req.params.id });
  res.status(200).json({ success: true, message: "Review deleted." });
});
