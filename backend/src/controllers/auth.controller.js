import crypto from "crypto";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../utils/jwt.js";
import { sendPasswordResetEmail } from "../utils/email.js";

// ─── Helper ────────────────────────────────────────────────────────────────
const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Persist hashed refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setRefreshTokenCookie(res, refreshToken);

  res.status(statusCode).json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    },
  });
};

// ─── POST /api/auth/register ────────────────────────────────────────────────
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, adminCode } = req.body;

  // Admin role requires secret code
  // if (role === "admin") {
  //   if (adminCode !== process.env.ADMIN_SECRET_CODE) {
  //     return next(new AppError("Invalid admin secret code.", 403));
  //   }
  // }

  const assignedRole = ["user", "vendor", "admin"].includes(role) ? role : "user";
  const user = await User.create({ name, email, password, role: assignedRole });
  await sendTokenResponse(user, 201, res);
});

// ─── POST /api/auth/login ───────────────────────────────────────────────────
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid email or password.", 401));
  }

  if (user.isBlocked) {
    return next(new AppError("Your account has been blocked. Contact support.", 403));
  }

  
  await sendTokenResponse(user, 200, res);
});

// ─── POST /api/auth/logout ──────────────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  // Clear refresh token from DB
  await User.findByIdAndUpdate(req.user.id, { refreshToken: "" });
  clearRefreshTokenCookie(res);

  res.status(200).json({ success: true, message: "Logged out successfully." });
});

// ─── POST /api/auth/refresh-token ──────────────────────────────────────────
export const refreshToken = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.refreshToken;
  if (!token) return next(new AppError("No refresh token provided.", 401));

  const decoded = verifyRefreshToken(token);
  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user || user.refreshToken !== token) {
    return next(new AppError("Invalid refresh token. Please login again.", 401));
  }

  const newAccessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });
  setRefreshTokenCookie(res, newRefreshToken);

  res.status(200).json({ success: true, accessToken: newAccessToken });
});

// ─── POST /api/auth/forgot-password ────────────────────────────────────────
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError("No account found with that email.", 404));

  // Generate raw token, store hashed
  const rawToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;

  try {
    await sendPasswordResetEmail(user.email, resetURL);
    res.status(200).json({ success: true, message: "Password reset link sent to your email." });
  } catch {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("Failed to send email. Try again later.", 500));
  }
});

// ─── POST /api/auth/reset-password ─────────────────────────────────────────
export const resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.body.token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) return next(new AppError("Token is invalid or has expired.", 400));

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  await sendTokenResponse(user, 200, res);
});

// ─── GET /api/auth/me ───────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
});
