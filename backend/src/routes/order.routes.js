import { Router } from "express";
import { body } from "express-validator";
import {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from "../controllers/order.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

router.use(protect, restrictTo("user"));

// POST /api/orders — place order from cart
router.post(
  "/",
  [
    body("shippingAddress.name").notEmpty().withMessage("Recipient name is required."),
    body("shippingAddress.phone").notEmpty().withMessage("Phone is required."),
    body("shippingAddress.address").notEmpty().withMessage("Address is required."),
    body("shippingAddress.city").notEmpty().withMessage("City is required."),
    body("shippingAddress.state").notEmpty().withMessage("State is required."),
    body("shippingAddress.pincode").notEmpty().withMessage("Pincode is required."),
  ],
  validate,
  placeOrder
);

// GET /api/orders/my — all orders for logged-in user
router.get("/my", getMyOrders);

// GET /api/orders/:id — single order detail
router.get("/:id", getOrderById);

// PATCH /api/orders/:id/cancel — user cancels (only if Pending)
router.patch("/:id/cancel", cancelOrder);

export default router;
