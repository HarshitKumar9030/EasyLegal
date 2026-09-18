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

    if (!caseData.escalationPlan || caseData.escalationPlan.length === 0) {
      const { object } = await generateObject({
        model: google("gemini-3.8-flash"),
        schema: z.object({
          plan: z.array(z.object({
            stage: z.number(),
            purpose: z.string(),
            action: z.string(),
            evidenceRequired: z.array(z.string()),
          })),
        }),
        system: `You are the escalation-planning component of EasyLegal.
Transform verified case facts into practical possible next steps.
You are not a lawyer. Do not predict outcomes.
Every recommendation must be grounded in verified case facts.
Prefer practical, lower-escalation steps when appropriate.
Return a step-by-step plan.`,
        prompt: `Issue: ${caseData.issue}\nFacts: ${JSON.stringify(caseData.facts)}`,
      });

      caseData.escalationPlan = object.plan;
      await caseData.save();
    }

    return NextResponse.json(caseData);
  } catch (error) {
    console.error("Escalation error:", error);
    return NextResponse.json({ error: "Failed to generate escalation plan" }, { status: 500 });
  }
}