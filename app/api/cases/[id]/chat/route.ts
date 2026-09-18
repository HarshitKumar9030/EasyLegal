import { NextRequest } from "next/server";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import dbConnect from "@/lib/db";
import Case from "@/models/Case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { messages } = await req.json();

    await dbConnect();
    const caseData = await Case.findById(id);

    if (!caseData) {
      return new Response("Case not found", { status: 404 });
    }

    const systemPrompt = `You are an expert AI legal assistant helping a user with their specific case.
    
Here are the details of the case:
Title: ${caseData.title}
Category: ${caseData.category}
Issue: ${caseData.issue}
Facts: ${caseData.facts?.join(", ")}
Parties: ${JSON.stringify(caseData.parties)}
Amounts: ${JSON.stringify(caseData.amounts)}
Jurisdiction: ${JSON.stringify(caseData.jurisdiction)}

Your role is to:
1. Answer questions about the case facts and potential legal strategies.
2. Explain legal concepts in simple, easy-to-understand language.
3. If the user asks to draft a document (like a demand letter, complaint, or notice), generate a professional draft based on the case facts.
4. Always remind the user that you are an AI and this is not formal legal advice.

Be empathetic, clear, and highly structured in your responses.`;

    const result = streamText({
      model: google("gemini-1.5-flash"),
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}