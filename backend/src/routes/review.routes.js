import { Router } from "express";
import { body } from "express-validator";
import { addReview, getProductReviews, deleteReview } from "../controllers/review.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

// @route   GET /api/reviews/:productId  — Public
router.get("/:productId", getProductReviews);

// Protected routes below
router.use(protect, restrictTo("user"));

// @route   POST /api/reviews
router.post(
  "/",
  [
    body("productId").notEmpty().withMessage("productId is required."),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5."),
    body("comment").optional().isLength({ max: 500 }).withMessage("Comment max 500 characters."),
  ],
  validate,
  addReview
);

// @route   DELETE /api/reviews/:id
router.delete("/:id", deleteReview);

export default router;
