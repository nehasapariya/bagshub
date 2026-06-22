import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes      from "./routes/auth.routes.js";
import userRoutes      from "./routes/user.routes.js";
import productRoutes   from "./routes/product.routes.js";
import categoryRoutes  from "./routes/category.routes.js";
import wishlistRoutes  from "./routes/wishlist.routes.js";
import cartRoutes      from "./routes/cart.routes.js";
import orderRoutes     from "./routes/order.routes.js";
import reviewRoutes    from "./routes/review.routes.js";
import vendorRoutes    from "./routes/vendor.routes.js";
import adminRoutes     from "./routes/admin.routes.js";

import errorHandler from "./middlewares/error.middleware.js";
import AppError from "./utils/AppError.js";

const app = express();

// ── Global Middlewares ───────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",       authRoutes);
app.use("/api/user",       userRoutes);
app.use("/api/products",   productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/wishlist",   wishlistRoutes);
app.use("/api/cart",       cartRoutes);
app.use("/api/orders",     orderRoutes);
app.use("/api/reviews",    reviewRoutes);
app.use("/api/vendor",     vendorRoutes);
app.use("/api/admin",      adminRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) =>
  res.status(200).json({ success: true, message: "BagsHub API is running." })
);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.all("/{*path}", (req, res, next) =>
  next(new AppError(`Route ${req.originalUrl} not found.`, 404))
);

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
