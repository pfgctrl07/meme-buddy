import { Event } from "../models/Event.js";
import { User } from "../models/User.js";
import { evaluatePrediction, generateTimeline } from "../services/predictionEngine.js";
import { shapeEvent } from "../services/seedService.js";

function buildInviteCode(asset) {
  return `${asset.replace(/[^a-z0-9]/gi, "").slice(0, 5).toUpperCase()}${Math.floor(10 + Math.random() * 89)}`;
}

async function makeInviteCode(asset) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = buildInviteCode(asset);
    const existing = await Event.exists({ inviteCode: code });
    if (!existing) {
      return code;
    }
  }

  return `${asset.replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase()}${Date.now().toString().slice(-4)}`;
}

export async function createEvent(req, res) {
  const name = req.body?.name?.trim();
  const asset = req.body?.asset?.trim();
  const description = req.body?.description?.trim();

  if (!name || !asset || !description) {
    return res.status(400).json({ message: "Name, asset, and description are required" });
  }

  const mentions = 10000 + Math.floor(Math.random() * 40000);
  const clicks = 3000 + Math.floor(Math.random() * 9000);
  const views = 60000 + Math.floor(Math.random() * 260000);
  const sentiment = 40 + Math.floor(Math.random() * 46);
  const model = evaluatePrediction({ views, clicks, mentions, sentiment });

  const event = await Event.create({
    name,
    asset,
    description,
    inviteCode: await makeInviteCode(asset),
    createdBy: req.user._id,
    participants: [req.user._id],
    engagement: { views, clicks, mentions },
    analytics: {
      timeline: generateTimeline(mentions, clicks, views),
      heatmap: [1, 2, 3, 4, 4, 5, 5, 4, 3, 4, 5, 4],
    },
    ...model,
  });

  req.user.eventsCreated += 1;
  req.user.points += 320;
  await req.user.save();

  return res.status(201).json({
    message: "Trend event created",
    event: await shapeEvent(event),
  });
}

export async function joinEvent(req, res) {
  const inviteCode = req.body?.inviteCode?.trim().toUpperCase();

  if (!inviteCode) {
    return res.status(400).json({ message: "Invite code is required" });
  }

  const event = await Event.findOne({ inviteCode });

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  const hasJoined = event.participants.some((participantId) => participantId.toString() === req.user._id.toString());
  if (!hasJoined) {
    event.participants.push(req.user._id);
    event.engagement.views += 3200;
    event.engagement.clicks += 180;
    event.engagement.mentions += 260;
    event.sentiment = Math.max(20, Math.min(95, (event.sentiment || 50) + 2));

    const model = evaluatePrediction({
      ...event.engagement.toObject?.(),
      ...event.engagement,
      sentiment: event.sentiment,
    });
    event.analytics.timeline = generateTimeline(event.engagement.mentions, event.engagement.clicks, event.engagement.views);
    event.trendScore = model.trendScore;
    event.score = model.score;
    event.confidence = model.confidence;
    event.trustScore = model.trustScore;
    event.sentiment = model.sentiment;
    event.prediction = model.prediction;
    event.growthPrediction = model.growthPrediction;
    event.movement = model.movement;
    event.hypeCycle = model.hypeCycle;
    event.spikeDetected = model.spikeDetected;
    event.socialSignals = model.socialSignals;
    event.alert = model.alert;
    await event.save();

    req.user.eventsJoined += 1;
    req.user.points += 120;
    req.user.activitySeries = [...req.user.activitySeries.slice(-6), req.user.activitySeries.at(-1) + 4];
    await req.user.save();
  }

  return res.json({
    message: hasJoined ? "You already joined this event" : "Joined event successfully",
    event: await shapeEvent(event),
  });
}

export async function listEvents(req, res) {
  const events = await Event.find().sort({ createdAt: -1 }).limit(12);
  return res.json({ items: await Promise.all(events.map((event) => shapeEvent(event))) });
}

export async function getEventDetail(req, res) {
  const event = await Event.findById(req.params.eventId).populate("participants", "name points achievements");
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  const rankedUsers = await User.find({ _id: { $in: event.participants } }).sort({ points: -1 });

  return res.json({
    event: await shapeEvent(event),
    leaderboard: rankedUsers.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      badge: user.achievements[0] || "Signal Operator",
      points: user.points.toLocaleString(),
    })),
  });
}
