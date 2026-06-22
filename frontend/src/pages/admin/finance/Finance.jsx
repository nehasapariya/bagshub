import { useState } from "react";
import { useFetch } from "../../../hooks/useFetch.js";
import { adminService } from "../../../services/index.js";

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const payoutStatusColor = {
  Paid:    "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

export default function Finance() {
  const [editMode, setEditMode] = useState(false);
  const [tempRate, setTempRate] = useState("");
  const [saving, setSaving] = useState(false);
  const [payingId, setPayingId] = useState(null);

  const { data, loading, error, refetch } = useFetch(() => adminService.getRevenue());
  const { data: pd, loading: pl, refetch: refetchPayouts } = useFetch(() => adminService.getPayouts());
  const d = data?.data;
  const payoutsData = pd?.data;

  const monthly    = d?.monthly || [];
  const maxRevenue = Math.max(...monthly.map((m) => m.revenue), 1);

  const handleSave = async () => {
    setSaving(true);
    try { await adminService.updateCommission(Number(tempRate)); setEditMode(false); refetch(); }
    catch {} finally { setSaving(false); }
  };

  const handleMarkPaid = async (id) => {
    setPayingId(id);
    try { await adminService.markPayoutPaid(id); refetchPayouts(); }
    catch {} finally { setPayingId(null); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Finance & Revenue</h1>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Platform Revenue", value: d ? `₹${(d.totalRevenue / 100000).toFixed(2)}L` : "—", icon: "💰", color: "bg-emerald-50 border-emerald-200" },
          { label: "Total Commission Earned", value: d ? `₹${(d.totalCommission / 1000).toFixed(1)}K` : "—", icon: "📈", color: "bg-blue-50 border-blue-200" },
          { label: "Commission Rate", value: d ? `${d.commissionRate}%` : "—", icon: "⚙️", color: "bg-amber-50 border-amber-200" },
        ].map((s) => (
          <div key={s.label} className={`${s.color} border rounded-xl p-5`}>
            <div className="text-3xl mb-2">{s.icon}</div>
            <p className="text-2xl font-bold text-gray-800">{loading ? "..." : s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Commission Settings */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">Commission Settings</h2>
          {!editMode
            ? <button onClick={() => { setTempRate(d?.commissionRate || ""); setEditMode(true); }}
                className="text-sm text-amber-600 border border-amber-300 px-4 py-1.5 rounded-full hover:bg-amber-50 transition">Edit</button>
            : <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving}
                  className="text-sm bg-gray-800 text-white px-4 py-1.5 rounded-full hover:bg-gray-700 transition disabled:opacity-60">
                  {saving ? "Saving..." : "Save"}
                </button>
                <button onClick={() => setEditMode(false)} className="text-sm border border-gray-300 text-gray-500 px-4 py-1.5 rounded-full hover:bg-gray-50 transition">Cancel</button>
              </div>
          }
        </div>
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">Platform takes <strong>{d?.commissionRate ?? "..."}%</strong> commission on every sale.</p>
          {editMode && (
            <div className="flex items-center gap-2">
              <input type="number" min={1} max={30} step={0.5} value={tempRate}
                onChange={(e) => setTempRate(e.target.value)}
                className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500" />
              <span className="text-sm text-gray-500">%</span>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-5">Monthly Revenue</h2>
        {loading ? (
          <div className="h-44 bg-gray-100 rounded-lg animate-pulse" />
        ) : monthly.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">No revenue data yet.</p>
        ) : (
          <div className="flex items-end gap-4 h-44">
            {monthly.map((m) => (
              <div key={`${m._id.year}-${m._id.month}`} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">₹{(m.revenue / 1000).toFixed(0)}k</span>
                <div className="w-full bg-amber-500 rounded-t-lg" style={{ height: `${(m.revenue / maxRevenue) * 100}%`, minHeight: "4px" }} />
                <span className="text-xs text-gray-500">{MONTHS[m._id.month]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="font-bold text-gray-800">Monthly Breakdown</h2>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Month", "Gross Revenue", "Commission Earned", "Net to Vendors"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthly.map((m) => {
                  const commission = (m.revenue * (d?.commissionRate || 0)) / 100;
                  return (
                    <tr key={`${m._id.year}-${m._id.month}`} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 font-medium text-gray-700">{MONTHS[m._id.month]} {m._id.year}</td>
                      <td className="px-5 py-3 font-semibold text-amber-600">₹{m.revenue.toLocaleString()}</td>
                      <td className="px-5 py-3 text-green-600 font-medium">₹{commission.toFixed(0)}</td>
                      <td className="px-5 py-3 text-gray-600">₹{(m.revenue - commission).toFixed(0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Vendor Payout Requests */}
      <div className="bg-white rounded-xl shadow overflow-hidden mt-6">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Vendor Payout Requests</h2>
          <div className="flex gap-2 text-sm">
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
              Pending: ₹{payoutsData?.totalPending?.toLocaleString() || 0}
            </span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              Paid: ₹{payoutsData?.totalPaid?.toLocaleString() || 0}
            </span>
          </div>
        </div>
        {pl ? (
          <div className="p-5 space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : !payoutsData?.payouts?.length ? (
          <p className="text-gray-400 text-sm text-center py-10">No payout requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Vendor", "Amount", "Requested On", "Status", "Action"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payoutsData.payouts.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{p.vendorId?.name}</p>
                      <p className="text-xs text-gray-400">{p.vendorId?.email}</p>
                    </td>
                    <td className="px-5 py-3 font-bold text-amber-600">₹{p.amount?.toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${payoutStatusColor[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      {p.status === "Pending" && (
                        <button
                          disabled={payingId === p._id}
                          onClick={() => handleMarkPaid(p._id)}
                          className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-full hover:bg-green-700 transition disabled:opacity-50">
                          {payingId === p._id ? "Processing..." : "Mark as Paid"}
                        </button>
                      )}
                      {p.status === "Paid" && (
                        <span className="text-xs text-gray-400">Paid on {new Date(p.paidAt).toLocaleDateString()}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
