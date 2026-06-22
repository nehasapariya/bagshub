import api from "./api.js";

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
};

export const productService = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  search: (q) => api.get("/products/search", { params: { q } }),
  filter: (params) => api.get("/products/filter", { params }),
};

export const categoryService = {
  getAll: () => api.get("/categories"),
  create: (data) => api.post("/categories", data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const cartService = {
  get: () => api.get("/cart"),
  add: (data) => api.post("/cart", data),
  update: (productId, qty) => api.patch(`/cart/${productId}`, { qty }),
  remove: (productId) => api.delete(`/cart/${productId}`),
};

export const wishlistService = {
  get: () => api.get("/wishlist"),
  toggle: (productId) => api.post("/wishlist", { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
};

export const orderService = {
  place: (data) => api.post("/orders", data),
  getMy: (params) => api.get("/orders/my", { params }),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
};

export const reviewService = {
  getByProduct: (productId) => api.get(`/reviews/${productId}`),
  add: (data) => api.post("/reviews", data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const userService = {
  getDashboard: () => api.get("/user/dashboard"),
  updateProfile: (data) => api.patch("/auth/me", data),
};

export const vendorService = {
  getDashboard: () => api.get("/vendor/dashboard"),
  getProducts: (params) => api.get("/vendor/products", { params }),
  getProductById: (id) => api.get(`/vendor/products/${id}`),
  createProduct: (data) => api.post("/vendor/products", data),
  updateProduct: (id, data) => api.put(`/vendor/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/vendor/products/${id}`),
  getInventory: () => api.get("/vendor/inventory"),
  updateStock: (id, stock) => api.patch(`/vendor/inventory/${id}`, { stock }),
  getOrders: (params) => api.get("/vendor/orders", { params }),
  getOrderById: (id) => api.get(`/vendor/orders/${id}`),
  updateOrderStatus: (id, status) => api.patch(`/vendor/orders/${id}/status`, { status }),
  getEarnings: () => api.get("/vendor/earnings"),
  getPayouts: () => api.get("/vendor/payouts"),
  requestPayout: () => api.post("/vendor/payouts/request"),
};

export const adminService = {
  getDashboard: () => api.get("/admin/dashboard"),
  getUsers: (params) => api.get("/admin/users", { params }),
  toggleBlock: (id) => api.patch(`/admin/users/${id}/block`),
  updateRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  getProducts: (params) => api.get("/admin/products", { params }),
  approveProduct: (id) => api.patch(`/admin/products/${id}/approve`),
  rejectProduct: (id) => api.patch(`/admin/products/${id}/reject`),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getOrders: (params) => api.get("/admin/orders", { params }),
  updateOrderStatus: (id, status) => api.patch(`/admin/orders/${id}/status`, { status }),
  getRevenue: () => api.get("/admin/revenue"),
  getCommissions: () => api.get("/admin/commissions"),
  updateCommission: (rate) => api.patch("/admin/commissions", { rate }),
  getPayouts: (params) => api.get("/admin/payouts", { params }),
  markPayoutPaid: (id) => api.patch(`/admin/payouts/${id}/pay`),
  getReviews: (params) => api.get("/admin/reviews", { params }),
  moderateReview: (id, data) => api.patch(`/admin/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
};
