import { useState } from "react";
import { Link } from "react-router-dom";
import { useFetch } from "../../../hooks/useFetch.js";
import { vendorService } from "../../../services/index.js";

const ALL_STATUSES = ["All", "Pending", "Confirmed", "Shipped", "Delivered"];

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
};

const nextStatus = { Pending: "Confirmed", Confirmed: "Shipped", Shipped: "Delivered" };

export default function VendorOrders() {
  const [filter, setFilter] = useState("All");
  const [updating, setUpdating] = useState(null);

  const params = filter !== "All" ? { status: filter } : {};
  const { data, loading, error, refetch } = useFetch(
    () => vendorService.getOrders(params),
    [filter]
  );

  const orders = data?.data || [];

  const handleStatusUpdate = async (id, status) => {
    setUpdating(id);
    try {
      await vendorService.updateOrderStatus(id, status);
      refetch();
    } catch {}
    finally { setUpdating(null); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Incoming Orders</h1>

      <div className="flex gap-2 flex-wrap mb-6">
        {ALL_STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm border transition ${filter === s ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600 hover:border-primary"}`}>
            {s}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>No {filter !== "All" ? filter.toLowerCase() : ""} orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-bold text-gray-800">#{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.userId?.name}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[order.status]}`}>{order.status}</span>
              </div>

              <div className="space-y-2 mb-4">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <img src={item.image || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=80"} alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Qty: {item.qty}</p>
                      {order.shippingAddress && (
                        <p className="text-xs text-gray-400">📍 {order.shippingAddress.city}, {order.shippingAddress.state}</p>
                      )}
                    </div>
                    <p className="font-bold text-primary shrink-0">₹{(item.price * item.qty)?.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-3 border-t items-center">
                <p className="text-sm font-bold text-gray-700 mr-auto">Total: ₹{order.totalAmount?.toLocaleString()}</p>
                {nextStatus[order.status] && (
                  <button
                    disabled={updating === order._id}
                    onClick={() => handleStatusUpdate(order._id, nextStatus[order.status])}
                    className="bg-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-amber-700 transition disabled:opacity-60">
                    {updating === order._id ? "Updating..." : `Mark as ${nextStatus[order.status]}`}
                  </button>
                )}
                {order.status === "Delivered" && (
                  <span className="text-green-600 text-sm font-medium">✅ Delivered</span>
                )}
                <Link to={`/vendor/orders/${order._id}`}
                  className="border border-gray-300 text-gray-600 px-5 py-2 rounded-full text-sm hover:border-primary transition">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
