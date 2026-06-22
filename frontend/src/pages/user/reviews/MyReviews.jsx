import { Link } from "react-router-dom";
import { useFetch } from "../../../hooks/useFetch.js";
import { reviewService } from "../../../services/index.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import api from "../../../services/api.js";

export default function MyReviews() {
  const { user } = useAuth();
  // fetch all reviews then filter by current user
  const { data, loading } = useFetch(() => api.get("/reviews/my").catch(() => ({ data: { data: [] } })));
  const reviews = data?.data || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Reviews</h1>
        <Link to="/orders" className="text-sm text-primary border border-primary px-4 py-2 rounded-full hover:bg-accent transition">
          + Add Review
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">⭐</p>
          <p className="text-gray-500">You haven't reviewed any products yet.</p>
          <Link to="/orders" className="mt-4 inline-block text-primary hover:underline text-sm">Go to Orders →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl shadow p-5">
              <div className="flex gap-4 items-start">
                {review.productId?.images?.[0] && (
                  <img src={review.productId.images[0]} alt={review.productId.name}
                    className="w-16 h-16 object-cover rounded-lg shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <Link to={`/products/${review.productId?._id}`} className="font-semibold text-gray-800 hover:text-primary">
                      {review.productId?.name}
                    </Link>
                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`text-sm ${s <= review.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                  <span className={`text-xs mt-2 inline-block px-2 py-0.5 rounded-full ${review.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {review.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
