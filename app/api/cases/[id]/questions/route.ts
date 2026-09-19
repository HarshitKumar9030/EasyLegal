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
    
    const caseData = await Case.findById(id);
    if (!caseData) return NextResponse.json({ error: "Case not found" }, { status: 404 });

    const newFacts = Object.values(answers).filter(Boolean) as string[];
    
    // Use AI to process answers and update case details
    const { object } = await generateObject({
      model: google("gemini-3.8-flash"),
      schema: z.object({
        facts: z.array(z.string()),
        parties: z.array(z.object({
          role: z.string(),
          name: z.string()
        })),
        amounts: z.array(z.object({
          value: z.number(),
          currency: z.string(),
          description: z.string()
        })),
        escalationPlan: z.array(z.object({
          stage: z.number(),
          purpose: z.string(),
          action: z.string(),
          evidenceRequired: z.array(z.string()),
          documentsRequired: z.array(z.string()),
          sourceBasis: z.array(z.string()),
          conditionsForEscalation: z.string(),
          importantUncertainties: z.string()
        }))
      }),
      system: `You are an expert legal analyst. 
The user has provided answers to clarifying questions.
Update the case facts, parties, amounts, and escalation plan based on these new answers.
Merge the new information with the existing case data.
Ensure the escalation plan is detailed and actionable.`,
      prompt: `Existing Facts: ${JSON.stringify(caseData.facts)}
Existing Parties: ${JSON.stringify(caseData.parties)}
Existing Amounts: ${JSON.stringify(caseData.amounts)}
Existing Escalation Plan: ${JSON.stringify(caseData.escalationPlan)}

New Answers from User: ${JSON.stringify(newFacts)}

Please provide the updated facts, parties, amounts, and escalation plan.`,
    });

    caseData.facts = object.facts;
    caseData.parties = object.parties;
    caseData.amounts = object.amounts;
    caseData.escalationPlan = object.escalationPlan;
    caseData.openQuestions = []; // Clear unknowns since they are answered
    caseData.status = "Research";
    await caseData.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Submit answers error:", error);
    return NextResponse.json({ error: "Failed to submit answers" }, { status: 500 });
  }
}