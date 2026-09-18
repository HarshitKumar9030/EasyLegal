import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Case from "@/models/Case";
import { performLegalResearch } from "@/lib/research-agent";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const caseData = await Case.findById(id);
    
    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json({ sources: caseData.sources || [] });
  } catch (error) {
    console.error("Fetch sources error:", error);
    return NextResponse.json({ error: "Failed to fetch sources" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const caseData = await Case.findById(id);
    
    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    // Run the research agent
    const newSources = await performLegalResearch(
      caseData.issue,
      caseData.facts,
      caseData.jurisdiction
    );

    // Append new sources
    if (newSources && newSources.length > 0) {
      caseData.sources = [...(caseData.sources || []), ...newSources];
      caseData.status = "Evidence";
      await caseData.save();
    }

    return NextResponse.json({ sources: caseData.sources });
  } catch (error) {
    console.error("Research error:", error);
    return NextResponse.json({ error: "Failed to perform research" }, { status: 500 });
  }
}