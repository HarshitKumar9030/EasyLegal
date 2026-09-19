import { performLegalResearch } from "./lib/research-agent";
import mongoose from "mongoose";
import Case from "./models/Case";

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/lex-hacks");
  const caseData = await Case.findById("6aade9f5742c15f3385a9700");
  if (!caseData) {
    console.log("Case not found");
    process.exit(1);
  }
  console.log("Running research...");
  try {
    const sources = await performLegalResearch(caseData.issue, caseData.facts, caseData.jurisdiction);
    console.log("Sources:", sources);
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}

test();