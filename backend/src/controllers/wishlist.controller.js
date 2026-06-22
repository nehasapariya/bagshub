import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

// ── GET /api/wishlist ────────────────────────────────────────────────────────
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ userId: req.user.id }).populate(
    "products",
    "name price originalPrice images rating numReviews stock category"
  );

  res.status(200).json({
    success: true,
    data: wishlist?.products || [],
  });
});

// ── POST /api/wishlist ───────────────────────────────────────────────────────
// body: { productId }  — toggles (add if not present, remove if present)
export const toggleWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  if (!productId) return next(new AppError("productId is required.", 400));

  const product = await Product.findOne({ _id: productId, status: "approved" });
  if (!product) return next(new AppError("Product not found.", 404));

  let wishlist = await Wishlist.findOne({ userId: req.user.id });

  if (!wishlist) {
    wishlist = await Wishlist.create({ userId: req.user.id, products: [productId] });
    return res.status(201).json({ success: true, message: "Added to wishlist.", data: wishlist.products });
  }

  const exists = wishlist.products.some((id) => id.toString() === productId);

  if (exists) {
    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();
    return res.status(200).json({ success: true, message: "Removed from wishlist.", data: wishlist.products });
  }

  wishlist.products.push(productId);
  await wishlist.save();
  res.status(200).json({ success: true, message: "Added to wishlist.", data: wishlist.products });
});

// ── DELETE /api/wishlist/:productId ─────────────────────────────────────────
export const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ userId: req.user.id });
  if (!wishlist) return next(new AppError("Wishlist not found.", 404));

  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== req.params.productId
  );
  await wishlist.save();

  res.status(200).json({ success: true, message: "Removed from wishlist.", data: wishlist.products });
});
