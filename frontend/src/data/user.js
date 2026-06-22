// Static credentials — role-based login
export const staticCredentials = [
  // Customer
  { email: "neha@example.com",    password: "neha1234",   role: "customer", redirect: "/dashboard" },
  { email: "priya@example.com",   password: "priya1234",  role: "customer", redirect: "/dashboard" },
  // Vendor
  { email: "riya@bagshub.com",    password: "riya1234",   role: "vendor",   redirect: "/vendor/dashboard" },
  { email: "stylecraft@bagshub.com", password: "style123", role: "vendor",  redirect: "/vendor/dashboard" },
  // Admin
  { email: "admin@bagshub.com",   password: "admin123",   role: "admin",    redirect: "/admin/dashboard" },
];

// Static logged-in user data
export const currentUser = {
  name: "Neha Sapariya",
  email: "neha@example.com",
  phone: "+91 98765 43210",
  address: "12, MG Road, Ahmedabad, Gujarat - 380001",
  avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=Neha",
  joinedDate: "January 2024",
  orders: [
    { id: "ORD001", product: "Urban Explorer Backpack", date: "12 Apr 2025", status: "Delivered", amount: 2499 },
    { id: "ORD002", product: "Luxe Leather Handbag",   date: "28 Mar 2025", status: "Delivered", amount: 4999 },
    { id: "ORD003", product: "Mini Crossbody Bag",     date: "10 May 2025", status: "Processing", amount: 1299 },
  ],
};
