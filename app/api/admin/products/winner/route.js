import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/lib/models/Product";

export async function POST(req) {
  try {
    await dbConnect();
    const { productId } = await req.json();
    if (!productId) return NextResponse.json({ message: "Missing productId" }, { status: 400 });

    const winner = await Product.findById(productId);
    if (!winner) return NextResponse.json({ message: "Product not found" }, { status: 404 });

    // Demote all current testing products
    await Product.updateMany({ isTesting: true }, { isTesting: false, isPublished: false });

    // Publish winner
    winner.isTesting = false;
    winner.isPublished = true;
    winner.productCounter = (winner.productCounter || 0) + 1;
    await winner.save();

    return NextResponse.json({ success: true, product: winner });
  } catch (error) {
    console.error("Error choosing winner:", error);
    return NextResponse.json({ message: "Error choosing winner" }, { status: 500 });
  }
}
