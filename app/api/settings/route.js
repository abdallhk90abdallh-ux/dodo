import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import Setting from "@/lib/models/Setting";

export async function GET() {
  try {
    await dbConnect();
    const setting = await Setting.findOne({});
    return NextResponse.json(setting || {});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching settings" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    // Upsert: update existing or create new
    let setting = await Setting.findOne({});
    if (setting) {
      setting.heroTitle = body.heroTitle;
      setting.heroSubtitle = body.heroSubtitle;
      setting.heroImage = body.heroImage;
      setting.heroImageEnabled = !!body.heroImageEnabled;
      setting.heroImageWidth = Number(body.heroImageWidth) || 224;
      setting.heroImageHeight = Number(body.heroImageHeight) || 0;
      await setting.save();
    } else {
      setting = await Setting.create({
        heroTitle: body.heroTitle,
        heroSubtitle: body.heroSubtitle,
        heroImage: body.heroImage,
        heroImageEnabled: !!body.heroImageEnabled,
        heroImageWidth: Number(body.heroImageWidth) || 224,
        heroImageHeight: Number(body.heroImageHeight) || 0,
      });
    }

    return NextResponse.json(setting);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error saving settings" }, { status: 500 });
  }
}