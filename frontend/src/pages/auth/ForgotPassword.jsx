import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../../services/index.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Forgot Password</h1>
        <p className="text-sm text-gray-500 mb-6">Enter your email to receive a reset link</p>

        {sent ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">📧</div>
            <p className="text-gray-700 font-medium">Reset link sent!</p>
            <p className="text-sm text-gray-500 mt-2">Check your inbox at <strong>{email}</strong></p>
            <Link to="/login" className="mt-6 inline-block text-primary hover:underline text-sm">← Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}
            <div>
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" required placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-full font-medium hover:bg-amber-700 transition disabled:opacity-60">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <p className="text-sm text-center"><Link to="/login" className="text-primary hover:underline">← Back to Login</Link></p>
          </form>
        )}
      </div>
    </div>
  );
}
