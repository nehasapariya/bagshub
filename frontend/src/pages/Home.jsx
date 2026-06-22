import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { productService, categoryService } from "../services/index.js";
import BagCard from "../components/BagCard.jsx";

const offers = [
  { id: 1, title: "Summer Sale",  discount: "Up to 40% Off",    code: "SUMMER40", bg: "bg-violet-50" },
  { id: 2, title: "New Arrivals", discount: "Free Shipping",     code: "FREESHIP", bg: "bg-indigo-50" },
  { id: 3, title: "Bundle Deal",  discount: "Buy 2 Get 1 Free", code: "BUNDLE3",  bg: "bg-sky-50" },
];

export default function Home() {
  const { user } = useAuth();

  const { data: featuredData } = useFetch(() => productService.getAll({ sort: "rating", limit: 6 }));
  const { data: catData } = useFetch(() => categoryService.getAll());

  const featured = featuredData?.data || [];
  const categories = catData?.data || [];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 py-20 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-wide uppercase">New Collection 2025</span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Carry Your <span className="text-primary">Style</span><br />Everywhere
            </h1>
            <p className="text-gray-400 mt-5 text-lg leading-relaxed">Premium bags for every occasion — backpacks, handbags, travel & more.</p>
            <div className="flex gap-3 mt-8">
              <Link to="/products" className="btn-primary text-base px-7 py-3">Shop Now</Link>
              <Link to="/search" className="btn-outline border-gray-600 text-gray-300 hover:bg-white/5 text-base px-7 py-3">Explore</Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl scale-110" />
              <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500" alt="Hero Bag"
                className="relative w-80 h-80 object-cover rounded-3xl shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-7">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat._id} to={`/products?category=${cat._id}`}
              className="group bg-white rounded-2xl p-6 text-center shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200">
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">{cat.icon}</div>
              <p className="font-semibold text-gray-800 text-sm">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Offers
      <section className="max-w-6xl mx-auto px-4 pb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-7">Special Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {offers.map((offer) => (
            <div key={offer.id} className={`${offer.bg} rounded-2xl p-6 border border-white/60`}>
              <h3 className="font-bold text-gray-900 text-lg">{offer.title}</h3>
              <p className="text-gray-600 mt-1 text-sm">{offer.discount}</p>
              <p className="mt-4 text-sm">Use code: <span className="font-mono font-bold text-primary bg-white px-2 py-0.5 rounded-lg">{offer.code}</span></p>
            </div>
          ))}
        </div>
      </section> */}

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-7">
          <h2 className="text-2xl font-bold text-gray-900">Featured Bags</h2>
          <Link to="/products" className="text-sm font-medium text-primary hover:text-primary-dark transition">View All →</Link>
        </div>
        {featured.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featured.map((bag) => <BagCard key={bag._id} bag={bag} />)}
          </div>
        )}

        {/* CTA for guests */}
        {!user && (
          <div className="mt-12 bg-gradient-to-r from-primary/10 to-indigo-50 rounded-3xl p-10 text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Want to order?</h2>
            <p className="text-gray-500 mb-6">Sign in to add to cart, wishlist and place orders.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/login" className="btn-primary px-8 py-3">Login</Link>
              <Link to="/signup" className="btn-outline px-8 py-3">Sign Up</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
