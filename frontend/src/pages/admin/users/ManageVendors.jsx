import { useState } from "react";
import { useFetch } from "../../../hooks/useFetch.js";
import { adminService } from "../../../services/index.js";

export default function ManageVendors() {
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState(null);

  const { data, loading, error, refetch } = useFetch(
    () => adminService.getUsers({ role: "vendor", search }),
    [search]
  );

  const vendors = data?.data || [];
  const total = data?.total || 0;

  const handleToggleBlock = async (id) => {
    setActionId(id);
    try { await adminService.toggleBlock(id); refetch(); }
    catch {}
    finally { setActionId(null); }
  };

  const blocked = vendors.filter((v) => v.isBlocked).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Vendors</h1>
        <span className="text-sm text-gray-500">{total} vendors</span>
      </div>

      {!loading && blocked > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 mb-6 text-red-700 text-sm">
          🚫 <strong>{blocked}</strong> vendor(s) currently blocked.
        </div>
      )}

      <input type="text" placeholder="Search vendors..." value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gray-300 rounded-full px-4 py-2 text-sm mb-6 focus:outline-none focus:border-amber-500" />

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Vendor", "Email", "Joined", "Status", "Action"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendors.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-bold shrink-0">
                          {v.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{v.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{v.email}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(v.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${v.isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                        {v.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button disabled={actionId === v._id} onClick={() => handleToggleBlock(v._id)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition disabled:opacity-50 ${
                          v.isBlocked
                            ? "border-green-300 text-green-600 hover:bg-green-50"
                            : "border-red-300 text-red-500 hover:bg-red-50"
                        }`}>
                        {actionId === v._id ? "..." : v.isBlocked ? "Unblock" : "Block"}
                      </button>
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
