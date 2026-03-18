import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/lib/models/Product";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json({ message: "Error adding product" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "all";
    let filter = {};

    if (mode === "testing") {
      filter = { isTesting: true };
    } else if (mode === "published") {
      filter = { isPublished: true, isTesting: false };
    } else if (mode === "hidden") {
      filter = { isPublished: false, isTesting: false };
    } else {
      filter = {};
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ message: "Error fetching products" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await dbConnect();
    const { id, updates } = await req.json();
    if (!id || !updates) {
      return NextResponse.json({ message: "Missing id or updates" }, { status: 400 });
    }
    const product = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error patching product:", error);
    return NextResponse.json({ message: "Error patching product" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ message: "Error deleting product" }, { status: 500 });
  }
}
