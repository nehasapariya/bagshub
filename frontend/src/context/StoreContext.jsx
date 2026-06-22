import { createContext, useContext, useState, useEffect } from "react";
import { cartService, wishlistService } from "../services/index.js";
import { useAuth } from "./AuthContext.jsx";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Load cart + wishlist from API when user logs in
  useEffect(() => {
    if (!user || user.role !== "user") {
      setCart([]);
      setWishlist([]);
      return;
    }
    cartService.get().then(({ data }) => setCart(data.data.items || [])).catch(() => {});
    wishlistService.get().then(({ data }) => setWishlist(data.data.map((p) => p._id) || [])).catch(() => {});
  }, [user]);

  // ── Cart ──────────────────────────────────────────────────────────────────
  const addToCart = async (product, color = product.colors?.[0] || "") => {
    try {
      const { data } = await cartService.add({ productId: product._id, color, qty: 1 });
      setCart(data.data);
    } catch {}
  };

  const buyNow = async (product, color = product.colors?.[0] || "") => {
    try {
      // If already in cart, set qty to 1 exactly instead of incrementing
      const existing = cart.find((i) => i.productId?.toString() === product._id?.toString());
      if (existing) {
        const { data } = await cartService.update(product._id, 1);
        setCart(data.data.items);
      } else {
        const { data } = await cartService.add({ productId: product._id, color, qty: 1 });
        setCart(data.data);
      }
    } catch {}
  };

  const updateQty = async (productId, qty) => {
    if (qty < 1) return removeFromCart(productId);
    try {
      const { data } = await cartService.update(productId, qty);
      setCart(data.data.items);
    } catch {}
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await cartService.remove(productId);
      setCart(data.data.items);
    } catch {}
  };

  const clearCart = () => setCart([]);

  // ── Wishlist ──────────────────────────────────────────────────────────────
  const toggleWishlist = async (productId) => {
    try {
      await wishlistService.toggle(productId);
      setWishlist((prev) =>
        prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
      );
    } catch {}
  };

  // ── Recently Viewed (local only) ──────────────────────────────────────────
  const addRecentlyViewed = (productId) => {
    setRecentlyViewed((prev) => [productId, ...prev.filter((id) => id !== productId)].slice(0, 6));
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <StoreContext.Provider value={{
      cart, wishlist, recentlyViewed,
      addToCart, buyNow, updateQty, removeFromCart, clearCart,
      toggleWishlist, addRecentlyViewed,
      cartTotal, cartCount,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
