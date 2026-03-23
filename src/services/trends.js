import { USE_MOCK_API } from "../config/api";
import { leaderboard, trendEvents } from "../data/mockData";
import { fetchJson } from "./http";

function findMockTrend(idOrCode) {
  return (
    trendEvents.find(
      (event) =>
        event.code === idOrCode ||
        event.id === idOrCode ||
        event.name === idOrCode ||
        event.asset === idOrCode ||
        event.coinId === idOrCode
    ) ||
    trendEvents[0]
  );
}

export async function fetchTrendDetail(idOrCode) {
  if (USE_MOCK_API) {
    return findMockTrend(idOrCode);
  }

  return fetchJson(`/api/trends/${encodeURIComponent(idOrCode)}`);
}

export async function fetchTrendLeaderboard(idOrCode) {
  if (USE_MOCK_API) {
    return leaderboard;
  }

  return fetchJson(`/api/trends/${encodeURIComponent(idOrCode)}/leaderboard`);
}

export async function fetchTrendAnalytics(idOrCode) {
  if (USE_MOCK_API) {
    const event = findMockTrend(idOrCode);
    return {
      mentionsSeries: event.mentionsSeries,
      volumeSeries: event.volumeSeries,
      heat: event.heat,
    };
  }

  return fetchJson(`/api/trends/${encodeURIComponent(idOrCode)}/analytics`);
}

export async function createTrend(payload) {
  if (USE_MOCK_API) {
    return {
      success: true,
      created: true,
      mocked: true,
      event: {
        ...trendEvents[0],
        name: payload?.name || trendEvents[0].name,
        asset: payload?.asset || trendEvents[0].asset,
        code: "DEMO42",
      },
    };
  }

  return fetchJson("/api/trends", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function joinTrend(payload) {
  if (USE_MOCK_API) {
    const event = findMockTrend(payload?.code);
    return {
      success: true,
      joined: true,
      mocked: true,
      code: payload?.code || trendEvents[0].code,
      event,
    };
  }

  return fetchJson("/api/trends/join", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
