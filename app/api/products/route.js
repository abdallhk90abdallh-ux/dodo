import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/lib/models/Product";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const testing = searchParams.get("testing");

  let filter = { isPublished: true };
  if (testing === "true") {
    filter = { isTesting: true };
  }

  const products = await Product.find(filter);
  return NextResponse.json(products);
}

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  const newProduct = await Product.create(body);
  return NextResponse.json(newProduct, { status: 201 });
}
