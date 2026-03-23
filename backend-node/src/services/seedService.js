import bcrypt from "bcryptjs";
import { Event } from "../models/Event.js";
import { User } from "../models/User.js";
import { accuracySummary, evaluatePrediction, generateTimeline } from "./predictionEngine.js";

function buildEventPayload({ name, asset, description, createdBy, views, clicks, mentions, inviteCode, sentiment }) {
  const engagement = { views, clicks, mentions, sentiment };
  const model = evaluatePrediction(engagement);

  return {
    name,
    asset,
    description,
    inviteCode,
    createdBy,
    participants: [createdBy],
    engagement,
    analytics: {
      timeline: generateTimeline(mentions, clicks, views),
      heatmap: [2, 3, 4, 4, 5, 5, 4, 3, 4, 5, 5, 4],
    },
    ...model,
  };
}

export async function seedDatabase() {
  const usersCount = await User.countDocuments();
  if (usersCount > 0) return;

  const passwordHash = await bcrypt.hash("Demo@12345", 10);

  const users = await User.insertMany([
    {
      name: "Priyan Nova",
      email: "demo@memebuddy.ai",
      passwordHash,
      points: 28440,
      eventsJoined: 11,
      eventsCreated: 4,
      winRate: 78,
      achievements: ["Trend Architect", "Hot Streak x5", "Trust Hunter"],
      activitySeries: [24, 28, 33, 37, 42, 49, 55],
    },
    {
      name: "LunaSpark",
      email: "luna@memebuddy.ai",
      passwordHash,
      points: 31280,
      eventsJoined: 16,
      eventsCreated: 7,
      winRate: 82,
      achievements: ["Trend Oracle", "Alpha Scout"],
      activitySeries: [25, 31, 34, 39, 43, 48, 52],
    },
    {
      name: "CoinComet",
      email: "coin@memebuddy.ai",
      passwordHash,
      points: 29140,
      eventsJoined: 13,
      eventsCreated: 5,
      winRate: 75,
      achievements: ["Signal Hunter", "Community Driver"],
      activitySeries: [19, 24, 27, 31, 36, 41, 45],
    },
  ]);

  const operator = users[0];

  await Event.insertMany([
    buildEventPayload({
      name: "Pepe World Cup",
      asset: "#PEPECUP",
      description: "Simulate a creator-led hashtag raid with meme coin crossover momentum and high-velocity social engagement.",
      createdBy: operator._id,
      views: 328000,
      clicks: 12400,
      mentions: 42800,
      sentiment: 81,
      inviteCode: "PEPE88",
    }),
    buildEventPayload({
      name: "Doge Drift",
      asset: "$DRIFTDOGE",
      description: "A slower-burn meme coin narrative testing retention and consistency across a noisy market.",
      createdBy: operator._id,
      views: 214000,
      clicks: 9600,
      mentions: 19300,
      sentiment: 58,
      inviteCode: "DRIFT42",
    }),
    buildEventPayload({
      name: "Moon Cat Frenzy",
      asset: "#MOONCAT",
      description: "An overhyped social push designed to expose decline patterns and low-trust attention spikes.",
      createdBy: operator._id,
      views: 101000,
      clicks: 4900,
      mentions: 9800,
      sentiment: 28,
      inviteCode: "MCAT77",
    }),
  ]);
}

export function shapeEvent(event) {
  const payload = event.toJSON ? event.toJSON() : event;
  return {
    ...payload,
    analysis: {
      accuracy: accuracySummary(payload.trendScore),
      calibratedPrediction: payload.prediction,
      engine: "meme-buddy-simulator-v1",
      note: "Trend score uses the formula (mentions * 0.4) + (engagement * 0.3) + (sentiment * 0.3).",
      socialCoverage: payload.socialSignals?.sources?.map((source) => source.platform) || [],
    },
  };
}
