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

    const { productId, rating: ratingRaw, comment } = await req.json();
    if (!productId || ratingRaw === undefined || ratingRaw === null) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    let rating = ratingRaw;
    if (typeof rating === "string") {
      const value = rating.trim().toLowerCase();
      if (value === "like") rating = 1;
      else if (value === "dislike") rating = -1;
      else rating = Number(value);
    }

    if (typeof rating !== "number" || Number.isNaN(rating)) {
      return new Response(JSON.stringify({ error: "Invalid rating" }), { status: 400 });
    }

    const allowed = [1, 2, 3, 4, 5, -1];
    if (!allowed.includes(rating)) {
      return new Response(JSON.stringify({ error: "Rating must be like/dislike or 1-5" }), { status: 400 });
    }

    await dbConnect();

    // Verify the user actually ordered this product at least once
    const product = await Product.findById(productId);
    if (!product) return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });

    if (!product.isTesting) {
      const hasOrdered = await Order.findOne({
        user: session.user.id,
        "items.productId": productId,
      });

      if (!hasOrdered) {
        return new Response(JSON.stringify({ error: "You can only rate products you purchased" }), { status: 403 });
      }
    }

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
    const ratingsCount = (product.reviews || []).length;
    if (ratingsCount === 0) {
      product.avgRating = 0;
      product.ratingsCount = 0;
    } else {
      const isBinaryLikes = product.reviews.every((r) => r.rating === 1 || r.rating === -1);
      if (isBinaryLikes) {
        const likeCount = product.reviews.filter((r) => r.rating === 1).length;
        const percentLike = (likeCount / ratingsCount) * 100;
        product.avgRating = Math.round((percentLike + Number.EPSILON) * 10) / 10;
      } else {
        const ratings = product.reviews.map((r) => r.rating || 0);
        const avg = ratings.reduce((a, b) => a + b, 0) / ratingsCount;
        product.avgRating = Math.round((avg + Number.EPSILON) * 10) / 10;
      }
      product.ratingsCount = ratingsCount;
    }

    await product.save();

    return new Response(JSON.stringify({ success: true, avgRating: product.avgRating, ratingsCount }), { status: 200 });
  } catch (error) {
    console.error("Rate Product Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
