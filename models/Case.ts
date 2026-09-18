import mongoose from 'mongoose';

const CaseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String },
  issue: { type: String },
  jurisdiction: {
    country: { type: String },
    state: { type: String },
    city: { type: String },
  },
  facts: [{ type: String }],
  parties: [{
    role: { type: String },
    name: { type: String }
  }],
  amounts: [{
    value: { type: Number },
    currency: { type: String },
    description: { type: String }
  }],
  openQuestions: [{ type: String }],
  timeline: [{
    date: { type: String },
    description: { type: String },
    source: { type: String },
    evidenceAttachment: { type: String },
    certainty: { type: String }
  }],
  escalationStage: { type: Number, default: 1 },
  escalationPlan: [{
    stage: { type: Number },
    purpose: { type: String },
    action: { type: String },
    evidenceRequired: [{ type: String }],
    documentsRequired: [{ type: String }],
    sourceBasis: [{ type: String }],
    conditionsForEscalation: { type: String },
    importantUncertainties: { type: String }
  }],
  sources: [{
    title: { type: String },
    authority: { type: String },
    source_type: { type: String },
    jurisdiction: { type: String },
    provision: { type: String },
    url: { type: String },
    retrieved_at: { type: Date },
    content: { type: String },
    relevant_excerpt: { type: String },
    relevance_explanation: { type: String }
  }],
  documents: [{
    title: { type: String },
    body: { type: String },
    factsUsed: [{ type: String }],
    legalSourcesUsed: [{ type: String }],
    missingInformation: [{ type: String }]
  }],
  status: { type: String, default: 'Intake' },
}, { timestamps: true });

export default mongoose.models.Case || mongoose.model('Case', CaseSchema);
