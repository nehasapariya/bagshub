import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    vendorId:  { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
    name:  { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true },
    color: { type: String, default: "" },
    qty:   { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true },
    phone:   { type: String, required: true },
    address: { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true },
  },
  { _id: false }
);

// Each step in the order journey
const timelineEventSchema = new mongoose.Schema(
  {
    status:    { type: String, required: true },
    message:   { type: String, default: "" },
    updatedBy: { type: String, enum: ["user", "vendor", "admin", "system"], default: "system" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ── Status progression rules ──────────────────────────────────────────────────
// user   → Pending (on create) | Cancelled (only from Pending)
// vendor → Confirmed | Shipped | Delivered
// admin  → any status (override)
const STATUS_FLOW = {
  Pending:   ["Confirmed", "Cancelled"],
  Confirmed: ["Shipped"],
  Shipped:   ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(arr) => arr.length > 0, "Order must have at least one item"],
    },
    shippingAddress: { type: shippingAddressSchema, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    timeline: { type: [timelineEventSchema], default: [] },
    paymentMethod: { type: String, enum: ["COD"], default: "COD" },
    isPaid:      { type: Boolean, default: false },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    issue:       { type: String, default: null },
  },
  { timestamps: true }
);

// ── Hooks ─────────────────────────────────────────────────────────────────────
orderSchema.pre("save", async function () {
  if (this.isModified("status")) {
    if (this.status === "Delivered") {
      this.isDelivered = true;
      this.deliveredAt = new Date();
    }
    if (this.status === "Cancelled") {
      this.cancelledAt = new Date();
    }
  }

});

// ── Static: validate status transition ───────────────────────────────────────
orderSchema.statics.canTransition = function (currentStatus, newStatus, role) {
  if (role === "admin") return true; // admin can set any status
  const allowed = STATUS_FLOW[currentStatus] || [];
  return allowed.includes(newStatus);
};

// ── Static: status message map ────────────────────────────────────────────────
orderSchema.statics.statusMessage = {
  Pending:   "Order placed successfully.",
  Confirmed: "Order confirmed by vendor.",
  Shipped:   "Order has been shipped.",
  Delivered: "Order delivered successfully.",
  Cancelled: "Order has been cancelled.",
};

orderSchema.index({ userId: 1 });
orderSchema.index({ "items.vendorId": 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;
