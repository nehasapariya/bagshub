import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { productService, categoryService } from "../services/index.js";
import BagCard from "../components/BagCard.jsx";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [priceRange, setPriceRange] = useState(10000);
  const activeCategory = searchParams.get("category") || "all";
  const activeGender = searchParams.get("gender") || "all";

  useEffect(() => {
    categoryService.getAll().then(({ data }) => setCategories(data.data || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { maxPrice: priceRange };
    if (query) params.q = query;
    if (activeCategory !== "all") params.category = activeCategory;
    if (activeGender !== "all") params.gender = activeGender;

    const apiFn = query ? productService.search(query) : productService.filter(params);
    apiFn
      .then(({ data }) => setProducts(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [query, activeCategory, activeGender, priceRange]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Search Bags</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, tag..."
          className="flex-1 border border-gray-300 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-primary" />
        <button type="submit" className="bg-primary text-white px-6 py-3 rounded-full text-sm hover:bg-amber-700 transition">Search</button>
      </form>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-56 shrink-0">
          <div className="bg-white rounded-xl shadow p-5">
            {/* Gender Filter */}
            <h3 className="font-semibold text-gray-700 mb-3">For</h3>
            <div className="flex flex-col gap-2 mb-4">
              {[["all", "All"], ["women", "👩 Women"], ["men", "👨 Men"], ["kids", "👧 Kids"]].map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="gender" checked={activeGender === val}
                    onChange={() => setSearchParams({ ...(query && { q: query }), ...(activeCategory !== "all" && { category: activeCategory }), ...(val !== "all" && { gender: val }) })} />
                  {label}
                </label>
              ))}
            </div>
            <hr className="my-3" />

            {/* Category Filter */}
            <h3 className="font-semibold text-gray-700 mb-3">Category</h3>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="cat" checked={activeCategory === "all"} onChange={() => setSearchParams(query ? { q: query } : {})} />
                All
              </label>
              {categories.map((cat) => (
                <label key={cat._id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" name="cat" checked={activeCategory === cat._id}
                    onChange={() => setSearchParams({ category: cat._id, ...(query && { q: query }), ...(activeGender !== "all" && { gender: activeGender }) })} />
                  {cat.icon} {cat.name}
                </label>
              ))}
            </div>
            <hr className="my-4" />
            <h3 className="font-semibold text-gray-700 mb-3">Max Price: ₹{priceRange.toLocaleString()}</h3>
            <input type="range" min={500} max={10000} step={100} value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))} className="w-full accent-primary" />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>₹500</span><span>₹10,000</span></div>
          </div>
        </aside>

        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-4">{products.length} result{products.length !== 1 ? "s" : ""} found</p>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">🔍</p>
              <p>No bags found. Try a different search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((bag) => <BagCard key={bag._id} bag={bag} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
