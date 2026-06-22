import { useState } from "react";
import { Link } from "react-router-dom";
import { useFetch } from "../../../hooks/useFetch.js";
import { vendorService } from "../../../services/index.js";

const statusBadge = {
  approved: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  rejected: "bg-red-100 text-red-600",
};

export default function MyProducts() {
  const [search, setSearch] = useState("");
  const { data, loading, error, refetch } = useFetch(() => vendorService.getProducts());

  const products = data?.data || [];
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await vendorService.deleteProduct(id);
      refetch();
    } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Products</h1>
        <Link to="/vendor/products/add" className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-amber-700 transition">
          + Add Product
        </Link>
      </div>

      <input type="text" placeholder="Search products..." value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gray-300 rounded-full px-4 py-2 text-sm mb-6 focus:outline-none focus:border-primary" />

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <p className="text-sm text-gray-500 mb-4">{filtered.length} products</p>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Product", "Category", "Price", "Stock", "Sold", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=80"} alt={p.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                        <span className="font-medium text-gray-800 truncate max-w-[140px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-500">{p.category?.name || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-primary">₹{p.price?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${p.stock === 0 ? "text-red-500" : p.stock <= 10 ? "text-orange-500" : "text-gray-700"}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.sold || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusBadge[p.status] || "bg-gray-100 text-gray-500"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link to={`/vendor/products/edit/${p._id}`} className="text-xs text-blue-600 hover:underline">Edit</Link>
                        <button onClick={() => handleDelete(p._id)} className="text-xs text-red-500 hover:underline">Delete</button>
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
