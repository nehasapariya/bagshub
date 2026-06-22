import { Link } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch.js";
import { wishlistService } from "../../services/index.js";
import { useStore } from "../../context/StoreContext.jsx";

export default function Wishlist() {
  const { toggleWishlist, addToCart } = useStore();
  const { data, loading, refetch } = useFetch(() => wishlistService.get());
  const items = data?.data || [];

  const handleRemove = async (productId) => {
    await toggleWishlist(productId);
    refetch();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">My Wishlist</h1>
      <p className="text-gray-500 text-sm mb-8">{items.length} item{items.length !== 1 ? "s" : ""} saved</p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">❤️</p>
          <p className="text-gray-500 text-lg">Your wishlist is empty.</p>
          <Link to="/products" className="mt-4 inline-block bg-primary text-white px-6 py-2.5 rounded-full text-sm hover:bg-amber-700 transition">Browse Bags</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((bag) => (
            <div key={bag._id} className="bg-white rounded-xl shadow hover:shadow-md transition overflow-hidden">
              <div className="relative">
                <Link to={`/products/${bag._id}`}>
                  <img src={bag.images?.[0]} alt={bag.name} className="w-full h-48 object-cover" />
                </Link>
                <button onClick={() => handleRemove(bag._id)}
                  className="absolute top-2 right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow text-red-500 hover:scale-110 transition">❤️</button>
              </div>
              <div className="p-3">
                <Link to={`/products/${bag._id}`} className="font-semibold text-gray-800 text-sm hover:text-primary">{bag.name}</Link>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-primary font-bold">₹{bag.price?.toLocaleString()}</span>
                  {bag.originalPrice > bag.price && <span className="text-gray-400 line-through text-xs">₹{bag.originalPrice?.toLocaleString()}</span>}
                </div>
                <button onClick={() => addToCart(bag)} disabled={bag.stock === 0}
                  className="w-full mt-3 bg-primary text-white py-2 rounded-full text-sm hover:bg-amber-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed">
                  {bag.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
