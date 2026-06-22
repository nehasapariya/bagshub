import { Router } from "express";
import { body } from "express-validator";
import {
  getAdminDashboard,
  getUsers,
  toggleBlockUser,
  updateUserRole,
  getAllProducts,
  approveProduct,
  rejectProduct,
  deleteProduct,
  getAllOrders,
  getRevenue,
  getCommissions,
  updateCommission,
  getAllPayouts,
  markPayoutPaid,
  getAllReviews,
  moderateReview,
  deleteReview,
} from "../controllers/admin.controller.js";
import { adminUpdateOrderStatus } from "../controllers/order.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

router.use(protect, restrictTo("admin"));

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get("/dashboard", getAdminDashboard);

// ── User & Vendor Management ──────────────────────────────────────────────────
router.get("/users", getUsers);
router.patch("/users/:id/block", toggleBlockUser);
router.patch(
  "/users/:id/role",
  [body("role").isIn(["user", "vendor"]).withMessage("Role must be 'user' or 'vendor'.")],
  validate,
  updateUserRole
);

// ── Product Control ───────────────────────────────────────────────────────────
router.get("/products", getAllProducts);
router.patch("/products/:id/approve", approveProduct);
router.patch("/products/:id/reject", rejectProduct);
router.delete("/products/:id", deleteProduct);

// ── Orders ────────────────────────────────────────────────────────────────────
router.get("/orders", getAllOrders);

// PATCH /api/admin/orders/:id/status — admin can set any status
router.patch(
  "/orders/:id/status",
  [body("status").isIn(["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"]).withMessage("Invalid status.")],
  validate,
  adminUpdateOrderStatus
);

// ── Finance ───────────────────────────────────────────────────────────────────
router.get("/revenue", getRevenue);
router.get("/commissions", getCommissions);
router.patch(
  "/commissions",
  [body("rate").isFloat({ min: 0, max: 100 }).withMessage("Rate must be between 0 and 100.")],
  validate,
  updateCommission
);

router.get("/payouts", getAllPayouts);
router.patch("/payouts/:id/pay", markPayoutPaid);// ── Moderation ────────────────────────────────────────────────────────────────
router.get("/reviews", getAllReviews);
router.patch("/reviews/:id", moderateReview);
router.delete("/reviews/:id", deleteReview);

export default router;
