// ...existing code...
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/dbConnect";
import Order from "@/lib/models/Order";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    await dbConnect();
    const { status } = await req.json();

    // Await params as required by Next.js App Router
    const awaitedParams = await params;
    const id = awaitedParams.id;

    const updated = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("user"); // ✅ re-populate the user

    if (!updated)
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
      });

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (error) {
    console.error("Update Order Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

  export async function DELETE(req, { params }) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== "admin") {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
        });
      }

      await dbConnect();

      const awaitedParams = await params;
      const id = awaitedParams.id;

      const deleted = await Order.findByIdAndDelete(id);
      if (!deleted) {
        return new Response(JSON.stringify({ error: "Order not found" }), {
          status: 404,
        });
      }

      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
      console.error("Delete Order Error:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
      });
    }
  }
// ...existing code...