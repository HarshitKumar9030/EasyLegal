import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { google } from "@ai-sdk/google";
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

    const { object } = await generateObject({
      model: google("gemini-3.8-flash"),
      schema: z.object({
        questions: z.array(z.string()).max(5),
      }),
      system: `You are the question generator component of EasyLegal.
Based on the case facts and unknowns, generate 3-5 clarifying questions to ask the user.
Questions should be concise, understandable, relevant, and non-leading.
Do not ask questions they already answered.`,
      prompt: `Facts: ${JSON.stringify(caseData.facts)}\nUnknowns: ${JSON.stringify(caseData.openQuestions)}`,
    });

    return NextResponse.json(object);
  } catch (error) {
    console.error("Questions error:", error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { answers } = await req.json();
    await dbConnect();
    
    // In a real app, we would use an AI agent to process these answers and update the case facts.
    // For the hackathon MVP, we'll just append them to facts.
    const caseData = await Case.findById(id);
    if (!caseData) return NextResponse.json({ error: "Case not found" }, { status: 404 });

    const newFacts = Object.values(answers).filter(Boolean) as string[];
    caseData.facts.push(...newFacts);
    caseData.openQuestions = []; // Clear unknowns for simplicity
    caseData.status = "Research";
    await caseData.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Submit answers error:", error);
    return NextResponse.json({ error: "Failed to submit answers" }, { status: 500 });
  }
}