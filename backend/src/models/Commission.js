import mongoose from "mongoose";

const commissionSchema = new mongoose.Schema(
  {
    rate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 8.5,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Commission = mongoose.model("Commission", commissionSchema);
export default Commission;
