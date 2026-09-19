import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import dbConnect from "@/lib/db";
import Case from "@/models/Case";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const evidenceContext = body.evidenceContext || "";

    await dbConnect();
    const caseData = await Case.findById(id);
    
    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const { object } = await generateObject({
      model: google("gemini-3.8-flash"),
      schema: z.object({
        title: z.string(),
        body: z.string(),
        factsUsed: z.array(z.string()),
        missingInformation: z.array(z.string()),
      }),
      system: `You are the document-drafting component of EasyLegal.
Generate a professional, highly structured legal notice using ONLY verified case facts.
Never invent facts, names, dates, amounts, or addresses. Use placeholders like [NAME] for missing information.
Keep the tone professional, factual, firm, and authoritative.
CRITICAL: You MUST format the document body as clean, semantic HTML (not markdown). 
Use inline CSS to make it look like a premium, professionally designed legal notice (like a Canva template).
Include a centered, bold letterhead at the top (e.g., "LEGAL NOTICE" with a border bottom).
Use proper spacing, margins, and typography (e.g., <div style="text-align: right; margin-bottom: 20px;">Date: ...</div>).
Include a reference number, subject line, and formal salutation.
Properly reference relevant articles of the Constitution (e.g., Article 21 - Right to Life, which includes the right to live with dignity and can extend to companion animals in some interpretations) or relevant penal codes (e.g., IPC Section 428/429 or BNS equivalents for mischief by killing an animal, Prevention of Cruelty to Animals Act).
The output should look like a premium, professionally drafted legal notice ready to be printed.`,
      prompt: `Issue: ${caseData.issue}\nFacts: ${JSON.stringify(caseData.facts)}\nParties: ${JSON.stringify(caseData.parties)}\nAmounts: ${JSON.stringify(caseData.amounts)}\n\n${evidenceContext}`,
    });

    // Save document to case
    caseData.documents.push(object);
    await caseData.save();

    return NextResponse.json(object);
  } catch (error) {
    console.error("Document generation error:", error);
    return NextResponse.json({ error: "Failed to generate document" }, { status: 500 });
  }
}