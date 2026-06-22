import { Link } from "react-router-dom";
import { useFetch } from "../../../hooks/useFetch.js";
import { adminService } from "../../../services/index.js";

const statusColor = {
  Pending:   "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Shipped:   "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
};

export default function AdminDashboard() {
  const { data, loading } = useFetch(() => adminService.getDashboard());
  const d = data?.data;

  const stats = [
    { label: "Total Users",       value: d?.totalUsers,       icon: "👥", color: "bg-blue-50 border-blue-200",     to: "/admin/users" },
    { label: "Total Vendors",     value: d?.totalVendors,     icon: "🏪", color: "bg-purple-50 border-purple-200", to: "/admin/vendors" },
    { label: "Total Products",    value: d?.totalProducts,    icon: "👜", color: "bg-amber-50 border-amber-200",   to: "/admin/products" },
    { label: "Total Orders",      value: d?.totalOrders,      icon: "🛒", color: "bg-green-50 border-green-200",   to: "/admin/orders" },
    { label: "Platform Revenue",  value: d ? `₹${(d.totalRevenue / 100000).toFixed(1)}L` : "—", icon: "💰", color: "bg-emerald-50 border-emerald-200", to: "/admin/finance" },
    { label: "Pending Approvals", value: d?.pendingProducts,  icon: "⏳", color: "bg-orange-50 border-orange-200", to: "/admin/products" },
    { label: "Pending Reviews",   value: d?.pendingReviews,   icon: "📝", color: "bg-rose-50 border-rose-200",     to: "/admin/reviews" },
    { label: "Reported Reviews",  value: d?.reportedReviews,  icon: "🚨", color: "bg-red-50 border-red-200",       to: "/admin/reviews" },
  ];

  const monthly = d?.monthlyRevenue || [];
  const maxRevenue = Math.max(...monthly.map((m) => m.revenue), 1);

  const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Platform overview — BagsHub</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className={`${s.color} border rounded-xl p-4 hover:shadow-md transition`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="text-xl font-bold text-gray-800">{loading ? "..." : (s.value ?? "0")}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-800">Monthly Revenue</h2>
            <Link to="/admin/finance" className="text-xs text-amber-600 hover:underline">View Finance →</Link>
          </div>
          {loading ? (
            <div className="h-36 bg-gray-100 rounded-lg animate-pulse" />
          ) : monthly.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-10">No revenue data yet.</p>
          ) : (
            <div className="flex items-end gap-3 h-36">
              {monthly.map((m) => (
                <div key={`${m._id.year}-${m._id.month}`} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-400">₹{(m.revenue / 1000).toFixed(0)}k</span>
                  <div className="w-full bg-amber-500 rounded-t-md" style={{ height: `${(m.revenue / maxRevenue) * 100}%`, minHeight: "4px" }} />
                  <span className="text-xs text-gray-500">{MONTHS[m._id.month]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Pending Approvals</h2>
            <Link to="/admin/products" className="text-xs text-amber-600 hover:underline">View All →</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
          ) : !d?.pendingProducts ? (
            <p className="text-gray-400 text-sm text-center py-8">No pending approvals</p>
          ) : (
            <p className="text-center py-8">
              <span className="text-3xl font-bold text-orange-500">{d.pendingProducts}</span>
              <span className="block text-sm text-gray-500 mt-1">products awaiting review</span>
              <Link to="/admin/products?status=pending" className="mt-3 inline-block text-sm text-primary hover:underline">Review Now →</Link>
            </p>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs text-amber-600 hover:underline">View All →</Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Order ID", "Customer", "Items", "Amount", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(d?.recentOrders || []).map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-700">#{o._id.slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3 text-gray-600">{o.userId?.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{o.items?.length} item(s)</td>
                    <td className="px-4 py-3 font-semibold text-amber-600">₹{o.totalAmount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[o.status] || "bg-gray-100 text-gray-600"}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
