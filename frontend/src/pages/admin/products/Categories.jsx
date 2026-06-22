import { useState } from "react";
import { useFetch } from "../../../hooks/useFetch.js";
import { categoryService } from "../../../services/index.js";

export default function Categories() {
  const [newCat, setNewCat] = useState({ name: "", icon: "" });
  const [adding, setAdding] = useState(false);
  const [actionId, setActionId] = useState(null);

  const { data, loading, error, refetch } = useFetch(() => categoryService.getAll());
  const categories = data?.data || [];

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    try {
      await categoryService.create({ name: newCat.name, icon: newCat.icon || "🛍️" });
      setNewCat({ name: "", icon: "" });
      setAdding(false);
      refetch();
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    setActionId(id);
    try { await categoryService.delete(id); refetch(); }
    catch {}
    finally { setActionId(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
        <button onClick={() => setAdding(!adding)} className="bg-gray-800 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-700 transition">
          + Add Category
        </button>
      </div>

      {adding && (
        <div className="bg-white rounded-xl shadow p-5 mb-6 max-w-md">
          <h2 className="font-semibold text-gray-700 mb-4">New Category</h2>
          <form onSubmit={handleAdd} className="flex gap-3">
            <input value={newCat.icon} onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
              placeholder="Icon (emoji)" className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500" />
            <input required value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
              placeholder="Category name" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500" />
            <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition">Add</button>
          </form>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{cat.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">active</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t">
                <button disabled={actionId === cat._id} onClick={() => handleDelete(cat._id)}
                  className="w-full text-xs py-1.5 rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition disabled:opacity-50">
                  {actionId === cat._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
