import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useStore } from "../context/StoreContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { cartCount, wishlist } = useStore();
  const { user, logout } = useAuth();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/search", label: "Search" },
    ...(user?.role === "user"   ? [{ to: "/orders",           label: "My Orders"   }] : []),
    ...(user?.role === "vendor" ? [{ to: "/vendor/dashboard", label: "Vendor Panel" }] : []),
    ...(user?.role === "admin"  ? [{ to: "/admin/dashboard",  label: "Admin Panel"  }] : []),
  ];

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-xl font-extrabold tracking-tight">
          <span className="text-gray-900">Bags</span><span className="text-primary">Hub</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname === l.to
                  ? "bg-accent text-primary"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          {user?.role === "user" && (
            <>
              <Link to="/wishlist" className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 transition text-lg">
                🤍
                {wishlist.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{wishlist.length}</span>
                )}
              </Link>
              <Link to="/cart" className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 transition text-lg">
                🛍️
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount}</span>
                )}
              </Link>
            </>
          )}

          {user ? (
            <div className="relative ml-1" ref={dropdownRef}>
              {/* Trigger */}
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition">
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{user.name?.split(" ")[0]}</span>
                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-gray-100 py-1.5 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <Link to="/profile/edit"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">
                    <span>✏️</span> Edit Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">Login</Link>
              <Link to="/signup" className="btn-primary">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 transition text-gray-600 font-bold text-lg"
          onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-1">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              className={`px-3 py-2.5 rounded-xl text-sm font-medium transition ${pathname === l.to ? "bg-accent text-primary" : "text-gray-600 hover:bg-gray-50"}`}>
              {l.label}
            </Link>
          ))}
          {user?.role === "user" && (
            <>
              <Link to="/wishlist" className="px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>🤍 Wishlist ({wishlist.length})</Link>
              <Link to="/cart"     className="px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>🛍️ Cart ({cartCount})</Link>
              <Link to="/orders"   className="px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>📦 Orders</Link>
            </>
          )}
          <div className="border-t border-gray-100 mt-2 pt-2">
            {user ? (
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition">
                Logout
              </button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login"  className="flex-1 text-center px-3 py-2.5 rounded-xl text-sm text-gray-600 border border-gray-200 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="flex-1 text-center px-3 py-2.5 rounded-xl text-sm bg-primary text-white hover:bg-primary-dark" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
