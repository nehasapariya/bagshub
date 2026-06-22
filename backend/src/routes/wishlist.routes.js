import { Router } from "express";
import { body } from "express-validator";
import { getWishlist, toggleWishlist, removeFromWishlist } from "../controllers/wishlist.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

router.use(protect, restrictTo("user"));

// @route   GET /api/wishlist
router.get("/", getWishlist);

// @route   POST /api/wishlist  — toggle add/remove
router.post(
  "/",
  [body("productId").notEmpty().withMessage("productId is required.")],
  validate,
  toggleWishlist
);

// @route   DELETE /api/wishlist/:productId
router.delete("/:productId", removeFromWishlist);

export default router;
