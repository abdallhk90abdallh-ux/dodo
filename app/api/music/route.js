import { dbConnect } from "@/lib/dbConnect";
import Music from "@/lib/models/Music";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await dbConnect();
    const songs = await Music.find().sort({ order: 1 }).lean();
    return Response.json(songs);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Check admin access
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { url, title } = await req.json();

    if (!url) {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }

    // Check if URL already exists
    const existing = await Music.findOne({ url });
    if (existing) {
      return Response.json({ error: "Song already exists" }, { status: 400 });
    }

    // Get the next order number
    const lastSong = await Music.findOne().sort({ order: -1 });
    const nextOrder = lastSong ? lastSong.order + 1 : 0;

    const song = new Music({
      url,
      title: title || url.split("/").pop(),
      order: nextOrder,
    });

    await song.save();
    return Response.json(song, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    // Check admin access
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await req.json();

    if (!id) {
      return Response.json({ error: "Song ID is required" }, { status: 400 });
    }

    const song = await Music.findByIdAndDelete(id);
    if (!song) {
      return Response.json({ error: "Song not found" }, { status: 404 });
    }

    return Response.json({ message: "Song deleted", song });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
