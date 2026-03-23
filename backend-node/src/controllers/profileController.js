export async function getProfile(req, res) {
  return res.json({
    name: req.user.name,
    email: req.user.email,
    points: req.user.points,
    eventsJoined: req.user.eventsJoined,
    eventsCreated: req.user.eventsCreated,
    winRate: req.user.winRate,
    achievements: req.user.achievements,
    activitySeries: req.user.activitySeries,
  });
}
