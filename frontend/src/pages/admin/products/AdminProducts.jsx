import { useState } from "react";
import { useFetch } from "../../../hooks/useFetch.js";
import { adminService } from "../../../services/index.js";

const statusBadge = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-600",
};

const FILTERS = ["All", "pending", "approved", "rejected"];

export default function AdminProducts() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const params = {};
  if (filter !== "All") params.status = filter;
  if (search) params.search = search;

  const { data, loading, error, refetch } = useFetch(
    () => adminService.getProducts(params),
    [filter, search]
  );

  const products = data?.data || [];
  const total = data?.total || 0;

  const handleApprove = async (id) => {
    try { await adminService.approveProduct(id); refetch(); } catch {}
  };

  const handleReject = async (id) => {
    try { await adminService.rejectProduct(id); refetch(); } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try { await adminService.deleteProduct(id); refetch(); } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
        <span className="text-sm text-gray-500">{total} products</span>
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm border capitalize transition ${filter === f ? "bg-gray-800 text-white border-gray-800" : "border-gray-300 text-gray-600 hover:border-gray-500"}`}>
            {f}
          </button>
        ))}
      </div>

      <input type="text" placeholder="Search products or vendors..." value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gray-300 rounded-full px-4 py-2 text-sm mb-5 focus:outline-none focus:border-amber-500" />

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Product", "Vendor", "Category", "Price", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=80"} alt={p.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                        <p className="font-medium text-gray-800 truncate max-w-[130px]">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.vendorId?.name || "—"}</td>
                    <td className="px-4 py-3 capitalize text-gray-500">{p.category?.name || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-amber-600">₹{p.price?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusBadge[p.status] || "bg-gray-100 text-gray-500"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {p.status === "pending" && (
                          <>
                            <button onClick={() => handleApprove(p._id)} className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition">Approve</button>
                            <button onClick={() => handleReject(p._id)} className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition">Reject</button>
                          </>
                        )}
                        {p.status === "approved" && (
                          <button onClick={() => handleReject(p._id)} className="text-xs px-2.5 py-1 rounded-full border border-red-300 text-red-500 hover:bg-red-50 transition">Remove</button>
                        )}
                        {p.status === "rejected" && (
                          <button onClick={() => handleApprove(p._id)} className="text-xs px-2.5 py-1 rounded-full border border-green-300 text-green-600 hover:bg-green-50 transition">Re-approve</button>
                        )}
                        <button onClick={() => handleDelete(p._id)} className="text-xs px-2.5 py-1 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 transition">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
