import { Event } from "../models/Event.js";
import { User } from "../models/User.js";
import { shapeEvent } from "../services/seedService.js";

export async function getDashboard(req, res) {
  const events = await Event.find().sort({ createdAt: -1 }).limit(4);
  const leaderboardUsers = await User.find().sort({ points: -1 }).limit(5);
  const shapedEvents = await Promise.all(events.map((event) => shapeEvent(event)));
  const activeEvent = shapedEvents[0] || null;
  const totals = shapedEvents.reduce(
    (accumulator, event) => {
      accumulator.views += Number(event.engagement?.views || 0);
      accumulator.clicks += Number(event.engagement?.clicks || 0);
      accumulator.mentions += Number(event.engagement?.mentions || 0);
      return accumulator;
    },
    { views: 0, clicks: 0, mentions: 0 }
  );
  const compact = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  });

  return res.json({
    stats: [
      { label: "Tracked Views", value: compact.format(totals.views), hint: "Cross-event reach", toneClass: "text-brand2" },
      { label: "Tracked Clicks", value: compact.format(totals.clicks), hint: "Intent captured", toneClass: "text-white" },
      { label: "Tracked Mentions", value: compact.format(totals.mentions), hint: "Search/social velocity", toneClass: "text-green" },
      { label: "Live Accuracy", value: activeEvent?.analysis?.accuracy?.label || "Unverified", hint: "Recent interval fit", toneClass: "text-yellow" },
    ],
    activeEvent,
    trendingEvents: shapedEvents,
    leaderboard: leaderboardUsers.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      badge: user.achievements[0] || "Signal Operator",
      points: user.points.toLocaleString(),
    })),
  });
}
