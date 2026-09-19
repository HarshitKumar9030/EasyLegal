import { NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import dbConnect from "@/lib/db";
import Case from "@/models/Case";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { documentBody, prompt } = body;

    if (!documentBody || !prompt) {
      return NextResponse.json({ error: "Missing documentBody or prompt" }, { status: 400 });
    }

    await dbConnect();
    const caseData = await Case.findById(id);
    
    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const { text } = await generateText({
      model: google("gemini-3.8-flash"),
      system: `You are an expert legal document editor. 
You will be provided with the current HTML of a legal notice and a user's request for how to edit or format it.
Apply the requested changes to the HTML document.
CRITICAL: Return ONLY the updated HTML code. Do not include markdown formatting like \`\`\`html or any conversational text.
Ensure the output remains clean, semantic HTML with inline CSS, suitable for printing as a premium legal notice.`,
      prompt: `Current Document HTML:\n${documentBody}\n\nUser Request: ${prompt}`,
    });

    // Clean up the response in case the model includes markdown code blocks
    let updatedHtml = text.trim();
    if (updatedHtml.startsWith("```html")) {
      updatedHtml = updatedHtml.replace(/^```html\n?/, "").replace(/\n?```$/, "");
    } else if (updatedHtml.startsWith("```")) {
      updatedHtml = updatedHtml.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }

    // Update the last document in the case
    if (caseData.documents && caseData.documents.length > 0) {
      caseData.documents[caseData.documents.length - 1].body = updatedHtml;
      await caseData.save();
    }

    return NextResponse.json({ updatedBody: updatedHtml });
  } catch (error) {
    console.error("Document edit error:", error);
    return NextResponse.json({ error: "Failed to edit document" }, { status: 500 });
  }
}
