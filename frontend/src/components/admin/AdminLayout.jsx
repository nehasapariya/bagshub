import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const navItems = [
  { to: "/admin/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/admin/users",     icon: "👥", label: "Users" },
  { to: "/admin/vendors",   icon: "🏪", label: "Vendors" },
  { to: "/admin/products",  icon: "👜", label: "Products" },
  { to: "/admin/categories",icon: "🗂️", label: "Categories" },
  { to: "/admin/orders",    icon: "🛒", label: "Orders" },
  { to: "/admin/finance",   icon: "💰", label: "Finance" },
  { to: "/admin/reviews",   icon: "📝", label: "Moderation" },
];

export default function AdminLayout({ children }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate("/login"); };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-60 bg-gray-900 text-gray-300 shrink-0 hidden md:flex flex-col">
        <div className="px-5 py-5 border-b border-gray-700">
          <Link to="/" className="text-xl font-bold text-white">Bags<span className="text-amber-400">Hub</span></Link>
          <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
        </div>

        <div className="px-5 py-4 border-b border-gray-700 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{user?.name || "Admin"}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                pathname === item.to ? "bg-amber-500 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-gray-700">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 px-2 py-2 rounded-lg transition">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-900 z-40 px-4 py-3 flex items-center justify-between">
        <span className="text-white font-bold text-lg">BagsHub <span className="text-xs text-gray-400 font-normal">Admin</span></span>
        <div className="flex gap-3">
          {navItems.slice(0, 5).map((item) => (
            <Link key={item.to} to={item.to} className={`text-lg ${pathname === item.to ? "text-amber-400" : "text-gray-400"}`}>{item.icon}</Link>
          ))}
        </div>
      </div>

      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-auto">{children}</main>
    </div>
  );
}
