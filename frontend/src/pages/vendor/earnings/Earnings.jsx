import { useFetch } from "../../../hooks/useFetch.js";
import { vendorService } from "../../../services/index.js";

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const payoutStatusColor = {
  Paid:    "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
};

export default function Earnings() {
  const { data: ed, loading: el } = useFetch(() => vendorService.getEarnings());
  const { data: pd, loading: pl } = useFetch(() => vendorService.getPayouts());

  const earnings = ed?.data;
  const payouts  = pd?.data;

  const monthly    = earnings?.monthly || [];
  const maxRevenue = Math.max(...monthly.map((m) => m.revenue), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Earnings & Payouts</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Gross Sales",        value: earnings ? `₹${earnings.totalGross?.toLocaleString()}`       : "—", icon: "🛒", color: "bg-blue-50 border-blue-200" },
          { label: `Commission (${earnings?.commissionRate || 8.5}%)`, value: earnings ? `- ₹${earnings.totalCommission?.toLocaleString()}` : "—", icon: "📉", color: "bg-red-50 border-red-200" },
          { label: "Net Earnings",       value: earnings ? `₹${earnings.totalEarnings?.toLocaleString()}`    : "—", icon: "💰", color: "bg-green-50 border-green-200" },
          { label: "Total Paid Out",     value: payouts  ? `₹${payouts.totalPaid?.toLocaleString()}`         : "—", icon: "✅", color: "bg-purple-50 border-purple-200" },
        ].map((s) => (
          <div key={s.label} className={`${s.color} border rounded-xl p-5`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="text-xl font-bold text-gray-800">{(el || pl) ? "..." : s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Commission Info Banner */}
      {!el && earnings && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 mb-6 flex items-center justify-between">
          <p className="text-amber-800 text-sm">
            Platform commission: <strong>{earnings.commissionRate}%</strong> deducted from gross sales.
            You keep <strong>{(100 - earnings.commissionRate).toFixed(1)}%</strong> of every sale.
          </p>
          <p className="text-amber-800 text-sm font-semibold">
            Net = ₹{earnings.totalEarnings?.toLocaleString()}
          </p>
        </div>
      )}

      {/* Bar Chart */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="font-bold text-gray-800 mb-5">Monthly Net Earnings (after commission)</h2>
        {el ? (
          <div className="h-40 bg-gray-100 rounded-lg animate-pulse" />
        ) : monthly.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">No revenue data yet.</p>
        ) : (
          <div className="flex items-end gap-4 h-40">
            {monthly.map((m) => (
              <div key={`${m._id.year}-${m._id.month}`} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">₹{(m.revenue / 1000).toFixed(1)}k</span>
                <div className="w-full bg-primary rounded-t-lg" style={{ height: `${(m.revenue / maxRevenue) * 100}%`, minHeight: "4px" }} />
                <span className="text-xs text-gray-500">{MONTHS[m._id.month]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Breakdown Table */}
      {!el && monthly.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
          <div className="px-5 py-4 border-b">
            <h2 className="font-bold text-gray-800">Monthly Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Month", "Gross Sales", `Commission (${earnings?.commissionRate}%)`, "Net Earnings", "Orders"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {monthly.map((m) => (
                  <tr key={`${m._id.year}-${m._id.month}`} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium text-gray-700">{MONTHS[m._id.month]} {m._id.year}</td>
                    <td className="px-5 py-3 text-gray-600">₹{m.grossRevenue?.toLocaleString()}</td>
                    <td className="px-5 py-3 text-red-500">- ₹{m.commission?.toLocaleString()}</td>
                    <td className="px-5 py-3 font-bold text-green-600">₹{m.revenue?.toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-500">{m.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payout History */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Payout History</h2>
          {payouts && (
            <span className="text-xs text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full font-medium">
              Pending: ₹{payouts.totalPending?.toLocaleString()}
            </span>
          )}
        </div>
        {pl ? (
          <div className="p-5 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : !payouts?.payouts?.length ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">💸</p>
            <p className="text-sm">No payouts yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Payout ID", "Date", "Amount", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.payouts.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3 font-medium text-gray-700">#{p._id.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3 font-bold text-primary">₹{p.amount?.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${payoutStatusColor[p.status] || "bg-gray-100 text-gray-500"}`}>
                        {p.status}
                      </span>
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
