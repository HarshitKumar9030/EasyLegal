import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Case from "@/models/Case";

export async function POST() {
  try {
    await dbConnect();

    const demoCase = await Case.create({
      userId: "demo-user",
      title: "Landlord Deposit Dispute",
      category: "Housing",
      issue: "Security deposit not returned",
      jurisdiction: {
        country: "India",
        state: "Delhi",
        city: "New Delhi",
      },
      parties: [
        { role: "tenant", name: "User" },
        { role: "landlord", name: "Unknown" }
      ],
      amounts: [
        { value: 30000, currency: "INR", description: "security deposit" }
      ],
      facts: [
        "Rental relationship existed",
        "Security deposit of ₹30,000 was paid",
        "Tenancy ended two months ago",
        "Property was handed over",
        "Refund was requested",
        "Landlord has not returned the deposit and stopped responding"
      ],
      openQuestions: [
        "What does the rental agreement say about the security deposit?",
        "Did the landlord claim any deductions?",
        "Do you have proof of payment for the deposit?",
        "Are there move-out photographs?"
      ],
      status: "Intake",
      escalationStage: 1,
      escalationPlan: [
        {
          stage: 1,
          purpose: "Understand the terms of your tenancy.",
          action: "Review rental agreement",
          evidenceRequired: ["Rental agreement"]
        },
        {
          stage: 2,
          purpose: "Ensure you have proof of the transaction and communication.",
          action: "Preserve evidence",
          evidenceRequired: ["Proof of deposit payment", "Communication records"]
        },
        {
          stage: 3,
          purpose: "Create a clear written record requesting resolution.",
          action: "Send formal written demand",
          evidenceRequired: ["Rental agreement", "Proof of deposit", "Previous communication"]
        }
      ]
    });

    return NextResponse.json({ caseId: demoCase._id });
  } catch (error) {
    console.error("Demo case error:", error);
    return NextResponse.json({ error: "Failed to create demo case" }, { status: 500 });
  }
}