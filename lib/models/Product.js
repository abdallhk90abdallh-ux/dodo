import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    // Support multiple images; keep `image` for backward compatibility
    images: { type: [String], default: [] },
    image: { type: String },
    description: { type: String },
    category: {
      type: String,
      required: true,
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: 1, max: 5 },
        comment: { type: String },
      },
    ],
    avgRating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
