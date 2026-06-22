import { useState } from "react";
import { useFetch } from "../../../hooks/useFetch.js";
import { adminService } from "../../../services/index.js";

export default function ManageUsers() {
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const { data, loading, error, refetch } = useFetch(
    () => adminService.getUsers({ role: "user", search }),
    [search]
  );

  const users = data?.data || [];
  const total = data?.total || 0;

  const handleToggleBlock = async (id) => {
    setActionId(id);
    try { await adminService.toggleBlock(id); refetch(); }
    catch (err) { showToast(err.response?.data?.message || "Action failed."); }
    finally { setActionId(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
        <span className="text-sm text-gray-500">{total} total users</span>
      </div>

      <input type="text" placeholder="Search by name or email..." value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gray-300 rounded-full px-4 py-2 text-sm mb-6 focus:outline-none focus:border-amber-500" />

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["User", "Email", "Joined", "Status", "Action"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.isBlocked ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button disabled={actionId === u._id} onClick={() => handleToggleBlock(u._id)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition disabled:opacity-50 ${
                          u.isBlocked
                            ? "border-green-300 text-green-600 hover:bg-green-50"
                            : "border-red-300 text-red-500 hover:bg-red-50"
                        }`}>
                        {actionId === u._id ? "..." : u.isBlocked ? "Unblock" : "Block"}
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
