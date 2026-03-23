import bcrypt from "bcryptjs";
import { Event } from "../models/Event.js";
import { User } from "../models/User.js";
import { accuracySummary, evaluatePrediction, generateTimeline } from "./predictionEngine.js";
import { applyLiveSnapshotToEvent, fetchLiveCoinSnapshot } from "./liveMarketData.js";

function buildLiveSeed({ id, name, asset, inviteCode, description, views, clicks, mentions, sentiment }) {
  const model = evaluatePrediction({ views, clicks, mentions, sentiment });
  return {
    _id: id,
    name,
    asset,
    inviteCode,
    description,
    participants: [],
    participantCount: 0,
    engagement: { views, clicks, mentions },
    analytics: {
      timeline: generateTimeline(mentions, clicks, views),
      heatmap: [2, 3, 4, 4, 5, 4, 3],
    },
    ...model,
  };
}

export const LIVE_MARKET_SEEDS = [
  buildLiveSeed({
    id: "live-pepe",
    name: "PEPE Live Signal",
    asset: "$PEPE",
    inviteCode: "LIVE-PEPE",
    description: "Realtime PEPE intelligence based on live exchange, market, and search-interest inputs.",
    views: 168000,
    clicks: 7400,
    mentions: 28600,
    sentiment: 73,
  }),
  buildLiveSeed({
    id: "live-doge",
    name: "DOGE Live Signal",
    asset: "$DOGE",
    inviteCode: "LIVE-DOGE",
    description: "Realtime DOGE intelligence based on live exchange, market, and search-interest inputs.",
    views: 182000,
    clicks: 8200,
    mentions: 24800,
    sentiment: 69,
  }),
  buildLiveSeed({
    id: "live-shib",
    name: "SHIB Live Signal",
    asset: "$SHIB",
    inviteCode: "LIVE-SHIB",
    description: "Realtime SHIB intelligence based on live exchange, market, and search-interest inputs.",
    views: 126000,
    clicks: 5100,
    mentions: 18600,
    sentiment: 58,
  }),
  buildLiveSeed({
    id: "live-sol",
    name: "SOL Live Signal",
    asset: "$SOL",
    inviteCode: "LIVE-SOL",
    description: "Realtime SOL intelligence based on live exchange, market, and search-interest inputs.",
    views: 152000,
    clicks: 6800,
    mentions: 21400,
    sentiment: 66,
  }),
];

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

export async function shapeEvent(event) {
  const payload = event.toJSON ? event.toJSON() : event;
  const fallbackModel =
    payload.trendScore !== undefined
      ? {}
      : evaluatePrediction({
          views: payload.engagement?.views || 120000,
          clicks: payload.engagement?.clicks || 5000,
          mentions: payload.engagement?.mentions || 18000,
          sentiment: payload.sentiment || 60,
        });
  const baseEvent = {
    ...payload,
    ...fallbackModel,
    engagement: payload.engagement || {
      views: 120000,
      clicks: 5000,
      mentions: 18000,
    },
    analytics: payload.analytics?.timeline?.length
      ? payload.analytics
      : {
          ...(payload.analytics || {}),
          timeline: generateTimeline(
            payload.engagement?.mentions || 18000,
            payload.engagement?.clicks || 5000,
            payload.engagement?.views || 120000
          ),
          heatmap: payload.analytics?.heatmap?.length ? payload.analytics.heatmap : [2, 3, 4, 4, 5, 4, 3],
        },
    analysis: {
      accuracy: accuracySummary(payload.trendScore ?? fallbackModel.trendScore ?? 60),
      calibratedPrediction: payload.prediction ?? fallbackModel.prediction,
      engine: "meme-buddy-simulator-v1",
      note: "Trend score uses the formula (mentions * 0.4) + (engagement * 0.3) + (sentiment * 0.3).",
      socialCoverage: payload.socialSignals?.sources?.map((source) => source.platform) || fallbackModel.socialSignals?.sources?.map((source) => source.platform) || [],
    },
  };

  try {
    const snapshot = await fetchLiveCoinSnapshot(baseEvent);
    if (!snapshot) {
      return baseEvent;
    }

    return applyLiveSnapshotToEvent(baseEvent, snapshot);
  } catch {
    return baseEvent;
  }
}
