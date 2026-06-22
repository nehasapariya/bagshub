/**
 * Seeder — run once to populate initial data
 * Usage: node src/config/seeder.js
 */
import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "./db.js";
import User from "../models/User.js";
import Category from "../models/Category.js";

const categories = [
  { name: "Backpacks", icon: "🎒" },
  { name: "Handbags",  icon: "👜" },
  { name: "Travel Bags", icon: "🧳" },
  { name: "Tote Bags", icon: "🛍️" },
  { name: "Wallets",   icon: "👛" },
];

const users = [
  {
    name: "Super Admin",
    email: "admin@bagshub.com",
    password: "admin123",
    role: "admin",
    isEmailVerified: true,
  },
  {
    name: "Neha Sapariya",
    email: "neha@example.com",
    password: "neha1234",
    role: "user",
    isEmailVerified: true,
    phone: "+91 98765 43210",
    address: "12, MG Road, Ahmedabad, Gujarat - 380001",
  },
  {
    name: "Riya Bags Co.",
    email: "riya@bagshub.com",
    password: "riya1234",
    role: "vendor",
    isEmailVerified: true,
    phone: "+91 91234 56789",
  },
];

const seed = async () => {
  await connectDB();

  // Clear existing
  await User.deleteMany({});
  await Category.deleteMany({});

  // Insert
  await Category.insertMany(categories);
  console.log(`✅ ${categories.length} categories seeded`);

  // Users must go through model (password hashing)
  for (const u of users) {
    await User.create(u);
  }
  console.log(`✅ ${users.length} users seeded`);

  console.log("\n📋 Login Credentials:");
  users.forEach((u) => console.log(`  [${u.role.toUpperCase()}] ${u.email} / ${u.password}`));

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeder error:", err.message);
  process.exit(1);
});
