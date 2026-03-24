export function generateTimeline(seedMentions = 1200, seedClicks = 240, seedViews = 9000) {
  const labels = ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM"];
  return labels.map((label, index) => ({
    label,
    mentions: Math.round(seedMentions * (0.55 + index * 0.1)),
    clicks: Math.round(seedClicks * (0.5 + index * 0.11)),
    views: Math.round(seedViews * (0.58 + index * 0.09)),
  }));
}

export function buildSocialSources({ mentions = 0, clicks = 0, sentiment = 50 }) {
  const xMentions = Math.round(mentions * 0.46);
  const redditMentions = Math.round(mentions * 0.31);
  const telegramMentions = Math.round(mentions * 0.23);
  const totalEngagement = Math.round(clicks * 3.8 + mentions * 0.42);

  return {
    sources: [
      { platform: "X", mentions: xMentions, engagement: Math.round(totalEngagement * 0.44), sentiment: Math.max(0, Math.min(100, sentiment + 6)) },
      { platform: "Reddit", mentions: redditMentions, engagement: Math.round(totalEngagement * 0.33), sentiment: Math.max(0, Math.min(100, sentiment - 2)) },
      { platform: "Telegram", mentions: telegramMentions, engagement: Math.round(totalEngagement * 0.23), sentiment: Math.max(0, Math.min(100, sentiment + 3)) },
    ],
    totalMentions: mentions,
    totalEngagement: totalEngagement,
    overallSentiment: sentiment,
  };
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

export function detectMovement(score, sentiment) {
  if (score >= 70 && sentiment >= 60) return "Upward";
  if (score <= 40 || sentiment <= 35) return "Downward";
  return "Sideways";
}

export function detectHypeCycle(score, mentions, sentiment) {
  if (score >= 78 && sentiment >= 65) return "Breakout";
  if (mentions >= 25000 && sentiment < 45) return "Overhyped";
  if (score >= 50) return "Acceleration";
  return "Emerging";
}

export function evaluatePrediction({ views = 0, clicks = 0, mentions = 0, sentiment = 50 }) {
  const mentionsScore = normalizeMentions(mentions);
  const engagementScore = normalizeEngagement({ views, clicks, mentions });
  const sentimentScore = normalizeSentiment(sentiment);
  const social = buildSocialSources({ mentions, clicks, sentiment: sentimentScore });

  const trendScore = Math.round(
    mentionsScore * 0.4 +
      engagementScore * 0.3 +
      sentimentScore * 0.3
  );

  const growthPrediction = getGrowthPrediction(trendScore);
  const movement = detectMovement(trendScore, sentimentScore);
  const hypeCycle = detectHypeCycle(trendScore, mentions, sentimentScore);
  const spikeDetected = mentions >= 20000 || clicks >= 8000;
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
    movement,
    hypeCycle,
    spikeDetected,
    socialSignals: {
      ...social,
      movement,
      hypeCycle,
      spikeDetected,
    },
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

export function verificationSummary({ mentions = 0, sentiment = 50, clicks = 0 }) {
  let botRisk = 12;

  if (mentions >= 25000 && sentiment < 45) botRisk += 24;
  if (clicks >= 8000 && sentiment < 50) botRisk += 16;
  if (sentiment >= 65) botRisk -= 10;

  const authenticityScore = Math.max(10, Math.min(94, 100 - botRisk));
  return {
    authenticityScore,
    botRiskScore: botRisk,
    classification:
      authenticityScore >= 72 ? "Human Verified" : authenticityScore <= 42 ? "Likely Bot / AI Amplified" : "Needs Human Review",
    reviewerAction: authenticityScore >= 72 ? "Low priority review" : "Manual verification recommended",
    verifiedBy: "Simulation heuristic",
    reasons:
      authenticityScore >= 72
        ? ["engagement quality and sentiment look organic"]
        : ["growth needs a human check for bot or AI amplification"],
  };
}
