import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const ROLE_INFO = {
  user:   { label: "Customer",       desc: "Browse and buy bags",       icon: "👤", color: "border-blue-300 bg-blue-50 text-blue-700" },
  vendor: { label: "Vendor (Seller)", desc: "Sell your bags on BagsHub", icon: "🏪", color: "border-purple-300 bg-purple-50 text-purple-700" },
  admin:  { label: "Admin",           desc: "Platform super control",     icon: "🛡️", color: "border-amber-300 bg-amber-50 text-amber-700" },
};

const REDIRECT = { user: "/dashboard", vendor: "/vendor/dashboard", admin: "/admin/dashboard" };

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await register(form);
      navigate(REDIRECT[user.role] || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const selected = ROLE_INFO[form.role];

  return (
    <div className="min-h-screen bg-accent flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h1>
        <p className="text-sm text-gray-500 mb-6">Join BagsHub today</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>
        )}

        {/* Role Selector Cards */}
        <div className="mb-5">
          <p className="text-sm font-medium text-gray-700 mb-2">Register as</p>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(ROLE_INFO).map(([role, info]) => (
              <button
                key={role}
                type="button"
                onClick={() => { setForm({ ...form, role }); setError(""); }}
                className={`flex flex-col items-center gap-1 border-2 rounded-xl p-3 text-center transition ${
                  form.role === role ? info.color + " border-2" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-2xl">{info.icon}</span>
                <span className="text-xs font-semibold text-gray-700">{info.label.split(" ")[0]}</span>
                <span className="text-xs text-gray-400 leading-tight">{info.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Full Name", key: "name", type: "text", placeholder: "Your name" },
            { label: "Email", key: "email", type: "email", placeholder: "you@example.com" },
            { label: "Password", key: "password", type: "password", placeholder: "Min. 6 characters" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <input type={type} required placeholder={placeholder} value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
          ))}


          <button type="submit" disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-full font-medium hover:bg-amber-700 transition disabled:opacity-60">
            {loading ? "Creating account..." : `Create ${selected.label.split(" ")[0]} Account`}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-5">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
        </p>
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-600 transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
