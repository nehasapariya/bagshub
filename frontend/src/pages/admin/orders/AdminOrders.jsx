import { useState } from "react";
import { useFetch } from "../../../hooks/useFetch.js";
import { adminService } from "../../../services/index.js";

const ALL_STATUSES = ["All", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const statusColor = {
  Pending:   "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Shipped:   "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
};

const NEXT_STATUS = { Pending: "Confirmed", Confirmed: "Shipped", Shipped: "Delivered" };

export default function AdminOrders() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState(null);

  const params = {};
  if (filter !== "All") params.status = filter;
  if (search) params.search = search;

  const { data, loading, error, refetch } = useFetch(
    () => adminService.getOrders(params),
    [filter, search]
  );

  const orders = data?.data || [];
  const total = data?.total || 0;

  const handleStatusUpdate = async (id, status) => {
    setActionId(id);
    try { await adminService.updateOrderStatus(id, status); refetch(); }
    catch {}
    finally { setActionId(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Orders</h1>
        <span className="text-sm text-gray-500">{total} total orders</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {ALL_STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm border transition ${filter === s ? "bg-gray-800 text-white border-gray-800" : "border-gray-300 text-gray-600 hover:border-gray-500"}`}>
            {s}
          </button>
        ))}
      </div>

      <input type="text" placeholder="Search by order ID or customer..." value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gray-300 rounded-full px-4 py-2 text-sm mb-5 focus:outline-none focus:border-amber-500" />

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>No {filter !== "All" ? filter.toLowerCase() : ""} orders found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-white rounded-xl shadow p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-bold text-gray-800">#{o._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(o.createdAt).toLocaleDateString()} · {o.userId?.name} · {o.userId?.email}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[o.status] || "bg-gray-100 text-gray-600"}`}>{o.status}</span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 text-sm text-gray-600">
                  {o.items?.length} item(s) · {o.items?.map((i) => i.name).join(", ").slice(0, 60)}
                  {o.items?.map((i) => i.name).join(", ").length > 60 ? "..." : ""}
                </div>
                <p className="font-bold text-amber-600 shrink-0">₹{o.totalAmount?.toLocaleString()}</p>
              </div>

              {NEXT_STATUS[o.status] && (
                <div className="pt-3 border-t flex gap-2">
                  <button disabled={actionId === o._id}
                    onClick={() => handleStatusUpdate(o._id, NEXT_STATUS[o.status])}
                    className="bg-gray-800 text-white px-5 py-2 rounded-full text-sm hover:bg-gray-700 transition disabled:opacity-60">
                    {actionId === o._id ? "Updating..." : `Mark as ${NEXT_STATUS[o.status]}`}
                  </button>
                  <button disabled={actionId === o._id}
                    onClick={() => handleStatusUpdate(o._id, "Cancelled")}
                    className="border border-red-300 text-red-500 px-5 py-2 rounded-full text-sm hover:bg-red-50 transition disabled:opacity-60">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
