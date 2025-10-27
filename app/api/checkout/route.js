import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
      });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    const { items, total } = await req.json();

    if (!items?.length)
      return new Response(JSON.stringify({ error: "Cart is empty" }), {
        status: 400,
      });

    const newOrder = await Order.create({
      user: user._id,
      items,
      total,
      address: user.address || "No address provided",
      phone: user.phone || "No phone provided",
      status: "pending",
    });

    // ✅ Populate the user field (to access name/email)
    const populatedOrder = await newOrder.populate("user", "name email");

    // ✅ Send admin notification with user info
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `🛍️ New Order Received - ${populatedOrder._id}`,
      html: `
        <h2>New Order Received</h2>
        <p><strong>Order ID:</strong> ${populatedOrder._id}</p>
        <p><strong>User:</strong> ${populatedOrder.user?.name || "N/A"}</p>
        <p><strong>Email:</strong> ${populatedOrder.user?.email || "N/A"}</p>
        <p><strong>Status:</strong> ${populatedOrder.status}</p>
        <p><strong>Total:</strong> ${populatedOrder.total || 0} EGP</p>
        <p><strong>Address:</strong> ${populatedOrder.address}</p>
        <p><strong>Phone:</strong> ${populatedOrder.phone}</p>
        <hr />
        <h3>Items:</h3>
        <ul>
          ${populatedOrder.items
            .map(
              (item) =>
                `<li>${item.name} — ${item.quantity} × ${item.price} EGP</li>`
            )
            .join("")}
        </ul>
      `,
    });

    return new Response(JSON.stringify(populatedOrder), { status: 201 });
  } catch (error) {
    console.error("Checkout Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
