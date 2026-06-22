import { Router } from "express";
import { getDashboard } from "../controllers/user.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const router = Router();

// @route   GET /api/user/dashboard
// @access  Private (user)
router.get("/dashboard", protect, restrictTo("user"), getDashboard);

export default router;
