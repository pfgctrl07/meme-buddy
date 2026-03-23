import { Event } from "../models/Event.js";
import { shapeEvent } from "../services/seedService.js";

export async function getDiscover(req, res) {
  const filter = req.query.filter || "top-gaining";
  const events = (await Event.find()).map(shapeEvent);

  if (filter === "most-active") {
    events.sort((a, b) => b.engagement.mentions - a.engagement.mentions);
  } else if (filter === "high-trust") {
    events.sort((a, b) => (a.trustScore === "Reliable" ? -1 : 1));
  } else {
    events.sort((a, b) => b.trendScore - a.trendScore);
  }

  return res.json({ items: events });
}
