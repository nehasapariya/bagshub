import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useFetch } from "../../hooks/useFetch.js";
import { orderService } from "../../services/index.js";

const statusColor = {
  Delivered: "bg-green-100 text-green-700",
  Processing: "bg-yellow-100 text-yellow-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Cancelled: "bg-red-100 text-red-600",
};

export default function MyProfile() {
  const { user, logout } = useAuth();
  const { data } = useFetch(() => orderService.getMy({ limit: 3 }));
  const orders = data?.data || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col sm:flex-row items-center gap-6 mb-8">
        <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-gray-800">{user?.name}</h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-1 capitalize">Role: {user?.role}</p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link to="/profile/edit" className="bg-primary text-white px-4 py-2 rounded-full text-sm hover:bg-amber-700 transition">Edit Profile</Link>
          <Link to="/profile/change-password" className="border border-gray-300 text-gray-600 px-4 py-2 rounded-full text-sm hover:border-primary transition">Change Password</Link>
          <button onClick={logout} className="border border-red-300 text-red-500 px-4 py-2 rounded-full text-sm hover:bg-red-50 transition">Logout</button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="font-semibold text-gray-700 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {[
            { label: "Full Name", value: user?.name },
            { label: "Email", value: user?.email },
            { label: "Phone", value: user?.phone || "—" },
            { label: "Address", value: user?.address || "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-gray-400">{label}</p>
              <p className="text-gray-800 font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      {user?.role === "user" && (
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Recent Orders</h2>
            <Link to="/orders" className="text-primary text-xs hover:underline">View All →</Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-gray-400 text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order._id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-800">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">₹{order.totalAmount?.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[order.status]}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
