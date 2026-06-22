import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { reviewService, productService } from "../../../services/index.js";
import { useFetch } from "../../../hooks/useFetch.js";

export default function AddReview() {
  const { bagId } = useParams();
  const navigate = useNavigate();
  const { data } = useFetch(() => productService.getById(bagId), [bagId]);
  const bag = data?.data;

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await reviewService.add({ productId: bagId, rating, comment });
      setSubmitted(true);
      setTimeout(() => navigate("/reviews"), 1800);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <Link to="/reviews" className="text-primary text-sm hover:underline">← My Reviews</Link>
      <h1 className="text-2xl font-bold text-gray-800 mt-4 mb-6">Write a Review</h1>

      <div className="bg-white rounded-xl shadow p-6">
        {bag && (
          <div className="flex gap-4 items-center mb-6 pb-5 border-b">
            <img src={bag.images?.[0]} alt={bag.name} className="w-16 h-16 object-cover rounded-lg" />
            <div>
              <p className="font-semibold text-gray-800">{bag.name}</p>
              <p className="text-xs text-gray-400 capitalize">{bag.category?.name}</p>
            </div>
          </div>
        )}

        {submitted ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">⭐</div>
            <p className="font-semibold text-gray-800">Review submitted! Pending approval.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Your Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className={`text-3xl transition ${star <= (hovered || rating) ? "text-yellow-400" : "text-gray-300"}`}>
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Your Review</label>
              <textarea required rows={4} value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" />
            </div>
            <button type="submit" disabled={rating === 0 || loading}
              className="w-full bg-primary text-white py-3 rounded-full font-medium hover:bg-amber-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed">
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
