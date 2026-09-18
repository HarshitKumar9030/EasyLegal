import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Case from "@/models/Case";

export async function GET() {
  try {
    await dbConnect();
    
    // Fetch cases for the demo user, sorted by newest first
    const cases = await Case.find({ userId: "demo-user" }).sort({ createdAt: -1 });
    
    return NextResponse.json(cases);
  } catch (error) {
    console.error("Failed to fetch cases:", error);
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 });
  }
}