import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema(
  {
    heroTitle: { type: String, default: "Premium Bags for Every Journey" },
    heroSubtitle: {
      type: String,
      default:
        "Discover our collection of handcrafted bags designed for style and functionality.",
    },
    heroImage: { type: String, default: "" },
    heroImageEnabled: { type: Boolean, default: false },
    // Width in pixels (number). Default 224px. Height 0 = auto.
    heroImageWidth: { type: Number, default: 224 },
    heroImageHeight: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
