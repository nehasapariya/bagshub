import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const navItems = [
  { to: "/vendor/dashboard",     icon: "📊", label: "Dashboard" },
  { to: "/vendor/products",      icon: "👜", label: "My Products" },
  { to: "/vendor/products/add",  icon: "➕", label: "Add Product" },
  { to: "/vendor/inventory",     icon: "📦", label: "Inventory" },
  { to: "/vendor/orders",        icon: "🛒", label: "Orders" },
  { to: "/vendor/earnings",      icon: "💰", label: "Earnings" },
];

export default function VendorLayout({ children }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => { await logout(); navigate("/login"); };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 bg-white shadow-sm shrink-0 hidden md:flex flex-col">
        <div className="px-5 py-5 border-b">
          <Link to="/" className="text-xl font-bold text-primary">Bags<span className="text-amber-600">Hub</span></Link>
          <p className="text-xs text-gray-400 mt-0.5">Vendor Panel</p>
        </div>

        <div className="px-5 py-4 border-b flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase() || "V"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                pathname === item.to ? "bg-accent text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-primary"
              }`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-5 py-4 border-t">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-2 rounded-lg transition">
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow-sm z-40 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-lg font-bold text-primary">BagsHub <span className="text-xs text-gray-400 font-normal">Vendor</span></Link>
        <div className="flex gap-3 text-sm">
          {navItems.slice(0, 4).map((item) => (
            <Link key={item.to} to={item.to} className={`${pathname === item.to ? "text-primary" : "text-gray-500"}`}>{item.icon}</Link>
          ))}
        </div>
      </div>

      <main className="flex-1 md:p-8 p-4 pt-16 md:pt-8 overflow-auto">{children}</main>
    </div>
  );
}
