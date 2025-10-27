import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/lib/models/User";

export async function PUT(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
  }

  const { phone, address } = await req.json();

  const updatedUser = await User.findOneAndUpdate(
    { email: session.user.email },
    { phone, address },
    { new: true } // ← return the updated document
  );

  return new Response(JSON.stringify(updatedUser), { status: 200 });
}