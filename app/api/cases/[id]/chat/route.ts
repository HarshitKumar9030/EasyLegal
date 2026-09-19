import { NextRequest } from "next/server";
import { convertToModelMessages, streamText } from "ai";
import { google } from "@ai-sdk/google";
import dbConnect from "@/lib/db";
import Case from "@/models/Case";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { messages, evidenceContext } = await req.json();

    await dbConnect();
    const caseData = await Case.findById(id);

    if (!caseData) {
      return new Response("Case not found", { status: 404 });
    }

    let systemPrompt = `You are an expert AI legal assistant helping a user with their specific case.
    
Here are the details of the case:
Title: ${caseData.title}
Category: ${caseData.category}
Issue: ${caseData.issue}
Status: ${caseData.status}
Escalation Stage: ${caseData.escalationStage}
Facts: ${caseData.facts?.join(", ")}
Parties: ${JSON.stringify(caseData.parties)}
Amounts: ${JSON.stringify(caseData.amounts)}
Jurisdiction: ${JSON.stringify(caseData.jurisdiction)}
Timeline: ${JSON.stringify(caseData.timeline)}
Escalation Plan: ${JSON.stringify(caseData.escalationPlan)}
Open Questions: ${JSON.stringify(caseData.openQuestions)}
Sources: ${JSON.stringify(caseData.sources)}
Documents: ${JSON.stringify(caseData.documents)}

Your role is to:
1. Answer questions about the case facts and potential legal strategies.
2. Explain legal concepts in simple, easy-to-understand language.
3. If the user asks to draft a document (like a demand letter, complaint, or notice), generate a professional draft based on the case facts.
4. Guide the user through their escalation plan based on their current escalation stage.
5. Always remind the user that you are an AI and this is not formal legal advice.

Be empathetic, clear, and highly structured in your responses.`;

    if (evidenceContext) {
      systemPrompt += `\n\n[System Note: The user has the following evidence files in their vault:\n${evidenceContext}\nPlease refer to them if relevant.]`;
    }

    const modelMessages = await convertToModelMessages(messages);

    const result = streamText({
      model: google("gemini-3.8-flash"),
      system: systemPrompt,
      messages: modelMessages,
      async onFinish({ text }) {
        try {
          // Save the updated conversation to the database
          const updatedMessages = [
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...messages.map((m: any) => ({
              id: m.id,
              role: m.role,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              content: typeof m.content === 'string' ? m.content : m.parts?.find((p: any) => p.type === 'text')?.text || '',
            })),
            {
              id: `msg-${Date.now()}`,
              role: 'assistant',
              content: text,
            }
          ];
          
          await Case.findByIdAndUpdate(id, {
            $set: { messages: updatedMessages }
          });
        } catch (err) {
          console.error("Failed to save chat history:", err);
        }
      }
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: false,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}