import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import Product from "@/lib/models/Product";
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

    // Check size availability and decrement stock per item
    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) continue;

      const product = await Product.findById(item.productId);
      if (!product) {
        return new Response(JSON.stringify({ error: `Product ${item.productId} not found` }), { status: 404 });
      }

      const rawSize = item.size || "";
      const selectedSize = String(rawSize).trim();
      if (product.requiresSize && !selectedSize) {
        return new Response(
          JSON.stringify({ error: `Size is required for ${product.name}.` }),
          { status: 400 }
        );
      }

      if (selectedSize) {
        const currentStock = (() => {
          if (!product.sizes) return null;
          if (typeof product.sizes.get === "function") {
            const v = product.sizes.get(selectedSize);
            return v != null ? Number(v) : null;
          }
          // fallback plain object
          const v = product.sizes[selectedSize] ?? product.sizes[String(Number(selectedSize))];
          return v != null ? Number(v) : null;
        })();

        if (currentStock === null) {
          return new Response(
            JSON.stringify({ error: `Selected size ${selectedSize} not available for ${product.name}.` }),
            { status: 400 }
          );
        }

        if (currentStock < item.quantity) {
          return new Response(
            JSON.stringify({ error: `Not enough stock for ${product.name} size ${selectedSize}` }),
            { status: 400 }
          );
        }

        if (typeof product.sizes.set === "function") {
          product.sizes.set(selectedSize, currentStock - item.quantity);
          if (product.sizes.get(selectedSize) <= 0) {
            product.sizes.delete(selectedSize);
          }
        } else {
          product.sizes[selectedSize] = currentStock - item.quantity;
          if (product.sizes[selectedSize] <= 0) {
            delete product.sizes[selectedSize];
          }
        }

        await product.save();
      }
    }

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
                `<li>${item.name} ${item.size ? ` (size ${item.size})` : ""} — ${item.quantity} × ${item.price} EGP</li>`
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
