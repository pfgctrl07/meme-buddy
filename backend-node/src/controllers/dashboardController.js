import { LIVE_MARKET_SEEDS, shapeEvent } from "../services/seedService.js";

export async function getDashboard(req, res) {
  const liveCoins = await Promise.all(LIVE_MARKET_SEEDS.map((item) => shapeEvent(item)));
  const activeCoin = liveCoins[0] || null;
  const totals = liveCoins.reduce(
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
      { label: "Tracked Reach", value: compact.format(totals.views), hint: "Live market reach proxy", toneClass: "text-brand2" },
      { label: "Market Activity", value: compact.format(totals.clicks), hint: "Liquidity and intent proxy", toneClass: "text-white" },
      { label: "Trend Interest", value: compact.format(totals.mentions), hint: "Search and social velocity", toneClass: "text-green" },
      { label: "Live Accuracy", value: activeCoin?.analysis?.accuracy?.label || "Unverified", hint: "Recent interval fit", toneClass: "text-yellow" },
    ],
    activeCoin,
    liveCoins,
  });
}
