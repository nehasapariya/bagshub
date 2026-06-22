import { Router } from "express";
import { body } from "express-validator";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
// GET /api/categories
router.get("/", getCategories);

// ── Admin only ────────────────────────────────────────────────────────────────
// POST /api/categories
router.post(
  "/",
  protect,
  restrictTo("admin"),
  [body("name").trim().notEmpty().withMessage("Category name is required.")],
  validate,
  createCategory
);

// PUT /api/categories/:id
router.put("/:id", protect, restrictTo("admin"), updateCategory);

// DELETE /api/categories/:id
router.delete("/:id", protect, restrictTo("admin"), deleteCategory);

export default router;
