import { Link } from "react-router-dom";

export default function BagCard({ bag }) {
  const discount = bag.originalPrice > bag.price
    ? Math.round(((bag.originalPrice - bag.price) / bag.originalPrice) * 100)
    : 0;
  const image = bag.images?.[0] || "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400";

  return (
    <Link to={`/products/${bag._id}`}
      className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col">
      <div className="relative overflow-hidden bg-gray-50">
        <img src={image} alt={bag.name}
          className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-500" />
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            -{discount}%
          </span>
        )}
        {bag.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-semibold text-sm tracking-wide">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <p className="text-xs font-medium text-primary/70 uppercase tracking-wider">{bag.category?.name || bag.category}</p>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug truncate">{bag.name}</h3>

        <div className="flex items-center gap-1">
          <div className="flex">
            {[1,2,3,4,5].map((s) => (
              <span key={s} className={`text-xs ${s <= Math.round(bag.rating || 0) ? "text-amber-400" : "text-gray-200"}`}>★</span>
            ))}
          </div>
          <span className="text-xs text-gray-400">({bag.numReviews || 0})</span>
        </div>

        <div className="flex items-center gap-2 mt-auto pt-1">
          <span className="text-primary font-bold text-base">₹{bag.price?.toLocaleString()}</span>
          {discount > 0 && (
            <span className="text-gray-400 line-through text-xs">₹{bag.originalPrice?.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
