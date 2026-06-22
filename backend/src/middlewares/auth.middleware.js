import { verifyAccessToken } from "../utils/jwt.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Protect — verify JWT access token
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) throw new AppError("Not authenticated. Please login.", 401);

  const decoded = verifyAccessToken(token);
  const user = await User.findById(decoded.id);

  if (!user) throw new AppError("User no longer exists.", 401);
  if (user.isBlocked) throw new AppError("Your account has been blocked.", 403);

  req.user = user;
  next();
});

// Restrict to specific roles
export const restrictTo = (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action.", 403));
    }
    next();
  };
