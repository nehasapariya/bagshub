import { Router } from "express";
import { body } from "express-validator";
import { getCart, addToCart, updateCartItem, removeFromCart } from "../controllers/cart.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

router.use(protect, restrictTo("user"));

// @route   GET /api/cart
router.get("/", getCart);

// @route   POST /api/cart
router.post(
  "/",
  [
    body("productId").notEmpty().withMessage("productId is required."),
    body("qty").optional().isInt({ min: 1 }).withMessage("qty must be a positive integer."),
  ],
  validate,
  addToCart
);

// @route   PATCH /api/cart/:productId
router.patch(
  "/:productId",
  [body("qty").isInt({ min: 1 }).withMessage("qty must be at least 1.")],
  validate,
  updateCartItem
);

// @route   DELETE /api/cart/:productId
router.delete("/:productId", removeFromCart);

export default router;
