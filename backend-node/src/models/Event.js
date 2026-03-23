import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema(
  {
    label: String,
    mentions: Number,
    clicks: Number,
    views: Number,
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    asset: { type: String, required: true },
    description: { type: String, required: true },
    inviteCode: { type: String, required: true, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    engagement: {
      views: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      mentions: { type: Number, default: 0 },
    },
    analytics: {
      timeline: { type: [timelineSchema], default: [] },
      heatmap: { type: [Number], default: [] },
    },
    trendScore: { type: Number, default: 50 },
    score: { type: Number, default: 50 },
    trustScore: { type: String, default: "Reliable" },
    sentiment: { type: Number, default: 50 },
    confidence: { type: Number, default: 65 },
    prediction: { type: String, default: "Medium" },
    growthPrediction: { type: String, default: "Medium" },
    alert: { type: String, default: "Watchlist Drift" },
  },
  { timestamps: true }
);

eventSchema.virtual("participantCount").get(function participantCount() {
  return this.participants?.length || 0;
});

eventSchema.set("toJSON", { virtuals: true });
eventSchema.set("toObject", { virtuals: true });

export const Event = mongoose.model("Event", eventSchema);
