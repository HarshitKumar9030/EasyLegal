import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Case from "@/models/Case";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const caseData = await Case.findById(id);
    
    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json(caseData);
  } catch (error) {
    console.error("Fetch case error:", error);
    return NextResponse.json({ error: "Failed to fetch case" }, { status: 500 });
  }
}