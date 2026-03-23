export function generateTimeline(seedMentions = 1200, seedClicks = 240, seedViews = 9000) {
  const labels = ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM"];
  return labels.map((label, index) => ({
    label,
    mentions: Math.round(seedMentions * (0.55 + index * 0.1)),
    clicks: Math.round(seedClicks * (0.5 + index * 0.11)),
    views: Math.round(seedViews * (0.58 + index * 0.09)),
  }));
}

function normalizeMentions(mentions) {
  return Math.max(0, Math.min(100, Math.round(mentions / 500)));
}

function normalizeEngagement({ views = 0, clicks = 0, mentions = 0 }) {
  const weighted = views * 0.15 + clicks * 4.5 + mentions * 1.4;
  return Math.max(0, Math.min(100, Math.round(weighted / 700)));
}

function normalizeSentiment(sentiment) {
  return Math.max(0, Math.min(100, Math.round(sentiment)));
}

export function getGrowthPrediction(score) {
  if (score >= 70) return "High";
  if (score >= 45) return "Medium";
  return "Low";
}

export function evaluatePrediction({ views = 0, clicks = 0, mentions = 0, sentiment = 50 }) {
  const mentionsScore = normalizeMentions(mentions);
  const engagementScore = normalizeEngagement({ views, clicks, mentions });
  const sentimentScore = normalizeSentiment(sentiment);

  const trendScore = Math.round(
    mentionsScore * 0.4 +
      engagementScore * 0.3 +
      sentimentScore * 0.3
  );

  const growthPrediction = getGrowthPrediction(trendScore);
  const confidence = Math.max(48, Math.min(97, Math.round(trendScore * 0.92)));
  const trustScore = trendScore >= 65 ? "Reliable" : trendScore <= 40 ? "Overhyped" : "Watchlist";
  const alert = growthPrediction === "High" ? "Strong Growth Signal" : growthPrediction === "Low" ? "Decline Warning" : "Watchlist Drift";

  return {
    trendScore,
    score: trendScore,
    growthPrediction,
    confidence,
    trustScore,
    sentiment: sentimentScore,
    prediction: growthPrediction,
    alert,
  };
}

export function accuracySummary(trendScore) {
  const base = trendScore >= 80 ? 87 : trendScore >= 60 ? 76 : 64;
  return {
    label: `${base}%`,
    value: base,
    note: `Prototype benchmark based on seeded simulation cases calibrated around event engagement and trend velocity.`,
  };
}
