import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

// ── GET /api/cart ────────────────────────────────────────────────────────────
export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });

  const totalAmount = cart ? cart.items.reduce((s, i) => s + i.price * i.qty, 0) : 0;
  const totalItems  = cart ? cart.items.reduce((s, i) => s + i.qty, 0) : 0;

  res.status(200).json({
    success: true,
    data: { items: cart?.items || [], totalAmount, totalItems },
  });
});

// ── POST /api/cart ───────────────────────────────────────────────────────────
// body: { productId, color, qty }
export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, color, qty = 1 } = req.body;
  if (!productId) return next(new AppError("productId is required.", 400));

  const product = await Product.findOne({ _id: productId, status: "approved" });
  if (!product) return next(new AppError("Product not found.", 404));
  if (product.stock < qty) return next(new AppError("Insufficient stock.", 400));

  let cart = await Cart.findOne({ userId: req.user.id });

  if (!cart) {
    cart = await Cart.create({
      userId: req.user.id,
      items: [{ productId, name: product.name, image: product.images[0] || "", price: product.price, color: color || "", qty }],
    });
    return res.status(201).json({ success: true, message: "Item added to cart.", data: cart.items });
  }

  const existingIdx = cart.items.findIndex(
    (i) => i.productId.toString() === productId && i.color === (color || "")
  );

  if (existingIdx > -1) {
    cart.items[existingIdx].qty += qty;
  } else {
    cart.items.push({ productId, name: product.name, image: product.images[0] || "", price: product.price, color: color || "", qty });
  }

  await cart.save();
  res.status(200).json({ success: true, message: "Cart updated.", data: cart.items });
});

// ── PATCH /api/cart/:productId ───────────────────────────────────────────────
// body: { qty }
export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { qty } = req.body;
  if (!qty || qty < 1) return next(new AppError("qty must be at least 1.", 400));

  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) return next(new AppError("Cart not found.", 404));

  const item = cart.items.find((i) => i.productId.toString() === req.params.productId);
  if (!item) return next(new AppError("Item not found in cart.", 404));

  item.qty = qty;
  await cart.save();

  const totalAmount = cart.items.reduce((s, i) => s + i.price * i.qty, 0);
  res.status(200).json({ success: true, data: { items: cart.items, totalAmount } });
});

// ── DELETE /api/cart/:productId ──────────────────────────────────────────────
export const removeFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) return next(new AppError("Cart not found.", 404));

  cart.items = cart.items.filter((i) => i.productId.toString() !== req.params.productId);
  await cart.save();

  const totalAmount = cart.items.reduce((s, i) => s + i.price * i.qty, 0);
  res.status(200).json({ success: true, message: "Item removed.", data: { items: cart.items, totalAmount } });
});
