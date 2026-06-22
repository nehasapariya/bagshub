import { useParams, Link, useNavigate } from "react-router-dom";
import { useFetch } from "../hooks/useFetch.js";
import { productService, reviewService } from "../services/index.js";
import { useStore } from "../context/StoreContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, buyNow, toggleWishlist, wishlist } = useStore();

  const { data: pd, loading } = useFetch(() => productService.getById(id), [id]);
  const { data: rd } = useFetch(() => reviewService.getByProduct(id), [id]);

  const bag = pd?.data;
  const reviews = rd?.data || [];
  const isWishlisted = bag && wishlist.includes(bag._id);

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-20 text-center text-gray-400">Loading...</div>;
  if (!bag) return <div className="max-w-6xl mx-auto px-4 py-20 text-center"><p className="text-gray-500">Product not found.</p><Link to="/products" className="text-primary mt-4 inline-block hover:underline">← Back</Link></div>;

  const discount = bag.originalPrice > bag.price ? Math.round(((bag.originalPrice - bag.price) / bag.originalPrice) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="text-primary text-sm mb-6 hover:underline">← Back</button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <div className="relative">
            <img src={bag.images?.[0] || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"} alt={bag.name}
              className="w-full h-96 object-cover rounded-2xl shadow" />
            {discount > 0 && <span className="absolute top-3 left-3 bg-red-500 text-white text-sm px-3 py-1 rounded-full">-{discount}%</span>}
          </div>
          <div className="flex gap-2">
            {bag.images?.map((img, i) => (
              <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded-lg border-2 border-transparent hover:border-primary cursor-pointer transition" />
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-400 capitalize mb-1">{bag.category?.name}</p>
          <h1 className="text-3xl font-bold text-gray-800">{bag.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            {[1,2,3,4,5].map((s) => <span key={s} className={`text-lg ${s <= Math.round(bag.rating) ? "text-yellow-400" : "text-gray-200"}`}>★</span>)}
            <span className="text-sm text-gray-500">{bag.rating?.toFixed(1)} ({bag.numReviews} reviews)</span>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <span className="text-3xl font-bold text-primary">₹{bag.price?.toLocaleString()}</span>
            {discount > 0 && <span className="text-gray-400 line-through text-lg">₹{bag.originalPrice?.toLocaleString()}</span>}
            {discount > 0 && <span className="text-green-600 text-sm font-medium">{discount}% off</span>}
          </div>
          <p className="text-gray-600 mt-4 leading-relaxed">{bag.description}</p>

          <div className="mt-5">
            <p className="text-sm font-semibold text-gray-700 mb-2">Available Colors</p>
            <div className="flex gap-2 flex-wrap">
              {bag.colors?.map((c) => <span key={c} className="border border-gray-300 px-3 py-1 rounded-full text-sm text-gray-600 cursor-pointer hover:border-primary transition">{c}</span>)}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mt-4">
            {bag.tags?.map((t) => <span key={t} className="bg-accent text-primary text-xs px-2 py-1 rounded-full">#{t}</span>)}
          </div>

          <div className="flex gap-3 mt-8">
            {bag.stock > 0 ? (
              <>
                <button onClick={() => addToCart(bag)} className="flex-1 bg-primary text-white py-3 rounded-full font-medium hover:bg-primary-dark transition">Add to Cart 🛒</button>
                <button onClick={async () => { await buyNow(bag); navigate(user ? "/checkout" : "/login"); }} className="flex-1 border border-primary text-primary py-3 rounded-full font-medium hover:bg-accent transition">Buy Now ⚡</button>
              </>
            ) : (
              <button disabled className="flex-1 bg-gray-300 text-gray-500 py-3 rounded-full font-medium cursor-not-allowed">Out of Stock</button>
            )}
            {user?.role === "user" && (
              <button onClick={() => toggleWishlist(bag._id)}
                className={`w-12 h-12 rounded-full border flex items-center justify-center text-xl transition ${isWishlisted ? "bg-red-50 border-red-300 text-red-500" : "border-gray-300 text-gray-400 hover:border-red-300"}`}>
                {isWishlisted ? "❤️" : "🤍"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Customer Reviews ({reviews.length})</h2>
          {user?.role === "user" && (
            <Link to={`/reviews/add/${bag._id}`} className="text-sm bg-primary text-white px-4 py-2 rounded-full hover:bg-amber-700 transition">Write a Review</Link>
          )}
        </div>
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="bg-white rounded-xl shadow p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">{r.userId?.name?.[0]}</div>
                    <span className="font-medium text-gray-700 text-sm">{r.userId?.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1,2,3,4,5].map((s) => <span key={s} className={`text-sm ${s <= r.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>)}
                </div>
                <p className="text-sm text-gray-600">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
