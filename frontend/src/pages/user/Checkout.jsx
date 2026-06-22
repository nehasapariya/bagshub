import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { orderService } from "../../services/index.js";

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "", phone: "", address: "", city: "", state: "", pincode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await orderService.place({ shippingAddress: form });
      clearCart();
      setPlaced(true);
      setTimeout(() => navigate("/orders"), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  if (placed) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-gray-800">Order Placed Successfully!</h2>
      <p className="text-gray-500 mt-2">Redirecting to your orders...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-bold text-gray-700 mb-5">Delivery Address</h2>
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Full Name", key: "name" },
                  { label: "Phone Number", key: "phone" },
                  { label: "City", key: "city" },
                  { label: "State", key: "state" },
                  { label: "Pincode", key: "pincode" },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="text-sm font-medium text-gray-700">{label}</label>
                    <input required value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Full Address</label>
                <textarea required rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
                💳 Cash on Delivery — no online payment required.
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-full font-medium hover:bg-amber-700 transition disabled:opacity-60">
                {loading ? "Placing Order..." : `Place Order · ₹${cartTotal?.toLocaleString()}`}
              </button>
            </form>
          </div>
        </div>

        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-bold text-gray-700 mb-4">Items ({cart.length})</h2>
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.productId} className="flex gap-3 items-center">
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                  </div>
                  <p className="text-sm font-bold text-primary shrink-0">₹{(item.price * item.qty)?.toLocaleString()}</p>
                </div>
              ))}
            </div>
            <hr className="my-4" />
            <div className="flex justify-between font-bold text-gray-800">
              <span>Total</span><span>₹{cartTotal?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
