import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { google } from "@ai-sdk/google";
import dbConnect from "@/lib/db";
import Case from "@/models/Case";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { description } = await req.json();

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    await dbConnect();

    const { object } = await generateObject({
      model: google("gemini-3.8-flash"),
      schema: z.object({
        category: z.string(),
        issue: z.string(),
        jurisdiction: z.object({
          country: z.string().nullable(),
          state: z.string().nullable(),
          city: z.string().nullable(),
        }),
        parties: z.array(z.object({
          role: z.string(),
          name: z.string().nullable(),
        })),
        amounts: z.array(z.object({
          value: z.number(),
          currency: z.string(),
          description: z.string(),
        })),
        facts: z.array(z.string()),
        unknowns: z.array(z.string()),
      }),
      system: `You are the intake component of EasyLegal.
Your job is to convert the user's description of an everyday legal or civic problem into structured factual information.
Do not provide legal advice.
Do not determine whether the user is legally right or wrong.
Do not invent facts.
Only extract information explicitly stated or clearly supported by the user's message.
Separate facts and unknowns.
Identify category, issue, parties, amounts, location, and missing information.
Return strict structured JSON.`,
      prompt: description,
    });

    // Create a new case in the database
    const newCase = await Case.create({
      userId: (session.user as any).id,
      title: object.issue.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
      category: object.category,
      issue: object.issue,
      jurisdiction: object.jurisdiction,
      parties: object.parties,
      amounts: object.amounts,
      facts: object.facts,
      openQuestions: object.unknowns,
      status: "Intake",
    });

    return NextResponse.json({ caseId: newCase._id });
  } catch (error) {
    console.error("Intake error:", error);
    return NextResponse.json({ error: "Failed to process intake" }, { status: 500 });
  }
}