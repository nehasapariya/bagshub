import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
} from "../controllers/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

// ── Validation rules ────────────────────────────────────────────────────────
const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email").isEmail().withMessage("Valid email is required.").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  body("role").optional().isIn(["user", "vendor", "admin"]).withMessage("Role must be user, vendor or admin."),
];

const loginRules = [
  body("email").isEmail().withMessage("Valid email is required.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
];

const forgotRules = [
  body("email").isEmail().withMessage("Valid email is required.").normalizeEmail(),
];

const resetRules = [
  body("token").notEmpty().withMessage("Reset token is required."),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
];

// ── Routes ──────────────────────────────────────────────────────────────────

// @route   POST /api/auth/register
// @desc    Register a new user (role: user | vendor)
// @access  Public
router.post("/register", registerRules, validate, register);

// @route   POST /api/auth/login
// @desc    Login and receive access token + refresh token cookie
// @access  Public
router.post("/login", loginRules, validate, login);

// @route   POST /api/auth/logout
// @desc    Logout — clears refresh token cookie and DB entry
// @access  Private
router.post("/logout", protect, logout);

// @route   POST /api/auth/refresh-token
// @desc    Issue new access token using refresh token cookie
// @access  Public (uses httpOnly cookie)
router.post("/refresh-token", refreshToken);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post("/forgot-password", forgotRules, validate, forgotPassword);

// @route   POST /api/auth/reset-password
// @desc    Reset password using token from email
// @access  Public
router.post("/reset-password", resetRules, validate, resetPassword);

// @route   GET /api/auth/me
// @desc    Get currently logged-in user profile
// @access  Private (USER | VENDOR | ADMIN)
router.get("/me", protect, getMe);

export default router;
