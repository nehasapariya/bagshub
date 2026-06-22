import { Link } from "react-router-dom";
import { useFetch } from "../../../hooks/useFetch.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import { useStore } from "../../../context/StoreContext.jsx";
import { orderService, productService } from "../../../services/index.js";
import BagCard from "../../../components/BagCard.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const { wishlist, cartCount } = useStore();

  const { data: ordersData } = useFetch(() => orderService.getMy());
  const { data: featuredData } = useFetch(() => productService.getAll({ sort: "rating", limit: 6 }));

  const orders = ordersData?.data || [];
  const featured = featuredData?.data || [];

  const stats = [
    { label: "Orders",     value: orders.length, icon: "📦", to: "/orders" },
    { label: "Wishlist",   value: wishlist.length, icon: "❤️", to: "/wishlist" },
    { label: "Cart Items", value: cartCount,      icon: "🛒", to: "/cart" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-100 rounded-2xl p-6 flex items-center gap-5 mb-10">
        <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold border-4 border-white shadow shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name?.split(" ")[0]}! 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Discover your next favourite bag today.</p>
        </div>
        <div className="ml-auto hidden sm:flex gap-3">
          <Link to="/wishlist" className="bg-white border border-gray-200 px-4 py-2 rounded-full text-sm text-gray-700 hover:border-primary transition">
            ❤️ Wishlist ({wishlist.length})
          </Link>
          <Link to="/cart" className="bg-primary text-white px-4 py-2 rounded-full text-sm hover:bg-primary-dark transition">
            🛒 Cart
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="bg-white rounded-xl shadow p-4 text-center hover:shadow-md transition">
            <div className="text-3xl mb-1">{s.icon}</div>
            <p className="text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      {orders.length > 0 && (
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
            <Link to="/orders" className="text-primary text-sm hover:underline">View All →</Link>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()} · {order.items?.length} item(s)</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">₹{order.totalAmount?.toLocaleString()}</p>
                  <span className="text-xs text-gray-500">{order.status}</span>
                </div>
                <Link to={`/orders/${order._id}`} className="text-xs text-primary border border-primary px-3 py-1.5 rounded-full hover:bg-accent transition shrink-0">
                  View
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">🔥 Featured Bags</h2>
          <Link to="/products" className="text-primary text-sm hover:underline">View All →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {featured.map((bag) => <BagCard key={bag._id} bag={bag} />)}
        </div>
      </section>
    </div>
  );
}
