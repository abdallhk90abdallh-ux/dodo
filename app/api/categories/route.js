import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Category from "@/lib/models/Category";

export async function GET() {
  try {
    await dbConnect();
    let cats = await Category.find({}).sort({ name: 1 });

    // Auto-seed default categories if none exist
    if (!cats || cats.length === 0) {
      const defaults = ["man", "woman", "sport", "kids"];
      const docs = defaults.map((n) => ({ name: n, subcategories: [] }));
      try {
        await Category.insertMany(docs, { ordered: false });
      } catch (err) {
        // ignore duplicate/key errors during concurrent inserts
      }
      cats = await Category.find({}).sort({ name: 1 });
    }

    return NextResponse.json(cats);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching categories" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const { name } = await req.json();
    if (!name) return NextResponse.json({ message: "Missing name" }, { status: 400 });
    const exists = await Category.findOne({ name });
    if (exists) return NextResponse.json({ message: "Category exists" }, { status: 400 });
    const cat = await Category.create({ name, subcategories: [] });
    return NextResponse.json(cat, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error creating category" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const { id, name, subcategories } = await req.json();
    if (!id || (!name && !Array.isArray(subcategories))) {
      return NextResponse.json({ message: "Missing id or updates" }, { status: 400 });
    }

    const updates = {};
    if (name) updates.name = name;
    if (Array.isArray(subcategories)) updates.subcategories = subcategories;

    const cat = await Category.findByIdAndUpdate(id, updates, { new: true });
    return NextResponse.json(cat);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error updating category" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });
    await Category.findByIdAndDelete(id);
    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error deleting category" }, { status: 500 });
  }
}