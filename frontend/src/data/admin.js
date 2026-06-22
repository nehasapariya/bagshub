// Admin static data

export const adminStats = {
  totalUsers: 1284,
  totalVendors: 47,
  totalProducts: 312,
  totalOrders: 2891,
  totalRevenue: 4823600,
  platformCommission: 8.5,
  pendingApprovals: 6,
  reportedProducts: 3,
  reportedReviews: 5,
};

export const adminUsers = [
  { id: "U001", name: "Neha Sapariya", email: "neha@example.com", phone: "+91 98765 43210", role: "customer", status: "active", joined: "Jan 2024", orders: 3, avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=Neha" },
  { id: "U002", name: "Priya Mehta", email: "priya@example.com", phone: "+91 91234 11111", role: "customer", status: "active", joined: "Feb 2024", orders: 7, avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=Priya" },
  { id: "U003", name: "Karan Patel", email: "karan@example.com", phone: "+91 99887 22222", role: "customer", status: "blocked", joined: "Mar 2024", orders: 1, avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=Karan" },
  { id: "U004", name: "Anjali Tiwari", email: "anjali@example.com", phone: "+91 98001 33333", role: "customer", status: "active", joined: "Apr 2024", orders: 5, avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=Anjali" },
  { id: "U005", name: "Sneha Rao", email: "sneha@example.com", phone: "+91 97654 44444", role: "customer", status: "active", joined: "Apr 2024", orders: 2, avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=Sneha" },
  { id: "U006", name: "Rahul Sharma", email: "rahul@example.com", phone: "+91 96543 55555", role: "customer", status: "active", joined: "May 2024", orders: 4, avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=Rahul" },
];

export const adminVendors = [
  { id: "V001", name: "Riya Bags Co.", email: "riya@bagshub.com", phone: "+91 91234 56789", status: "active", joined: "Mar 2023", products: 6, totalSales: 58450, rating: 4.7, avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=Riya" },
  { id: "V002", name: "StyleCraft India", email: "stylecraft@bagshub.com", phone: "+91 90000 12345", status: "active", joined: "Jun 2023", products: 12, totalSales: 124300, rating: 4.5, avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=StyleCraft" },
  { id: "V003", name: "TravelMate Bags", email: "travelmate@bagshub.com", phone: "+91 88888 99999", status: "active", joined: "Aug 2023", products: 8, totalSales: 87200, rating: 4.3, avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=TravelMate" },
  { id: "V004", name: "LuxBag Studio", email: "luxbag@bagshub.com", phone: "+91 77777 11111", status: "blocked", joined: "Sep 2023", products: 4, totalSales: 22100, rating: 3.8, avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=LuxBag" },
  { id: "V005", name: "EcoCarry", email: "ecocarry@bagshub.com", phone: "+91 66666 22222", status: "pending", joined: "May 2025", products: 0, totalSales: 0, rating: 0, avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=EcoCarry" },
];

export const adminProducts = [
  { id: 201, name: "Urban Explorer Backpack", vendor: "Riya Bags Co.", category: "backpack", price: 2499, status: "approved", reported: false, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", createdAt: "10 Jan 2025" },
  { id: 202, name: "Luxe Leather Handbag", vendor: "StyleCraft India", category: "handbag", price: 4999, status: "approved", reported: false, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400", createdAt: "15 Jan 2025" },
  { id: 203, name: "Wanderlust Travel Bag", vendor: "TravelMate Bags", category: "travel", price: 3799, status: "approved", reported: false, image: "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=400", createdAt: "20 Jan 2025" },
  { id: 204, name: "Boho Fringe Bag", vendor: "LuxBag Studio", category: "handbag", price: 2199, status: "pending", reported: false, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400", createdAt: "2 May 2025" },
  { id: 205, name: "Eco Hemp Tote", vendor: "EcoCarry", category: "tote", price: 999, status: "pending", reported: false, image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400", createdAt: "5 May 2025" },
  { id: 206, name: "Fake Designer Bag", vendor: "LuxBag Studio", category: "handbag", price: 8999, status: "approved", reported: true, image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400", createdAt: "1 Apr 2025" },
  { id: 207, name: "Trekker Pro Backpack", vendor: "TravelMate Bags", category: "backpack", price: 5499, status: "approved", reported: false, image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400", createdAt: "18 Feb 2025" },
  { id: 208, name: "Vintage Satchel", vendor: "Riya Bags Co.", category: "handbag", price: 3299, status: "rejected", reported: false, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", createdAt: "22 Mar 2025" },
];

export const adminOrders = [
  { id: "ORD001", customer: "Neha Sapariya", vendor: "Riya Bags Co.", product: "Urban Explorer Backpack", date: "12 Apr 2025", amount: 2499, status: "Delivered", issue: null, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },
  { id: "ORD002", customer: "Priya Mehta", vendor: "StyleCraft India", product: "Luxe Leather Handbag", date: "28 Mar 2025", amount: 4999, status: "Delivered", issue: null, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400" },
  { id: "ORD003", customer: "Anjali Tiwari", vendor: "TravelMate Bags", product: "Office Tote Bag", date: "5 May 2025", amount: 3798, status: "Shipped", issue: null, image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400" },
  { id: "ORD004", customer: "Karan Patel", vendor: "TravelMate Bags", product: "Trekker Pro Backpack", date: "1 May 2025", amount: 5499, status: "Delivered", issue: null, image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400" },
  { id: "ORD005", customer: "Sneha Rao", vendor: "Riya Bags Co.", product: "Urban Explorer Backpack", date: "28 Apr 2025", amount: 2499, status: "Pending", issue: "Customer reported wrong item delivered", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },
  { id: "ORD006", customer: "Rahul Sharma", vendor: "LuxBag Studio", product: "Fake Designer Bag", date: "10 May 2025", amount: 8999, status: "Processing", issue: "Suspected counterfeit product", image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400" },
];

export const adminReviews = [
  { id: 1, user: "Neha S.", product: "Urban Explorer Backpack", productId: 201, rating: 5, comment: "Absolutely love this backpack! Very spacious and sturdy.", date: "15 Apr 2025", status: "approved", reported: false },
  { id: 2, user: "Priya M.", product: "Luxe Leather Handbag", productId: 202, rating: 4, comment: "Great quality leather, looks premium. Slightly heavy though.", date: "2 Apr 2025", status: "approved", reported: false },
  { id: 3, user: "Karan P.", product: "Fake Designer Bag", productId: 206, rating: 1, comment: "This is a fake product! Totally misleading description. Scam!", date: "12 May 2025", status: "pending", reported: true },
  { id: 4, user: "Anjali T.", product: "Wanderlust Travel Bag", productId: 203, rating: 5, comment: "Perfect travel bag, wheels are smooth and lock works great.", date: "5 Mar 2025", status: "approved", reported: false },
  { id: 5, user: "Sneha R.", product: "Urban Explorer Backpack", productId: 201, rating: 2, comment: "Spam spam buy cheap bags at xyz.com click here!!!", date: "10 May 2025", status: "pending", reported: true },
];

export const adminCategories = [
  { id: "C001", name: "Backpacks", icon: "🎒", products: 89, status: "active" },
  { id: "C002", name: "Handbags", icon: "👜", products: 124, status: "active" },
  { id: "C003", name: "Travel Bags", icon: "🧳", products: 56, status: "active" },
  { id: "C004", name: "Tote Bags", icon: "🛍️", products: 43, status: "active" },
  { id: "C005", name: "Wallets", icon: "👛", products: 0, status: "inactive" },
];

export const platformRevenue = [
  { month: "Jan", revenue: 698000, commission: 59330 },
  { month: "Feb", revenue: 1054000, commission: 89590 },
  { month: "Mar", revenue: 1343000, commission: 114155 },
  { month: "Apr", revenue: 2065000, commission: 175525 },
  { month: "May", revenue: 1568000, commission: 133280 },
];
