import { Router } from "express";
import { body } from "express-validator";
import {
  getVendorDashboard,
  createProduct,
  getVendorProducts,
  getVendorProductById,
  updateProduct,
  deleteProduct,
  getInventory,
  updateStock,
  getVendorOrders,
  getVendorOrderById,
  getEarnings,
  getPayouts,
  requestPayout,
} from "../controllers/vendor.controller.js";
import { vendorUpdateOrderStatus } from "../controllers/order.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

router.use(protect, restrictTo("vendor"));

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get("/dashboard", getVendorDashboard);

// ── Product Management ────────────────────────────────────────────────────────
const productRules = [
  body("name").trim().notEmpty().withMessage("Product name is required."),
  body("price").isFloat({ min: 0 }).withMessage("Valid price is required."),
  body("category").notEmpty().withMessage("Category is required."),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer."),
];

router.post("/products", productRules, validate, createProduct);
router.get("/products", getVendorProducts);
router.get("/products/:id", getVendorProductById);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// ── Inventory ─────────────────────────────────────────────────────────────────
router.get("/inventory", getInventory);
router.patch(
  "/inventory/:id",
  [body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer.")],
  validate,
  updateStock
);

// ── Orders ────────────────────────────────────────────────────────────────────
router.get("/orders", getVendorOrders);
router.get("/orders/:id", getVendorOrderById);

// PATCH /api/vendor/orders/:id/status — Pending→Confirmed→Shipped→Delivered
router.patch(
  "/orders/:id/status",
  [body("status").isIn(["Confirmed", "Shipped", "Delivered"]).withMessage("Invalid status.")],
  validate,
  vendorUpdateOrderStatus
);

// ── Earnings ──────────────────────────────────────────────────────────────────
router.get("/earnings", getEarnings);
router.get("/payouts", getPayouts);
router.post("/payouts/request", requestPayout);
export default router;
