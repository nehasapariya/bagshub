import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { StoreProvider } from "./context/StoreContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import VendorLayout from "./components/vendor/VendorLayout.jsx";
import AdminLayout from "./components/admin/AdminLayout.jsx";

import Home from "./pages/Home.jsx";
import ProductListing from "./pages/ProductListing.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Search from "./pages/Search.jsx";

import Signup from "./pages/auth/Signup.jsx";
import Login from "./pages/auth/Login.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

import MyProfile from "./pages/profile/MyProfile.jsx";
import EditProfile from "./pages/profile/EditProfile.jsx";
import ChangePassword from "./pages/profile/ChangePassword.jsx";

import Dashboard from "./pages/user/dashboard/Dashboard.jsx";
import Wishlist from "./pages/user/Wishlist.jsx";
import Cart from "./pages/user/Cart.jsx";
import Checkout from "./pages/user/Checkout.jsx";
import MyOrders from "./pages/user/orders/MyOrders.jsx";
import OrderDetails from "./pages/user/orders/OrderDetails.jsx";
import TrackOrder from "./pages/user/orders/TrackOrder.jsx";
import AddReview from "./pages/user/reviews/AddReview.jsx";
import MyReviews from "./pages/user/reviews/MyReviews.jsx";

import VendorDashboard from "./pages/vendor/dashboard/VendorDashboard.jsx";
import MyProducts from "./pages/vendor/products/MyProducts.jsx";
import AddProduct from "./pages/vendor/products/AddProduct.jsx";
import EditProduct from "./pages/vendor/products/EditProduct.jsx";
import Inventory from "./pages/vendor/inventory/Inventory.jsx";
import VendorOrders from "./pages/vendor/orders/VendorOrders.jsx";
import VendorOrderDetails from "./pages/vendor/orders/VendorOrderDetails.jsx";
import Earnings from "./pages/vendor/earnings/Earnings.jsx";

import AdminDashboard from "./pages/admin/dashboard/AdminDashboard.jsx";
import ManageUsers from "./pages/admin/users/ManageUsers.jsx";
import ManageVendors from "./pages/admin/users/ManageVendors.jsx";
import AdminProducts from "./pages/admin/products/AdminProducts.jsx";
import Categories from "./pages/admin/products/Categories.jsx";
import AdminOrders from "./pages/admin/orders/AdminOrders.jsx";
import Finance from "./pages/admin/finance/Finance.jsx";
import Moderation from "./pages/admin/moderation/Moderation.jsx";

// ── Layouts ───────────────────────────────────────────────────────────────────
function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// ── Route Guards ──────────────────────────────────────────────────────────────
function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Public — no login required */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/products" element={<Layout><ProductListing /></Layout>} />
      <Route path="/products/:id" element={<Layout><ProductDetails /></Layout>} />
      <Route path="/search" element={<Layout><Search /></Layout>} />

      {/* Profile — any logged-in user */}
      <Route path="/profile" element={<Layout><ProtectedRoute><MyProfile /></ProtectedRoute></Layout>} />
      <Route path="/profile/edit" element={<Layout><ProtectedRoute><EditProfile /></ProtectedRoute></Layout>} />
      <Route path="/profile/change-password" element={<Layout><ProtectedRoute><ChangePassword /></ProtectedRoute></Layout>} />

      {/* Customer */}
      <Route path="/dashboard" element={<Layout><ProtectedRoute role="user"><Dashboard /></ProtectedRoute></Layout>} />
      <Route path="/wishlist" element={<Layout><ProtectedRoute role="user"><Wishlist /></ProtectedRoute></Layout>} />
      <Route path="/cart" element={<Layout><ProtectedRoute role="user"><Cart /></ProtectedRoute></Layout>} />
      <Route path="/checkout" element={<Layout><ProtectedRoute role="user"><Checkout /></ProtectedRoute></Layout>} />
      <Route path="/orders" element={<Layout><ProtectedRoute role="user"><MyOrders /></ProtectedRoute></Layout>} />
      <Route path="/orders/:id" element={<Layout><ProtectedRoute role="user"><OrderDetails /></ProtectedRoute></Layout>} />
      <Route path="/orders/:id/track" element={<Layout><ProtectedRoute role="user"><TrackOrder /></ProtectedRoute></Layout>} />
      <Route path="/reviews" element={<Layout><ProtectedRoute role="user"><MyReviews /></ProtectedRoute></Layout>} />
      <Route path="/reviews/add/:bagId" element={<Layout><ProtectedRoute role="user"><AddReview /></ProtectedRoute></Layout>} />

      {/* Vendor */}
      <Route path="/vendor/dashboard" element={<ProtectedRoute role="vendor"><VendorLayout><VendorDashboard /></VendorLayout></ProtectedRoute>} />
      <Route path="/vendor/products" element={<ProtectedRoute role="vendor"><VendorLayout><MyProducts /></VendorLayout></ProtectedRoute>} />
      <Route path="/vendor/products/add" element={<ProtectedRoute role="vendor"><VendorLayout><AddProduct /></VendorLayout></ProtectedRoute>} />
      <Route path="/vendor/products/edit/:id" element={<ProtectedRoute role="vendor"><VendorLayout><EditProduct /></VendorLayout></ProtectedRoute>} />
      <Route path="/vendor/inventory" element={<ProtectedRoute role="vendor"><VendorLayout><Inventory /></VendorLayout></ProtectedRoute>} />
      <Route path="/vendor/orders" element={<ProtectedRoute role="vendor"><VendorLayout><VendorOrders /></VendorLayout></ProtectedRoute>} />
      <Route path="/vendor/orders/:id" element={<ProtectedRoute role="vendor"><VendorLayout><VendorOrderDetails /></VendorLayout></ProtectedRoute>} />
      <Route path="/vendor/earnings" element={<ProtectedRoute role="vendor"><VendorLayout><Earnings /></VendorLayout></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminLayout><ManageUsers /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/vendors" element={<ProtectedRoute role="admin"><AdminLayout><ManageVendors /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute role="admin"><AdminLayout><AdminProducts /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute role="admin"><AdminLayout><Categories /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute role="admin"><AdminLayout><AdminOrders /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/finance" element={<ProtectedRoute role="admin"><AdminLayout><Finance /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/reviews" element={<ProtectedRoute role="admin"><AdminLayout><Moderation /></AdminLayout></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StoreProvider>
          <AppRoutes />
        </StoreProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
