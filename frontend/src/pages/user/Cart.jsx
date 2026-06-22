import { Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext.jsx";

export default function Cart() {
  const { cart, updateQty, removeFromCart, cartTotal } = useStore();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">🛒</p>
          <p className="text-gray-500 text-lg">Your cart is empty.</p>
          <Link to="/products" className="mt-4 inline-block bg-primary text-white px-6 py-2.5 rounded-full text-sm hover:bg-amber-700 transition">Shop Now</Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {cart.map((item) => (
              <div key={item.productId} className="bg-white rounded-xl shadow p-4 flex gap-4 items-center">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Color: {item.color}</p>
                  <p className="text-primary font-bold mt-1">₹{item.price?.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1">
                  <button onClick={() => updateQty(item.productId, item.qty - 1)} className="text-gray-500 hover:text-primary font-bold w-5 text-center">−</button>
                  <span className="text-sm font-medium w-4 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.productId, item.qty + 1)} className="text-gray-500 hover:text-primary font-bold w-5 text-center">+</button>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-800">₹{(item.price * item.qty)?.toLocaleString()}</p>
                  <button onClick={() => removeFromCart(item.productId)} className="text-red-400 text-xs hover:text-red-600 mt-1">Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-xl shadow p-6 sticky top-20">
              <h2 className="font-bold text-gray-800 text-lg mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
                  <span>₹{cartTotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between"><span>Shipping</span><span className="text-green-600">Free</span></div>
                <hr className="my-3" />
                <div className="flex justify-between font-bold text-gray-800 text-base">
                  <span>Total</span><span>₹{cartTotal?.toLocaleString()}</span>
                </div>
              </div>
              <Link to="/checkout" className="block w-full mt-5 bg-primary text-white text-center py-3 rounded-full font-medium hover:bg-amber-700 transition">
                Proceed to Checkout
              </Link>
              <Link to="/products" className="block w-full mt-3 text-center text-primary text-sm hover:underline">Continue Shopping</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
