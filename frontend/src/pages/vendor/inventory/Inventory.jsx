import { useState } from "react";
import { useFetch } from "../../../hooks/useFetch.js";
import { vendorService } from "../../../services/index.js";

export default function Inventory() {
  const [pendingStock, setPendingStock] = useState({});
  const [savingId, setSavingId] = useState(null);

  const { data, loading, error, refetch } = useFetch(() => vendorService.getInventory());
  const products = data?.data || [];
  const summary  = data?.summary || {};

  const handleStockChange = (id, val) =>
    setPendingStock((prev) => ({ ...prev, [id]: Math.max(0, Number(val)) }));

  const handleSave = async (id) => {
    const stock = pendingStock[id];
    if (stock === undefined) return;
    setSavingId(id);
    try {
      await vendorService.updateStock(id, stock);
      setPendingStock((prev) => { const n = { ...prev }; delete n[id]; return n; });
      refetch();
    } catch {}
    finally { setSavingId(null); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Inventory Management</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Stock",   value: summary.total,      color: "bg-blue-50 border-blue-200" },
          { label: "Low Stock",     value: summary.lowStock,   color: "bg-orange-50 border-orange-200" },
          { label: "Out of Stock",  value: summary.outOfStock, color: "bg-red-50 border-red-200" },
        ].map((s) => (
          <div key={s.label} className={`${s.color} border rounded-xl p-4 text-center`}>
            <p className="text-2xl font-bold text-gray-800">{loading ? "..." : (s.value ?? 0)}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Product", "Category", "Price", "Current Stock", "Update Stock", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((p) => {
                  const currentVal = pendingStock[p._id] !== undefined ? pendingStock[p._id] : p.stock;
                  const isDirty = pendingStock[p._id] !== undefined;
                  return (
                    <tr key={p._id} className={`hover:bg-gray-50 transition ${p.stock === 0 ? "bg-red-50/30" : p.stock <= 10 ? "bg-orange-50/30" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0] || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=80"} alt={p.name}
                            className="w-10 h-10 object-cover rounded-lg shrink-0" />
                          <div>
                            <p className="font-medium text-gray-800 truncate max-w-[130px]">{p.name}</p>
                            {p.stock <= 10 && p.stock > 0 && <p className="text-xs text-orange-500">⚠️ Low stock</p>}
                            {p.stock === 0 && <p className="text-xs text-red-500">❌ Out of stock</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-500">{p.category?.name || "—"}</td>
                      <td className="px-4 py-3 font-semibold text-primary">₹{p.price?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-lg font-bold ${p.stock === 0 ? "text-red-500" : p.stock <= 10 ? "text-orange-500" : "text-gray-800"}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleStockChange(p._id, currentVal - 1)}
                            className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:border-primary hover:text-primary font-bold flex items-center justify-center">−</button>
                          <input type="number" value={currentVal}
                            onChange={(e) => handleStockChange(p._id, e.target.value)}
                            className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:border-primary" />
                          <button onClick={() => handleStockChange(p._id, currentVal + 1)}
                            className="w-7 h-7 rounded-full border border-gray-300 text-gray-600 hover:border-primary hover:text-primary font-bold flex items-center justify-center">+</button>
                          {isDirty && (
                            <button disabled={savingId === p._id} onClick={() => handleSave(p._id)}
                              className="text-xs bg-primary text-white px-3 py-1 rounded-full hover:bg-amber-700 transition disabled:opacity-60">
                              {savingId === p._id ? "..." : "Save"}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          p.stock === 0 ? "bg-red-100 text-red-600" : p.stock <= 10 ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-700"
                        }`}>
                          {p.stock === 0 ? "Out of Stock" : p.stock <= 10 ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
