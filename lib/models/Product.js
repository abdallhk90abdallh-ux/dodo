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
    isTesting: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    voteCount: { type: Number, default: 0 },
    productCounter: { type: Number, default: 0 },
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
