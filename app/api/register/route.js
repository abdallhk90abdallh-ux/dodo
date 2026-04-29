import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    // 1. Connect to Database
    await dbConnect();

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    // 3. Hash the password (Security)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create New User
    await User.create({ 
      name, 
      email, 
      password: hashedPassword,
      role: "user" // Default role is user
    });

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error while registering user" }, { status: 500 });
  }
}