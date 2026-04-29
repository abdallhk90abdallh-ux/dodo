import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    // Support multiple images for the bag gallery
    images: { type: [String], default: [] },
    // Single image field for backward compatibility or main thumbnail
    image: { type: String },
    description: { type: String },
    category: {
      type: String,
      required: true,
    },
    isTesting: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    requiresSize: { type: Boolean, default: false },
    voteCount: { type: Number, default: 0 },
    productCounter: { type: Number, default: 0 },
    // Stores sizes like { "Large": 10, "Small": 5 }
    sizes: {
      type: Map,
      of: Number,
      default: {},
    },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rating: { type: Number, min: -1, max: 5 },
        comment: { type: String },
      },
    ],
    avgRating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Check if the model exists before creating a new one (important for Next.js)
export default mongoose.models.Product || mongoose.model("Product", ProductSchema);