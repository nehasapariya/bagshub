import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { vendorService, categoryService } from "../../../services/index.js";

const COLORS = ["Black", "Navy", "Olive", "Brown", "Tan", "Grey", "Blue", "Red", "Pink", "White", "Green", "Orange", "Beige", "Cognac"];

const empty = { name: "", category: "", gender: "women", price: "", originalPrice: "", description: "", stock: "", colors: [], tags: "", images: [""] };

export default function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    categoryService.getAll().then(({ data }) => {
      const cats = data.data || [];
      setCategories(cats);
      if (cats.length) setForm((f) => ({ ...f, category: cats[0]._id }));
    });
  }, []);

  const toggleColor = (c) =>
    setForm((f) => ({ ...f, colors: f.colors.includes(c) ? f.colors.filter((x) => x !== c) : [...f.colors, c] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        stock: Number(form.stock),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        images: form.images.filter(Boolean),
      };
      await vendorService.createProduct(payload);
      navigate("/vendor/products");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-primary text-sm hover:underline">← Back</button>
        <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">Product Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Urban Explorer Backpack"
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary">
              {categories.map((c) => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">For</label>
            <div className="flex gap-2">
              {["women", "men", "kids"].map((g) => (
                <button key={g} type="button" onClick={() => setForm({ ...form, gender: g })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border capitalize transition ${
                    form.gender === g
                      ? "bg-primary text-white border-primary"
                      : "border-gray-300 text-gray-600 hover:border-primary"
                  }`}>
                  {g === "women" ? "👩 Women" : g === "men" ? "👨 Men" : "👧 Kids"}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Selling Price (₹)</label>
              <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="2499"
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Original Price (₹)</label>
              <input required type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                placeholder="3499"
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="text-sm font-medium text-gray-700">Stock Quantity</label>
            <input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
              placeholder="50"
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your product..."
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" />
          </div>

          {/* Colors */}
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

          {/* Tags */}
          <div>
            <label className="text-sm font-medium text-gray-700">Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="travel, leather, daily"
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
          </div>

          {/* Image URL */}
          <div>
            <label className="text-sm font-medium text-gray-700">Image URL</label>
            <input value={form.images[0]} onChange={(e) => setForm({ ...form, images: [e.target.value] })}
              placeholder="https://..."
              className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
            {form.images[0] && (
              <img src={form.images[0]} alt="preview" className="mt-2 w-24 h-24 object-cover rounded-lg border" />
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-primary text-white py-3 rounded-full font-medium hover:bg-amber-700 transition disabled:opacity-60">
              {loading ? "Submitting..." : "Add Product"}
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
