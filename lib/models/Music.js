import mongoose from "mongoose";

const MusicSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, unique: true },
    title: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Music || mongoose.model("Music", MusicSchema);
