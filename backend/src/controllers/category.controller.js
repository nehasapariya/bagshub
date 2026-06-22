import Category from "../models/Category.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

// ── GET /api/categories  (Public) ────────────────────────────────────────────
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ status: "active" }).sort({ name: 1 });
  res.status(200).json({ success: true, total: categories.length, data: categories });
});

// ── POST /api/categories  (Admin) ────────────────────────────────────────────
export const createCategory = asyncHandler(async (req, res, next) => {
  const { name, icon } = req.body;

  const exists = await Category.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
  if (exists) return next(new AppError("Category already exists.", 409));

  const category = await Category.create({ name, icon });
  res.status(201).json({ success: true, message: "Category created.", data: category });
});

// ── PUT /api/categories/:id  (Admin) ─────────────────────────────────────────
export const updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) return next(new AppError("Category not found.", 404));

  res.status(200).json({ success: true, data: category });
});

// ── DELETE /api/categories/:id  (Admin) ──────────────────────────────────────
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new AppError("Category not found.", 404));

  // Prevent deletion if products are using this category
  const productCount = await Product.countDocuments({ category: req.params.id });
  if (productCount > 0) {
    return next(new AppError(`Cannot delete — ${productCount} product(s) use this category.`, 400));
  }

  await Category.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: "Category deleted." });
});
