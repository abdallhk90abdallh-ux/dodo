import { getServerSession } from "next-auth/next"; 
import { authOptions } from "../../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/lib/models/Order";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    // 🔐 Admin only
    if (!session || session.user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    await dbConnect();

    // ✅ FIXED
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();

    let filter = {};

    if (search) {
      const regex = new RegExp(
        search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      const orConditions = [
        { phone: { $regex: regex } },
        { address: { $regex: regex } },
      ];

      // ✅ valid ObjectId only
      if (/^[0-9a-fA-F]{24}$/.test(search)) {
        orConditions.push({ _id: search });
      }

      filter = { $or: orConditions };
    }

    let orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // ✅ safer filtering
    if (search) {
      const t = search.toLowerCase();

      orders = orders.filter((order) => {
        const user = order.user || {};

        return (
          user.name?.toLowerCase().includes(t) ||
          user.email?.toLowerCase().includes(t) ||
          String(order.phone || "").toLowerCase().includes(t) ||
          String(order.address || "").toLowerCase().includes(t) ||
          String(order._id) === search
        );
      });
    }

    return new Response(JSON.stringify(orders), { status: 200 });

  } catch (error) {
    console.error("Admin Get Orders Error:", error);

    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}