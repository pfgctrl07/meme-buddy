import { User } from "../models/User.js";

export async function getLeaderboard(req, res) {
  const users = await User.find().sort({ points: -1 });
  return res.json({
    entries: users.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      badge: user.achievements[0] || "Signal Operator",
      points: user.points.toLocaleString(),
    })),
  });
}
