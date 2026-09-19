import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type === "text/plain") {
      const text = await file.text();
      return NextResponse.json({ text });
    }

    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    const { text } = await generateText({
      model: google("gemini-3.8-flash"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all the text and relevant information from this document. Format it clearly.",
            },
            {
              type: "file",
              data: uint8Array,
              mediaType: file.type,
            },
          ],
        },
      ],
    });

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json({ error: "Failed to extract text" }, { status: 500 });
  }
}
