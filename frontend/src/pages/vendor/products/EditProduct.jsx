import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { vendorService, categoryService } from "../../../services/index.js";

const COLORS = ["Black", "Navy", "Olive", "Brown", "Tan", "Grey", "Blue", "Red", "Pink", "White", "Green", "Orange", "Beige", "Cognac"];

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      vendorService.getProductById(id),
      categoryService.getAll(),
    ]).then(([{ data: pd }, { data: cd }]) => {
      const p = pd.data;
      setForm({
        name: p.name,
        category: p.category?._id || p.category,
        price: p.price,
        originalPrice: p.originalPrice,
        stock: p.stock,
        description: p.description,
        colors: p.colors || [],
        tags: (p.tags || []).join(", "),
        images: p.images?.[0] || "",
      });
      setCategories(cd.data || []);
    }).catch(() => setError("Failed to load product."))
    .finally(() => setLoading(false));
  }, [id]);

  const toggleColor = (c) =>
    setForm((f) => ({ ...f, colors: f.colors.includes(c) ? f.colors.filter((x) => x !== c) : [...f.colors, c] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        stock: Number(form.stock),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        images: form.images ? [form.images] : [],
      };
      await vendorService.updateProduct(id, payload);
      navigate("/vendor/products");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Loading...</div>;
  if (!form) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Product not found.</p>
      <button onClick={() => navigate(-1)} className="text-primary mt-3 inline-block hover:underline text-sm">← Back</button>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-primary text-sm hover:underline">← Back</button>
        <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">{error}</div>}

      <div className="bg-white rounded-xl shadow p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700">Product Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary">
              {categories.map((c) => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Selling Price (₹)</label>
              <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Original Price (₹)</label>
              <input required type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Stock Quantity</label>
            <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Available Colors</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => toggleColor(c)}
                  className={`px-3 py-1 rounded-full text-xs border transition ${form.colors.includes(c) ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600 hover:border-primary"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="travel, leather, daily"
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Image URL</label>
            <input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })}
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
            {form.images && <img src={form.images} alt="preview" className="mt-2 w-24 h-24 object-cover rounded-lg border" />}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="flex-1 bg-primary text-white py-3 rounded-full font-medium hover:bg-amber-700 transition disabled:opacity-60">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-full font-medium hover:border-primary transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
