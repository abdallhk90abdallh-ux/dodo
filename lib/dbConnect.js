import mongoose from "mongoose";

let isConnected = false;

export async function dbConnect() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    isConnected = true;

    console.log("MongoDB Connected");
  } catch (error) {
    console.error(error);
    throw new Error("Database connection failed");
  }
}