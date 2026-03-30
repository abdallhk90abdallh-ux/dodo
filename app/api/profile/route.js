import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function PUT(req) {
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
  }

  const { phone, address, currentPassword, newPassword } = await req.json();

  const updateData = { phone, address };

  if (newPassword) {
    if (!currentPassword) {
      return new Response(JSON.stringify({ error: "Current password is required to change password" }), { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return new Response(JSON.stringify({ error: "Current password is incorrect" }), { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    updateData.password = hashedPassword;
  }

  const updatedUser = await User.findOneAndUpdate(
    { email: session.user.email },
    updateData,
    { new: true }
  );

  // remove password from response
  if (updatedUser) {
    const { password, ...safeUser } = updatedUser.toObject();
    return new Response(JSON.stringify(safeUser), { status: 200 });
  }

  return new Response(JSON.stringify({ error: "Update failed" }), { status: 500 });
}