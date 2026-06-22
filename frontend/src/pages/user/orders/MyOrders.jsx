import { Link } from "react-router-dom";
import { useFetch } from "../../../hooks/useFetch.js";
import { orderService } from "../../../services/index.js";

const statusColor = {
  Delivered: "bg-green-100 text-green-700",
  Processing: "bg-yellow-100 text-yellow-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Cancelled: "bg-red-100 text-red-600",
};

export default function MyOrders() {
  const { data, loading } = useFetch(() => orderService.getMy());
  const orders = data?.data || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">📦</p>
          <p className="text-gray-500">No orders yet.</p>
          <Link to="/products" className="mt-4 inline-block bg-primary text-white px-6 py-2.5 rounded-full text-sm hover:bg-amber-700 transition">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl shadow p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <p className="font-bold text-gray-800">{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[order.status]}`}>{order.status}</span>
              </div>

              {order.items?.slice(0, 2).map((item, i) => (
                <div key={i} className="flex gap-3 items-center mb-3">
                  <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{item.name}</p>
                    <p className="text-xs text-gray-400">Color: {item.color} · Qty: {item.qty}</p>
                  </div>
                  <p className="ml-auto font-bold text-primary">₹{(item.price * item.qty)?.toLocaleString()}</p>
                </div>
              ))}

              <hr className="my-3" />
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-800">Total: ₹{order.totalAmount?.toLocaleString()}</p>
                <div className="flex gap-2">
                  <Link to={`/orders/${order._id}`} className="text-sm text-primary border border-primary px-4 py-1.5 rounded-full hover:bg-accent transition">View Details</Link>
                  <Link to={`/orders/${order._id}/track`} className="text-sm bg-primary text-white px-4 py-1.5 rounded-full hover:bg-amber-700 transition">Track</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
