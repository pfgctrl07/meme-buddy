import { trendEvents } from "../data/mockData";

function formatCompactNumber(value) {
  const number = Number(value || 0);
  if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
  return `${Math.round(number)}`;
}

function createSeries(seed, direction = 1) {
  const base = Math.max(10, Math.round(seed));
  return Array.from({ length: 8 }, (_, index) => {
    const modifier = direction > 0 ? index * 6 : (7 - index) * 6;
    return Math.max(6, Math.round(base * 0.45 + modifier + (index % 2 === 0 ? 2 : -1)));
  });
}

function createHeat(score, trustScore) {
  const base = Math.max(1, Math.min(5, Math.round(score / 20)));
  const trustBoost = trustScore > 0.7 ? 1 : trustScore < 0.4 ? -1 : 0;

  return Array.from({ length: 12 }, (_, index) => {
    const drift = index % 4 === 0 ? 1 : 0;
    return Math.max(1, Math.min(5, base + trustBoost + drift - (index % 5 === 0 ? 1 : 0)));
  });
}

export function normalizePredictionResponse(coin, payload, alertMessage = null) {
  const data = payload?.data || payload || {};
  const rawCoin = (coin || data.coin || "coin").toString().toLowerCase();
  const upperCoin = rawCoin.toUpperCase();
  const fallback = trendEvents.find((item) => item.code.toLowerCase() === upperCoin.toLowerCase()) || trendEvents[0];
  const change = Number(data.change || 0);
  const trendScore = Number(data.trend_score || fallback.trendScore || 50);
  const trustScoreNumeric = Number(data.trust_score || 0.5);
  const confidence = Math.max(35, Math.min(99, Math.round(((trendScore / 100) * 0.65 + trustScoreNumeric * 0.35) * 100)));
  const prediction = data.prediction || fallback.prediction || "Neutral";
  const trustLabel =
    data.trust_label?.includes("Weak") ? "Overhyped" : data.trust_label?.includes("Strong") ? "Reliable" : data.trust_label || fallback.trustScore;
  const mentionsSeries = createSeries(trendScore, change >= 0 ? 1 : -1);
  const volumeSeries = createSeries(Math.abs(change) * 3 + trustScoreNumeric * 40, change >= 0 ? 1 : -1);

  let alertType = fallback.alertType;
  let alertTone = fallback.alertTone;

  if (alertMessage?.includes("BUY")) {
    alertType = "Strong Growth Signal";
    alertTone = "success";
  } else if (alertMessage?.includes("SELL")) {
    alertType = "Decline Warning";
    alertTone = "danger";
  } else if (alertMessage) {
    alertType = "Watchlist Drift";
    alertTone = "warning";
  }

  return {
    id: rawCoin,
    coinId: rawCoin,
    name: `${upperCoin} Signal`,
    asset: `$${upperCoin}`,
    code: upperCoin,
    trendScore,
    prediction,
    trustScore: trustLabel,
    confidence,
    growth: `${change > 0 ? "+" : ""}${change.toFixed(1)}%`,
    participants: formatCompactNumber(Number(data.market_cap || 0) / 250000),
    views: formatCompactNumber(Number(data.market_cap || 0) / 12),
    clicks: formatCompactNumber(Number(data.volume || 0) / 150),
    mentions: formatCompactNumber(Number(data.volume || 0) / 40),
    volume: `$${formatCompactNumber(data.volume || 0)}`,
    marketCap: `$${formatCompactNumber(data.market_cap || 0)}`,
    price: Number(data.price || 0),
    status: data.spike || data.verdict || fallback.status,
    alertType,
    alertTone,
    heat: createHeat(trendScore, trustScoreNumeric),
    mentionsSeries,
    volumeSeries,
    rawPrediction: data,
  };
}

export function normalizeAlertResponse(coin, payload) {
  const normalizedEvent = normalizePredictionResponse(coin, payload?.data || payload, payload?.alert);

  return {
    id: `${coin}-${payload?.alert || "alert"}`,
    title: normalizedEvent.name,
    type: payload?.alert?.includes("BUY") ? "Buy" : payload?.alert?.includes("SELL") ? "Sell" : "Spike",
    detail: payload?.alert || "No strong signal",
    timestamp: "Live",
    urgency: payload?.alert?.includes("SELL") ? "critical" : payload?.alert?.includes("BUY") ? "high" : "medium",
  };
}
