export const staticOrders = [
  {
    id: "ORD001",
    date: "12 Apr 2025",
    status: "Delivered",
    total: 2499,
    address: "12, MG Road, Ahmedabad, Gujarat - 380001",
    items: [
      { bagId: 1, name: "Urban Explorer Backpack", price: 2499, qty: 1, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", color: "Black" },
    ],
    tracking: [
      { step: "Order Placed", date: "12 Apr 2025", done: true },
      { step: "Packed", date: "13 Apr 2025", done: true },
      { step: "Shipped", date: "14 Apr 2025", done: true },
      { step: "Out for Delivery", date: "16 Apr 2025", done: true },
      { step: "Delivered", date: "16 Apr 2025", done: true },
    ],
  },
  {
    id: "ORD002",
    date: "28 Mar 2025",
    status: "Delivered",
    total: 4999,
    address: "12, MG Road, Ahmedabad, Gujarat - 380001",
    items: [
      { bagId: 2, name: "Luxe Leather Handbag", price: 4999, qty: 1, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400", color: "Brown" },
    ],
    tracking: [
      { step: "Order Placed", date: "28 Mar 2025", done: true },
      { step: "Packed", date: "29 Mar 2025", done: true },
      { step: "Shipped", date: "30 Mar 2025", done: true },
      { step: "Out for Delivery", date: "1 Apr 2025", done: true },
      { step: "Delivered", date: "1 Apr 2025", done: true },
    ],
  },
  {
    id: "ORD003",
    date: "10 May 2025",
    status: "Processing",
    total: 2598,
    address: "12, MG Road, Ahmedabad, Gujarat - 380001",
    items: [
      { bagId: 4, name: "Mini Crossbody Bag", price: 1299, qty: 2, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400", color: "Pink" },
    ],
    tracking: [
      { step: "Order Placed", date: "10 May 2025", done: true },
      { step: "Packed", date: "", done: false },
      { step: "Shipped", date: "", done: false },
      { step: "Out for Delivery", date: "", done: false },
      { step: "Delivered", date: "", done: false },
    ],
  },
];

export const staticReviews = [
  { id: 1, bagId: 1, user: "Neha S.", rating: 5, comment: "Absolutely love this backpack! Very spacious and sturdy.", date: "15 Apr 2025", helpful: 12 },
  { id: 2, bagId: 2, user: "Priya M.", rating: 4, comment: "Great quality leather, looks premium. Slightly heavy though.", date: "2 Apr 2025", helpful: 8 },
  { id: 3, bagId: 1, user: "Ravi K.", rating: 4, comment: "Good for daily use, laptop fits perfectly.", date: "20 Mar 2025", helpful: 5 },
  { id: 4, bagId: 3, user: "Anjali T.", rating: 5, comment: "Perfect travel bag, wheels are smooth and lock works great.", date: "5 Mar 2025", helpful: 20 },
  { id: 5, bagId: 5, user: "Karan P.", rating: 5, comment: "Best hiking backpack I've owned. Rain cover is a bonus!", date: "1 Feb 2025", helpful: 15 },
  { id: 6, bagId: 6, user: "Sneha R.", rating: 4, comment: "Spacious tote, fits everything for office. Good value.", date: "18 Jan 2025", helpful: 9 },
];
