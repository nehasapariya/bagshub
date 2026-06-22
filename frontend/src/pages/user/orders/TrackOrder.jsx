import { useParams, Link } from "react-router-dom";
import { useFetch } from "../../../hooks/useFetch.js";
import { orderService } from "../../../services/index.js";

const STEPS = ["Pending", "Confirmed", "Shipped", "Delivered"];

export default function TrackOrder() {
  const { id } = useParams();
  const { data, loading } = useFetch(() => orderService.getById(id), [id]);
  const order = data?.data;

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">Loading...</div>;
  if (!order) return <div className="max-w-2xl mx-auto px-4 py-20 text-center"><p className="text-gray-500">Order not found.</p></div>;

  const timeline = order.timeline || [];
  const completedStatuses = timeline.map((t) => t.status);
  const currentIdx = STEPS.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link to={`/orders/${order._id}`} className="text-primary text-sm hover:underline">← Back to Order Details</Link>
      <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-2">Track Order</h1>
      <p className="text-sm text-gray-500 mb-8">Order ID: <span className="font-medium text-gray-700">#{order._id.slice(-8).toUpperCase()}</span></p>

      <div className="bg-white rounded-xl shadow p-6">
        {STEPS.map((step, i) => {
          const done = i <= currentIdx && order.status !== "Cancelled";
          const event = timeline.find((t) => t.status === step);
          return (
            <div key={step} className="flex gap-4 mb-6 last:mb-0">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${done ? "bg-primary text-white" : "bg-gray-100 text-gray-400 border border-gray-200"}`}>
                  {done ? "✓" : i + 1}
                </div>
                {i < STEPS.length - 1 && <div className={`w-0.5 flex-1 mt-1 ${done && i < currentIdx ? "bg-primary" : "bg-gray-200"}`} style={{ minHeight: "24px" }} />}
              </div>
              <div className="pb-2">
                <p className={`font-semibold text-sm ${done ? "text-gray-800" : "text-gray-400"}`}>{step}</p>
                {event?.timestamp && <p className="text-xs text-gray-400 mt-0.5">{new Date(event.timestamp).toLocaleString()}</p>}
              </div>
            </div>
          );
        })}

        {order.status === "Cancelled" && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm">
            ❌ This order was cancelled.
          </div>
        )}
      </div>
    </div>
  );
}
