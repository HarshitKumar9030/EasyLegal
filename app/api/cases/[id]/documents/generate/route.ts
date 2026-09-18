import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import dbConnect from "@/lib/db";
import Case from "@/models/Case";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
        title: z.string(),
        body: z.string(),
        factsUsed: z.array(z.string()),
        missingInformation: z.array(z.string()),
      }),
      system: `You are the document-drafting component of EasyLegal.
Generate a professional draft using ONLY verified case facts.
Never invent facts, names, dates, amounts, or addresses.
Use placeholders like [LANDLORD NAME] for missing information.
Keep the tone professional, factual, firm, and non-threatening.
Clearly distinguish factual statements from legal assertions.`,
      prompt: `Issue: ${caseData.issue}\nFacts: ${JSON.stringify(caseData.facts)}\nParties: ${JSON.stringify(caseData.parties)}\nAmounts: ${JSON.stringify(caseData.amounts)}`,
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