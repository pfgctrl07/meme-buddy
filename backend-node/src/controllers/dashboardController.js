import { Event } from "../models/Event.js";
import { User } from "../models/User.js";
import { shapeEvent } from "../services/seedService.js";

export async function getDashboard(req, res) {
  const events = await Event.find().sort({ createdAt: -1 }).limit(4);
  const leaderboardUsers = await User.find().sort({ points: -1 }).limit(5);
  const activeEvent = events[0] ? shapeEvent(events[0]) : null;

  return res.json({
    stats: [
      { label: "Tracked Views", value: "1.2M", hint: "Cross-event reach", toneClass: "text-brand2" },
      { label: "Tracked Clicks", value: "43.6K", hint: "Intent captured", toneClass: "text-white" },
      { label: "Tracked Mentions", value: "71.9K", hint: "Social velocity", toneClass: "text-green" },
      { label: "Live Accuracy", value: activeEvent?.analysis?.accuracy?.label || "Unverified", hint: "Prediction benchmark", toneClass: "text-yellow" },
    ],
    activeEvent,
    trendingEvents: events.map(shapeEvent),
    leaderboard: leaderboardUsers.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      badge: user.achievements[0] || "Signal Operator",
      points: user.points.toLocaleString(),
    })),
  });
}
