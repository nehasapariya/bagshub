import { useParams, Link, useNavigate } from "react-router-dom";
import { useFetch } from "../../../hooks/useFetch.js";
import { orderService } from "../../../services/index.js";

const statusColor = {
  Delivered: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Cancelled: "bg-red-100 text-red-600",
};

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading } = useFetch(() => orderService.getById(id), [id]);
  const order = data?.data;

  const handleCancel = async () => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await orderService.cancel(id);
      navigate("/orders");
    } catch (err) {
      alert(err.response?.data?.message || "Cannot cancel this order.");
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-gray-400">Loading...</div>;
  if (!order) return <div className="max-w-3xl mx-auto px-4 py-20 text-center"><p className="text-gray-500">Order not found.</p><Link to="/orders" className="text-primary mt-3 inline-block hover:underline">← Back</Link></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/orders" className="text-primary text-sm hover:underline">← Back to Orders</Link>
      <div className="flex items-center justify-between mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Order #{order._id.slice(-8).toUpperCase()}</h1>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColor[order.status]}`}>{order.status}</span>
      </div>

      <div className="bg-white rounded-xl shadow p-5 mb-5">
        <h2 className="font-semibold text-gray-700 mb-4">Items Ordered</h2>
        {order.items?.map((item, i) => (
          <div key={i} className="flex gap-4 items-center mb-3">
            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
            <div className="flex-1">
              <p className="font-medium text-gray-800">{item.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">Color: {item.color} · Qty: {item.qty}</p>
            </div>
            <p className="font-bold text-primary">₹{(item.price * item.qty)?.toLocaleString()}</p>
          </div>
        ))}
        <hr className="my-4" />
        <div className="flex justify-between font-bold text-gray-800">
          <span>Order Total</span><span>₹{order.totalAmount?.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-5 mb-5">
        <h2 className="font-semibold text-gray-700 mb-2">Delivery Address</h2>
        <p className="text-sm text-gray-600">
          {order.shippingAddress?.name} · {order.shippingAddress?.phone}<br />
          {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
        </p>
      </div>

      <div className="flex gap-3">
        <Link to={`/orders/${order._id}/track`} className="flex-1 text-center bg-primary text-white py-3 rounded-full font-medium hover:bg-amber-700 transition">Track Order</Link>
        {order.status === "Pending" && (
          <button onClick={handleCancel} className="flex-1 border border-red-300 text-red-500 py-3 rounded-full font-medium hover:bg-red-50 transition">Cancel Order</button>
        )}
        {order.status === "Delivered" && (
          <Link to={`/reviews/add/${order.items?.[0]?.productId}`} className="flex-1 text-center border border-primary text-primary py-3 rounded-full font-medium hover:bg-accent transition">Write a Review</Link>
        )}
      </div>
    </div>
  );
}
