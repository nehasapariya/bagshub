import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <p className="text-xl font-extrabold text-white tracking-tight mb-3">
            Bags<span className="text-primary">Hub</span>
          </p>
          <p className="text-sm leading-relaxed">Your one-stop destination for premium bags of all kinds.</p>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Shop</h4>
          <ul className="space-y-2.5 text-sm">
            {[["Backpacks","backpack"],["Handbags","handbag"],["Travel Bags","travel"],["Tote Bags","tote"]].map(([label, cat]) => (
              <li key={cat}><Link to={`/products?category=${cat}`} className="hover:text-white transition">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Account</h4>
          <ul className="space-y-2.5 text-sm">
            {[["Login","/login"],["Sign Up","/signup"],["My Profile","/profile"],["My Orders","/orders"]].map(([label, to]) => (
              <li key={to}><Link to={to} className="hover:text-white transition">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Support</h4>
          <ul className="space-y-2.5 text-sm">
            <li>support@bagshub.com</li>
            <li>+91 98765 43210</li>
            <li className="pt-2">
              <div className="flex gap-3">
                {["𝕏","in","ig"].map((s) => (
                  <span key={s} className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs hover:bg-primary hover:text-white cursor-pointer transition">{s}</span>
                ))}
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 text-center py-5 text-xs text-gray-600">
        © 2025 BagsHub. All rights reserved. Built with ❤️
      </div>
    </footer>
  );
}
