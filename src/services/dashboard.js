import { USE_MOCK_API } from "../config/api";
import { alertsFeed, dashboardStats, leaderboard, trendEvents } from "../data/mockData";
import { fetchJson } from "./http";

export async function fetchDashboard() {
  if (USE_MOCK_API) {
    return {
      stats: dashboardStats,
      trendingEvents: trendEvents,
      leaderboardPreview: leaderboard.slice(0, 3),
      alertsPreview: alertsFeed,
      activeEvent: trendEvents[0],
    };
  }

  return fetchJson("/api/dashboard");
}
