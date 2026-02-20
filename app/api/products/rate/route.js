import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/lib/models/Product";
import Order from "@/lib/models/Order";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { productId, rating, comment } = await req.json();
    if (!productId || !rating) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    await dbConnect();

    // Verify the user actually ordered this product at least once
    const hasOrdered = await Order.findOne({
      user: session.user.id,
      "items.productId": productId,
    });

    if (!hasOrdered) {
      return new Response(JSON.stringify({ error: "You can only rate products you purchased" }), { status: 403 });
    }

    const product = await Product.findById(productId);
    if (!product) return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });

    // Check if user already reviewed
    const existing = product.reviews?.find((r) => String(r.user) === String(session.user.id));
    if (existing) {
      existing.rating = rating;
      if (comment) existing.comment = comment;
    } else {
      product.reviews = product.reviews || [];
      product.reviews.push({ user: session.user.id, rating, comment });
    }

    // Recalculate avgRating and ratingsCount
    const ratings = product.reviews.map((r) => r.rating || 0);
    const ratingsCount = ratings.length;
    const avg = ratingsCount ? ratings.reduce((a, b) => a + b, 0) / ratingsCount : 0;
    product.avgRating = Math.round((avg + Number.EPSILON) * 10) / 10; // one decimal
    product.ratingsCount = ratingsCount;

    await product.save();

    return new Response(JSON.stringify({ success: true, avgRating: product.avgRating, ratingsCount }), { status: 200 });
  } catch (error) {
    console.error("Rate Product Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
