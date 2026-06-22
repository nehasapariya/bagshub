import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFetch } from "../../../hooks/useFetch.js";
import { vendorService } from "../../../services/index.js";

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
};

const nextStatus = { Pending: "Confirmed", Confirmed: "Shipped", Shipped: "Delivered" };

export default function VendorOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);

  const { data, loading, error, refetch } = useFetch(() => vendorService.getOrderById(id), [id]);
  const order = data?.data;

  const handleStatusUpdate = async (status) => {
    setUpdating(true);
    try {
      await vendorService.updateOrderStatus(id, status);
      refetch();
    } catch {}
    finally { setUpdating(false); }
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Loading...</div>;
  if (error || !order) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Order not found.</p>
      <button onClick={() => navigate(-1)} className="text-primary mt-3 inline-block hover:underline text-sm">← Back</button>
    </div>
  );

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="text-primary text-sm hover:underline mb-5 block">← Back to Orders</button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Order #{order._id.slice(-8).toUpperCase()}</h1>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColor[order.status]}`}>{order.status}</span>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl shadow p-5 mb-4">
        <h2 className="font-semibold text-gray-700 mb-4">Items</h2>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex gap-4 items-center">
              <img src={item.image || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=80"} alt={item.name}
                className="w-16 h-16 object-cover rounded-lg shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-gray-800">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">Qty: {item.qty} · Color: {item.color || "—"}</p>
              </div>
              <p className="font-bold text-primary text-lg">₹{(item.price * item.qty)?.toLocaleString()}</p>
            </div>
          ))}
        </div>
        <hr className="my-3" />
        <div className="flex justify-between font-bold text-gray-800">
          <span>Total</span>
          <span>₹{order.totalAmount?.toLocaleString()}</span>
        </div>
      </div>

      {/* Customer */}
      <div className="bg-white rounded-xl shadow p-5 mb-4">
        <h2 className="font-semibold text-gray-700 mb-3">Customer Details</h2>
        <div className="space-y-1 text-sm text-gray-600">
          <p><span className="font-medium text-gray-700">Name:</span> {order.userId?.name}</p>
          <p><span className="font-medium text-gray-700">Email:</span> {order.userId?.email}</p>
          <p><span className="font-medium text-gray-700">Phone:</span> {order.userId?.phone || "—"}</p>
          <p><span className="font-medium text-gray-700">Ordered:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shippingAddress && (
        <div className="bg-white rounded-xl shadow p-5 mb-4">
          <h2 className="font-semibold text-gray-700 mb-3">Shipping Address</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</p>
            <p>📞 {order.shippingAddress.phone}</p>
          </div>
        </div>
      )}

      {/* Update Status */}
      {nextStatus[order.status] && (
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold text-gray-700 mb-4">Update Status</h2>
          <button
            disabled={updating}
            onClick={() => handleStatusUpdate(nextStatus[order.status])}
            className="w-full bg-primary text-white py-3 rounded-full font-medium hover:bg-amber-700 transition disabled:opacity-60">
            {updating ? "Updating..." : `Mark as ${nextStatus[order.status]}`}
          </button>
        </div>
      )}
      {order.status === "Delivered" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center text-green-700 font-medium">
          ✅ This order has been delivered.
        </div>
      )}
    </div>
  );
}
