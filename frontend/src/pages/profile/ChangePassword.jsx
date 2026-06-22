import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api.js";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) { setError("New passwords do not match."); return; }
    setLoading(true);
    setError("");
    try {
      await api.patch("/auth/change-password", { currentPassword: form.currentPassword, newPassword: form.newPassword });
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/profile" className="text-primary hover:underline text-sm">← Back</Link>
        <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
      </div>

      <div className="bg-white rounded-2xl shadow p-8">
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            { label: "Current Password", key: "currentPassword" },
            { label: "New Password", key: "newPassword" },
            { label: "Confirm New Password", key: "confirm" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <input type="password" required placeholder="••••••••" value={form[key]}
                onChange={(e) => { setError(""); setForm({ ...form, [key]: e.target.value }); }}
                className="w-full mt-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-primary text-white py-3 rounded-full font-medium hover:bg-amber-700 transition disabled:opacity-60">
              {loading ? "Updating..." : "Update Password"}
            </button>
            <Link to="/profile" className="flex-1 text-center border border-gray-300 text-gray-600 py-3 rounded-full font-medium hover:border-primary transition">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
