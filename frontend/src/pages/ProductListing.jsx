import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { productService, categoryService } from "../services/index.js";
import BagCard from "../components/BagCard.jsx";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("newest");

  const activeCategory = searchParams.get("category") || "all";

  useEffect(() => {
    categoryService.getAll().then(({ data }) => setCategories(data.data || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { sort, limit: 20 };
    if (activeCategory !== "all") params.category = activeCategory;
    productService.getAll(params)
      .then(({ data }) => { setProducts(data.data || []); setTotal(data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory, sort]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">All Bags</h1>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <button onClick={() => setSearchParams({})}
          className={`px-4 py-2 rounded-full text-sm border transition ${activeCategory === "all" ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600 hover:border-primary"}`}>
          All
        </button>
        {categories.map((cat) => (
          <button key={cat._id} onClick={() => setSearchParams({ category: cat._id })}
            className={`px-4 py-2 rounded-full text-sm border transition ${activeCategory === cat._id ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600 hover:border-primary"}`}>
            {cat.icon} {cat.name}
          </button>
        ))}
        <div className="ml-auto">
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">{total} products found</p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((bag) => <BagCard key={bag._id} bag={bag} />)}
        </div>
      )}
    </div>
  );
}
