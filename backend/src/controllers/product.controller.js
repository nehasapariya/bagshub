import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

// ── GET /api/products ────────────────────────────────────────────────────────
// Query: page, limit, category, sort, gender
export const getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, category, sort, gender } = req.query;

  const filter = { status: "approved" };
  if (category) filter.category = category;
  if (gender) filter.gender = gender;

  const sortMap = {
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    rating: { rating: -1 },
    newest: { createdAt: -1 },
  };
  const sortBy = sortMap[sort] || { createdAt: -1 };

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit))
      .populate("category", "name icon")
      .populate("vendorId", "name")
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

// ── GET /api/products/search?q= ──────────────────────────────────────────────
export const searchProducts = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(200).json({ success: true, data: [] });

  const products = await Product.find({
    status: "approved",
    $text: { $search: q },
  })
    .limit(20)
    .populate("category", "name icon")
    .select("name price originalPrice images rating numReviews category");

  res.status(200).json({ success: true, total: products.length, data: products });
});

// ── GET /api/products/filter?category=&minPrice=&maxPrice=&rating=&gender= ───
export const filterProducts = asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice, rating, gender, page = 1, limit = 12 } = req.query;

  const filter = { status: "approved" };
  if (category) filter.category = category;
  if (gender) filter.gender = gender;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (rating) filter.rating = { $gte: Number(rating) };

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("category", "name icon")
      .select("name price originalPrice images rating numReviews category stock"),
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

// ── GET /api/products/:id ────────────────────────────────────────────────────
export const getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id, status: "approved" })
    .populate("category", "name icon")
    .populate("vendorId", "name avatar")
    .select("-__v");

  if (!product) return next(new AppError("Product not found.", 404));

  res.status(200).json({ success: true, data: product });
});
