import { useState } from "react";
import { useFetch } from "../../../hooks/useFetch.js";
import { adminService } from "../../../services/index.js";

const FILTERS = ["All", "pending", "approved", "reported"];

const statusBadge = {
  approved: "bg-green-100 text-green-700",
  pending:  "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-600",
};

export default function Moderation() {
  const [filter, setFilter] = useState("All");
  const [actionId, setActionId] = useState(null);
  const [actionError, setActionError] = useState("");

  const { data, loading, error, refetch } = useFetch(
    () => {
      const p = {};
      if (filter === "reported") p.reported = "true";
      else if (filter !== "All") p.status = filter;
      return adminService.getReviews(p);
    },
    [filter]
  );

  const reviews = data?.data || [];
  const total = data?.total || 0;

  const handleModerate = async (id, update) => {
    setActionId(id);
    setActionError("");
    try {
      await adminService.moderateReview(id, update);
      refetch();
    } catch (err) {
      setActionError(err.response?.data?.message || "Action failed.");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    setActionId(id);
    setActionError("");
    try {
      await adminService.deleteReview(id);
      refetch();
    } catch (err) {
      setActionError(err.response?.data?.message || "Delete failed.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Content Moderation</h1>
        <span className="text-sm text-gray-500">{total} reviews</span>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {actionError && <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-lg">{actionError}</p>}

      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm border capitalize transition ${filter === f ? "bg-gray-800 text-white border-gray-800" : "border-gray-300 text-gray-600 hover:border-gray-500"}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📝</p>
          <p>No reviews in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className={`bg-white rounded-xl shadow p-5 ${r.isReported ? "border-l-4 border-red-400" : ""}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                    {r.userId?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{r.userId?.name}</p>
                    <p className="text-xs text-gray-400">{r.productId?.name} · {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.isReported && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">🚨 Reported</span>}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusBadge[r.status] || "bg-gray-100 text-gray-500"}`}>{r.status}</span>
                </div>
              </div>

              <div className="flex gap-0.5 mb-2">
                {[1,2,3,4,5].map((s) => <span key={s} className={`text-sm ${s <= r.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>)}
              </div>

              <p className="text-sm text-gray-600 mb-4 bg-gray-50 rounded-lg px-4 py-3">{r.comment}</p>

              <div className="flex gap-2 flex-wrap pt-3 border-t">
                {r.status === "pending" && (
                  <button disabled={actionId === r._id} onClick={() => handleModerate(r._id, { status: "approved" })}
                    className="text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition disabled:opacity-50">
                    Approve
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button disabled={actionId === r._id} onClick={() => handleModerate(r._id, { status: "rejected" })}
                    className="text-xs px-3 py-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition disabled:opacity-50">
                    Reject
                  </button>
                )}
                {r.status === "rejected" && (
                  <button disabled={actionId === r._id} onClick={() => handleModerate(r._id, { status: "approved" })}
                    className="text-xs px-3 py-1.5 rounded-full border border-green-300 text-green-600 hover:bg-green-50 transition disabled:opacity-50">
                    Re-approve
                  </button>
                )}
                {r.isReported && (
                  <button disabled={actionId === r._id} onClick={() => handleModerate(r._id, { isReported: false })}
                    className="text-xs px-3 py-1.5 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 transition disabled:opacity-50">
                    Dismiss Report
                  </button>
                )}
                <button disabled={actionId === r._id} onClick={() => handleDelete(r._id)}
                  className="text-xs px-3 py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition ml-auto disabled:opacity-50">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
