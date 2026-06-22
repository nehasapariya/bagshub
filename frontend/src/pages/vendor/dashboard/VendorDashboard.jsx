import { Link } from "react-router-dom";
import { useFetch } from "../../../hooks/useFetch.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import { vendorService } from "../../../services/index.js";

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
};

export default function VendorDashboard() {
  const { user } = useAuth();
  const { data, loading } = useFetch(() => vendorService.getDashboard());
  const d = data?.data;

  const stats = [
    { label: "Total Revenue", value: d ? `₹${d.totalRevenue?.toLocaleString()}` : "—", icon: "💰", color: "bg-green-50 border-green-200", to: "/vendor/earnings" },
    { label: "Total Orders",  value: d?.totalOrders  ?? "—", icon: "🛒", color: "bg-blue-50 border-blue-200",   to: "/vendor/orders" },
    { label: "Pending Orders",value: d?.pendingOrders ?? "—", icon: "⏳", color: "bg-yellow-50 border-yellow-200", to: "/vendor/orders" },
    { label: "Products",      value: d?.totalProducts ?? "—", icon: "👜", color: "bg-purple-50 border-purple-200", to: "/vendor/products" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your store today.</p>
        </div>
        <Link to="/vendor/products/add" className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-amber-700 transition">
          + Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className={`${s.color} border rounded-xl p-5 hover:shadow-md transition`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <p className="text-2xl font-bold text-gray-800">{loading ? "..." : s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Low Stock Alert */}
      {!loading && d?.lowStockProducts?.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 flex items-center justify-between mb-8">
          <p className="text-orange-700 text-sm">
            ⚠️ <strong>{d.lowStockProducts.length} product{d.lowStockProducts.length > 1 ? "s" : ""}</strong> running low on stock.
          </p>
          <Link to="/vendor/inventory" className="text-orange-700 text-sm font-medium underline">Manage Inventory →</Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Recent Orders</h2>
            <Link to="/vendor/orders" className="text-primary text-xs hover:underline">View All →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {(d?.recentOrders || []).map((order) => (
                <div key={order._id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-lg shrink-0">🛒</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">#{order._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{order.userId?.name} · {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">₹{order.totalAmount?.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[order.status]}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Top Selling Products</h2>
            <Link to="/vendor/products" className="text-primary text-xs hover:underline">View All →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {(d?.topProducts || []).map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-300 w-5 shrink-0">#{i + 1}</span>
                  <img src={p.images?.[0] || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=80"} alt={p.name}
                    className="w-10 h-10 object-cover rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.sold || 0} sold · {p.stock} in stock</p>
                  </div>
                  <p className="text-sm font-bold text-primary shrink-0">₹{p.price?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
