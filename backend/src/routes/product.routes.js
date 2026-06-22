import { Router } from "express";
import {
  getProducts,
  getProductById,
  searchProducts,
  filterProducts,
} from "../controllers/product.controller.js";

const router = Router();

// @route   GET /api/products/search?q=
// @access  Public
router.get("/search", searchProducts);

// @route   GET /api/products/filter?category=&minPrice=&maxPrice=&rating=
// @access  Public
router.get("/filter", filterProducts);

// @route   GET /api/products
// @access  Public
router.get("/", getProducts);

// @route   GET /api/products/:id
// @access  Public
router.get("/:id", getProductById);

export default router;
