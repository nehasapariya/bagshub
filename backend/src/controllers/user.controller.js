import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Review from "../models/Review.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /api/user/dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [totalOrders, recentOrders, recentlyReviewed] = await Promise.all([
    Order.countDocuments({ userId }),
    Order.find({ userId }).sort({ createdAt: -1 }).limit(3).select("status totalAmount createdAt items"),
    Review.find({ userId }).sort({ createdAt: -1 }).limit(3).populate("productId", "name images price"),
  ]);

  const recommended = await Product.find({ status: "approved", isFeatured: true })
    .limit(6)
    .populate("category", "name icon")
    .select("name price originalPrice images rating numReviews category");

  const trending = await Product.find({ status: "approved" })
    .sort({ sold: -1 })
    .limit(6)
    .populate("category", "name icon")
    .select("name price originalPrice images rating numReviews sold category");

  res.status(200).json({
    success: true,
    data: { totalOrders, recentOrders, recentlyReviewed, recommended, trending },
  });
});
