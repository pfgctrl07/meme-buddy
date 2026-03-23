import { theme } from "../theme/theme";

export const tabs = [
  { key: "dashboard", label: "Home", icon: "grid" },
  { key: "create", label: "Create", icon: "add-circle-outline" },
  { key: "event", label: "Event", icon: "stats-chart" },
  { key: "accuracy", label: "Accuracy", icon: "ribbon-outline" },
  { key: "discover", label: "Discover", icon: "compass-outline" },
  { key: "alerts", label: "Alerts", icon: "notifications-outline" },
  { key: "leaderboard", label: "Ranks", icon: "trophy-outline" },
  { key: "profile", label: "Profile", icon: "person-circle-outline" },
];

export const trendEvents = [
  {
    name: "Pepe World Cup",
    asset: "#PepeCup",
    code: "PEPE88",
    trendScore: 91,
    prediction: "Bullish",
    trustScore: "Reliable",
    confidence: 92,
    growth: "+18.4%",
    participants: "1.4K",
    views: "328K",
    clicks: "12.4K",
    mentions: "42.8K",
    volume: "$2.4M",
    status: "Creator raids exploding",
    alertType: "Strong Growth Signal",
    alertTone: "success",
    heat: [1, 2, 3, 4, 4, 5, 5, 4, 3, 4, 5, 5],
    mentionsSeries: [20, 26, 34, 49, 58, 70, 84, 92],
    volumeSeries: [12, 18, 24, 28, 35, 48, 61, 76],
  },
  {
    name: "Doge Drift",
    asset: "$DRIFTDOGE",
    code: "DRIFT42",
    trendScore: 74,
    prediction: "Neutral",
    trustScore: "Reliable",
    confidence: 71,
    growth: "+7.2%",
    participants: "981",
    views: "214K",
    clicks: "9.6K",
    mentions: "19.3K",
    volume: "$1.2M",
    status: "Retention holding steady",
    alertType: "Watchlist Drift",
    alertTone: "warning",
    heat: [1, 1, 2, 3, 2, 3, 4, 4, 3, 2, 3, 3],
    mentionsSeries: [16, 22, 27, 30, 35, 41, 46, 54],
    volumeSeries: [10, 12, 16, 19, 21, 24, 29, 34],
  },
  {
    name: "Moon Cat Frenzy",
    asset: "#MoonCat",
    code: "MCAT77",
    trendScore: 46,
    prediction: "Bearish",
    trustScore: "Overhyped",
    confidence: 63,
    growth: "-4.8%",
    participants: "620",
    views: "101K",
    clicks: "4.9K",
    mentions: "9.8K",
    volume: "$410K",
    status: "Social heat fading",
    alertType: "Decline Warning",
    alertTone: "danger",
    heat: [4, 5, 4, 3, 2, 2, 2, 1, 1, 1, 2, 1],
    mentionsSeries: [38, 34, 29, 26, 22, 18, 16, 14],
    volumeSeries: [30, 26, 22, 19, 18, 16, 13, 11],
  },
];

export const alertsFeed = [
  { title: "Pepe World Cup", type: "Buy", detail: "Strong Growth Signal", timestamp: "2m ago", urgency: "high" },
  { title: "Moon Cat Frenzy", type: "Sell", detail: "Decline Warning", timestamp: "11m ago", urgency: "critical" },
  { title: "Doge Drift", type: "Spike", detail: "Mention volume crossed watch threshold", timestamp: "24m ago", urgency: "medium" },
];

export const discoveryFeed = [
  { symbol: "$PEPECUP", score: 91, growth: "+18.4%", prediction: "Bullish", trust: "Reliable", activity: "Very Active" },
  { symbol: "#DogeDrift", score: 74, growth: "+7.2%", prediction: "Neutral", trust: "Reliable", activity: "Most Active" },
  { symbol: "$BananaPump", score: 86, growth: "+21.3%", prediction: "Bullish", trust: "High Trust", activity: "Top Gaining" },
  { symbol: "#MoonCat", score: 46, growth: "-4.8%", prediction: "Bearish", trust: "Overhyped", activity: "Fading" },
  { symbol: "$FrogWave", score: 79, growth: "+11.6%", prediction: "Bullish", trust: "Reliable", activity: "High Trust" },
];

export const leaderboard = [
  { rank: 1, name: "LunaSpark", points: "12,240", badge: "Trend Oracle" },
  { rank: 2, name: "MemeMarshal", points: "11,880", badge: "Virality Pro" },
  { rank: 3, name: "CoinComet", points: "11,020", badge: "Signal Hunter" },
  { rank: 4, name: "HashtagHex", points: "9,840", badge: "Momentum Scout" },
  { rank: 5, name: "AlphaApe", points: "9,510", badge: "Community Core" },
  { rank: 6, name: "TrendTactician", points: "8,940", badge: "Analytics Ace" },
];

export const profile = {
  name: "Priyan Nova",
  handle: "@memebuddy_builder",
  level: "Prediction Architect",
  totalPoints: "28,440",
  eventsJoined: "18",
  winRate: "78%",
  achievements: ["Top 10 Builder", "Hot Streak x5", "Early Signal Expert", "Trust Hunter"],
  activitySeries: [10, 18, 16, 26, 24, 34, 42],
};

export const dashboardStats = [
  { label: "Views", value: "328K", detail: "+21% reach lift", icon: "eye-outline", tone: theme.cyan },
  { label: "Clicks", value: "12.4K", detail: "+14% engagement", icon: "navigate-outline", tone: theme.blue },
  { label: "Mentions", value: "42.8K", detail: "+31% social velocity", icon: "megaphone-outline", tone: theme.purple },
  { label: "Confidence", value: "92%", detail: "AI conviction level", icon: "pulse-outline", tone: theme.green },
];

export const accuracySnapshot = {
  accuracyPct: 41.7,
  coin: "ALL",
  correctCases: 5,
  totalCases: 12,
  scope: "global",
  measuredAt: "2026-03-24T00:00:00.000Z",
  details: [
    { coin: "PEPE", predicted: "Bullish", expected: "Bullish", correct: true, changePct: 9.4, trendScore: 88, trustScore: 0.81 },
    { coin: "DOGECOIN", predicted: "Neutral", expected: "Bullish", correct: false, changePct: 7.1, trendScore: 79, trustScore: 0.77 },
    { coin: "BITCOIN", predicted: "Bearish", expected: "Bearish", correct: true, changePct: -8.8, trendScore: 45, trustScore: 0.28 },
  ],
};
