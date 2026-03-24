const CACHE_TTL_MS = 10 * 60 * 1000;

const inMemoryCache = new Map();

const COIN_CATALOG = [
  { keys: ["pepe", "pepecup"], coinId: "pepe", symbol: "PEPEUSDT", keyword: "pepe coin" },
  { keys: ["doge", "driftdoge", "dogecoin"], coinId: "dogecoin", symbol: "DOGEUSDT", keyword: "dogecoin" },
  { keys: ["shiba", "shib", "mooncat", "shiba-inu"], coinId: "shiba-inu", symbol: "SHIBUSDT", keyword: "shiba inu coin" },
  { keys: ["bitcoin", "btc"], coinId: "bitcoin", symbol: "BTCUSDT", keyword: "bitcoin" },
  { keys: ["ethereum", "eth"], coinId: "ethereum", symbol: "ETHUSDT", keyword: "ethereum" },
  { keys: ["solana", "sol"], coinId: "solana", symbol: "SOLUSDT", keyword: "solana" },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentChange(previous, next) {
  if (!previous) return 0;
  return ((next - previous) / previous) * 100;
}

function stripGooglePrefix(text) {
  return text.replace(/^\)\]\}',?\n/, "");
}

async function fetchJson(url, { timeout = 8000, headers = {} } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "user-agent": "MemeBuddy/1.0",
        ...headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url, { timeout = 8000, headers = {} } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      headers: {
        accept: "*/*",
        "user-agent": "Mozilla/5.0 MemeBuddy/1.0",
        ...headers,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }

    return response.text();
  } finally {
    clearTimeout(timer);
  }
}

function findCoinProfile({ name = "", asset = "", inviteCode = "" }) {
  const haystack = `${name} ${asset} ${inviteCode}`.toLowerCase();
  return COIN_CATALOG.find((item) => item.keys.some((key) => haystack.includes(key))) || null;
}

async function fetchBinanceTicker(symbol) {
  const data = await fetchJson(`https://api.binance.com/api/v3/ticker/24hr?symbol=${encodeURIComponent(symbol)}`);
  return {
    lastPrice: Number(data.lastPrice || 0),
    priceChangePercent: Number(data.priceChangePercent || 0),
    volume: Number(data.volume || 0),
    quoteVolume: Number(data.quoteVolume || 0),
  };
}

async function fetchBinanceKlines(symbol) {
  const data = await fetchJson(
    `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=4h&limit=7`
  );

  return data.map((item) => ({
    time: Number(item[0]),
    label: new Date(Number(item[0])).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
    }),
    close: Number(item[4]),
    volume: Number(item[7] || item[5] || 0),
  }));
}

async function fetchCoinGeckoCoin(coinId) {
  const data = await fetchJson(
    `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinId)}?localization=false&tickers=false&community_data=true&developer_data=false&sparkline=false`
  );

  return {
    marketCap: Number(data?.market_data?.market_cap?.usd || 0),
    totalVolume: Number(data?.market_data?.total_volume?.usd || 0),
    sentimentUp: Number(data?.sentiment_votes_up_percentage || 0),
    twitterFollowers: Number(data?.community_data?.twitter_followers || 0),
    subredditSubscribers: Number(data?.community_data?.reddit_subscribers || 0),
  };
}

async function fetchCoinGeckoMarketSnapshot(coinId) {
  const data = await fetchJson(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(coinId)}&price_change_percentage=24h,7d`
  );
  const item = Array.isArray(data) ? data[0] : null;

  return {
    currentPrice: Number(item?.current_price || 0),
    priceChangePercent: Number(item?.price_change_percentage_24h_in_currency || item?.price_change_percentage_24h || 0),
    marketCap: Number(item?.market_cap || 0),
    totalVolume: Number(item?.total_volume || 0),
  };
}

async function fetchCoinGeckoMarketChart(coinId) {
  const data = await fetchJson(
    `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(coinId)}/market_chart?vs_currency=usd&days=7&interval=daily`
  );

  const prices = Array.isArray(data?.prices) ? data.prices : [];
  const volumes = Array.isArray(data?.total_volumes) ? data.total_volumes : [];

  return prices.map((item, index) => ({
    time: Number(item[0]),
    label: new Date(Number(item[0])).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
    }),
    close: Number(item[1] || 0),
    volume: Number(volumes[index]?.[1] || 0),
  }));
}

async function fetchGoogleTrendsSeries(keyword) {
  const exploreReq = {
    comparisonItem: [{ keyword, time: "now 7-d", geo: "" }],
    category: 0,
    property: "",
  };

  const exploreText = await fetchText(
    `https://trends.google.com/trends/api/explore?hl=en-US&tz=0&req=${encodeURIComponent(JSON.stringify(exploreReq))}`
  );
  const exploreData = JSON.parse(stripGooglePrefix(exploreText));
  const widget = (exploreData.widgets || []).find((item) => item.id === "TIMESERIES");

  if (!widget) {
    throw new Error("Google Trends widget not found");
  }

  const timelineText = await fetchText(
    `https://trends.google.com/trends/api/widgetdata/multiline?hl=en-US&tz=0&req=${encodeURIComponent(
      JSON.stringify(widget.request)
    )}&token=${encodeURIComponent(widget.token)}`
  );
  const timelineData = JSON.parse(stripGooglePrefix(timelineText));

  return (timelineData.default?.timelineData || []).map((item) => ({
    time: Number(item.time) * 1000,
    label:
      item.formattedAxisTime ||
      new Date(Number(item.time) * 1000).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
      }),
    value: Array.isArray(item.value) ? Number(item.value[0] || 0) : Number(item.value || 0),
  }));
}

function mergeTimeline(trendSeries, priceSeries) {
  const points = Math.max(0, Math.min(trendSeries.length, priceSeries.length));
  const latestPrice = priceSeries.at(-1)?.close || 1;

  return Array.from({ length: points }).map((_, index) => {
    const trendPoint = trendSeries[trendSeries.length - points + index];
    const pricePoint = priceSeries[priceSeries.length - points + index];
    const mentions = Math.round((trendPoint?.value || 0) * 240);
    const volume = Math.round(pricePoint?.volume || 0);
    const price = Number((pricePoint?.close || 0).toFixed(latestPrice < 1 ? 6 : 2));

    return {
      label: trendPoint?.label || pricePoint?.label || `Point ${index + 1}`,
      mentions,
      clicks: Math.round(volume / 300000),
      views: Math.round((pricePoint?.close || 0) * 10000),
      volume,
      price,
      trendIndex: Math.round(trendPoint?.value || 0),
    };
  });
}

function buildTrendFallbackFromPriceSeries(priceSeries) {
  if (!priceSeries.length) return [];

  const maxVolume = Math.max(...priceSeries.map((item) => item.volume || 0), 1);
  return priceSeries.map((item) => ({
    time: item.time,
    label: item.label,
    value: clamp(Math.round(((item.volume || 0) / maxVolume) * 100), 12, 100),
  }));
}

function bucketFromScore(score) {
  if (score >= 70) return "High";
  if (score >= 45) return "Medium";
  return "Low";
}

function bucketFromMove(changePct) {
  if (changePct >= 2) return "High";
  if (changePct <= -2) return "Low";
  return "Medium";
}

function classifyVerification({ trendMomentum, volumeRatio, communitySentiment, communityStrength, currentTrend, priceChangePercent }) {
  let botRisk = 0;

  if (volumeRatio > 3.2) botRisk += 28;
  else if (volumeRatio > 2.2) botRisk += 16;

  if (currentTrend >= 75 && communitySentiment < 45) botRisk += 20;
  if (Math.abs(priceChangePercent) > 14) botRisk += 14;
  if (trendMomentum > 22 && communityStrength < 35) botRisk += 22;
  if (communityStrength < 22) botRisk += 12;
  if (communitySentiment < 35) botRisk += 10;

  const authenticityScore = clamp(Math.round(100 - botRisk), 8, 96);
  const classification =
    authenticityScore >= 72 ? "Human Verified" : authenticityScore <= 42 ? "Likely Bot / AI Amplified" : "Needs Human Review";
  const reviewerAction =
    authenticityScore >= 72 ? "Low priority review" : authenticityScore <= 42 ? "Manual verification recommended" : "Human moderation recommended";

  const reasons = [];
  if (volumeRatio > 2.2) reasons.push("engagement volume is outpacing the recent baseline");
  if (currentTrend >= 75 && communitySentiment < 45) reasons.push("search interest is surging faster than sentiment quality");
  if (trendMomentum > 22 && communityStrength < 35) reasons.push("trend momentum is sharp but community depth is weak");
  if (communityStrength >= 55) reasons.push("community participation looks deeper and more organic");
  if (communitySentiment >= 58) reasons.push("sentiment quality supports the current trend");

  return {
    authenticityScore,
    botRiskScore: clamp(Math.round(botRisk), 4, 92),
    classification,
    reviewerAction,
    verifiedBy: classification === "Human Verified" ? "Model + ruleset" : "Needs human moderator",
    reasons: reasons.slice(0, 3),
  };
}

function buildEngineOutputs({ trendScore, trendMomentum, currentTrend, priceChangePercent, volumeRatio, communitySentiment, trustScore, verification, accuracy, hypeCycle }) {
  let hypeReality;
  if (priceChangePercent >= 4 && priceChangePercent <= 14 && trendMomentum >= 4 && verification.authenticityScore >= 65 && trustScore === "Reliable") {
    hypeReality = {
      label: "Real Growth",
      tone: "success",
      summary: "Hype is increasing and price is rising in a healthier range.",
      takeaway: "Healthy trend",
    };
  } else if (verification.botRiskScore >= 58 || volumeRatio > 3 || (currentTrend >= 78 && priceChangePercent <= 0)) {
    hypeReality = {
      label: "Fake Hype",
      tone: "danger",
      summary: "Attention is high but price structure and trust are not supporting it cleanly.",
      takeaway: "Manipulation / pump signal",
    };
  } else if (priceChangePercent >= 18 || hypeCycle === "Distribution") {
    hypeReality = {
      label: "Too Late",
      tone: "warning",
      summary: "The move already looks crowded and the reward-to-risk is slipping.",
      takeaway: "Late entry risk",
    };
  } else {
    hypeReality = {
      label: "Watchlist",
      tone: "neutral",
      summary: "The setup is forming but still needs more clean confirmation.",
      takeaway: "Monitor closely",
    };
  }

  let timing;
  if (currentTrend < 40 && trendMomentum > 0 && priceChangePercent > -2) {
    timing = { phase: "Early", message: "Interest is building before the crowd is fully in.", risk: "Lower crowding risk" };
  } else if (currentTrend < 72 && priceChangePercent < 15) {
    timing = { phase: "Mid", message: "Momentum is established, but the move is not fully exhausted.", risk: "Balanced risk" };
  } else {
    timing = { phase: "Late", message: "The trend is crowded and unwind risk is elevated.", risk: "High dump risk" };
  }

  let pumpDump;
  if (verification.botRiskScore >= 64 || (volumeRatio > 3.3 && communitySentiment < 45)) {
    pumpDump = {
      status: "Possible coordinated pump",
      risk: "High",
      detail: "Sudden hype, stretched activity, and weaker trust are lining up like a pump pattern.",
    };
  } else if (priceChangePercent <= -10 && currentTrend >= 60) {
    pumpDump = {
      status: "Post-spike unwind",
      risk: "High",
      detail: "The move is already rolling over after a crowded run-up.",
    };
  } else {
    pumpDump = {
      status: "No major pump pattern",
      risk: "Moderate",
      detail: "Current activity does not strongly match a coordinated pump-and-dump pattern.",
    };
  }

  let lifecycle;
  if (priceChangePercent <= -8 && trendMomentum <= 0) {
    lifecycle = { phase: "Dump", message: "Attention is fading and downside pressure is dominating." };
  } else if (currentTrend >= 76 && priceChangePercent >= 10) {
    lifecycle = { phase: "Peak", message: "The coin is in a crowded peak phase with elevated reversal risk." };
  } else if (currentTrend >= 42 && trendMomentum >= 0) {
    lifecycle = { phase: "Growth", message: "The trend is still expanding with healthier participation." };
  } else {
    lifecycle = { phase: "Early", message: "The setup is still emerging before full breakout participation." };
  }

  let signalNoise;
  if (verification.authenticityScore >= 72 && trustScore === "Reliable" && (accuracy?.value ?? 0) >= 55) {
    signalNoise = { label: "High Signal", summary: "Useful signal is stronger than the surrounding market noise." };
  } else if (verification.botRiskScore >= 58 || trustScore === "Overhyped") {
    signalNoise = { label: "Unreliable", summary: "Too much noise or manipulation risk is contaminating the signal." };
  } else {
    signalNoise = { label: "Noisy Trend", summary: "There is signal here, but it is mixed with weaker quality momentum." };
  }

  let beginnerDecision;
  if (hypeReality.label === "Real Growth" && timing.phase !== "Late" && pumpDump.risk !== "High") {
    beginnerDecision = { action: "Buy", summary: "Momentum is cleaner, trust is healthier, and it is not obviously crowded yet." };
  } else if (hypeReality.label === "Fake Hype" || hypeReality.label === "Too Late" || pumpDump.risk === "High") {
    beginnerDecision = { action: "Avoid", summary: "Risk is too high for a simple entry because hype quality is weak or timing is late." };
  } else {
    beginnerDecision = { action: "Risk", summary: "The setup is tradable only if the user accepts higher uncertainty and monitors it closely." };
  }

  return {
    hypeReality,
    timing,
    pumpDump,
    lifecycle,
    signalNoise,
    beginnerDecision,
  };
}

function buildAlertRecommendation({ engines, verification, trendScore, priceChangePercent }) {
  if (
    (priceChangePercent <= -7 && verification.authenticityScore >= 62 && engines.signalNoise.label !== "Unreliable") ||
    (engines.hypeReality.label === "Real Growth" && engines.timing.phase === "Early")
  ) {
    return {
      side: "BUY",
      action: "Buy the dip / early strength",
      urgency: "high",
      summary: "Price has pulled back or is still early while the trend quality remains strong.",
      reason: "Healthy authenticity with supportive trend conditions.",
    };
  }

  if (
    priceChangePercent >= 12 ||
    engines.hypeReality.label === "Too Late" ||
    engines.pumpDump.risk === "High" ||
    engines.beginnerDecision.action === "Avoid"
  ) {
    return {
      side: "SELL",
      action: "Take profit / reduce exposure",
      urgency: "high",
      summary: "The move looks crowded, late, or exposed to pump-and-dump risk.",
      reason: "Late timing or manipulation risk is elevated.",
    };
  }

  return {
    side: "WATCH",
    action: "Wait and monitor",
    urgency: trendScore >= 70 ? "medium" : "low",
    summary: "The setup is active, but it does not yet justify a strong buy or sell alert.",
    reason: "Momentum is mixed and needs more confirmation.",
  };
}

function calculateTrendMetrics({ trendSeries, priceSeries, ticker, coinGecko }) {
  const trendValues = trendSeries.map((item) => item.value);
  const volumeValues = priceSeries.map((item) => item.volume);
  const avgVolume = average(volumeValues) || ticker.quoteVolume || 1;
  const currentTrend = trendValues.at(-1) || 0;
  const previousTrend = trendValues.at(-2) || currentTrend;
  const trendMomentum = currentTrend - previousTrend;
  const volumeRatio = avgVolume ? ticker.quoteVolume / avgVolume : 1;
  const communitySentiment = coinGecko.sentimentUp || 50;
  const twitterFollowers = coinGecko.twitterFollowers || 0;
  const subredditSubscribers = coinGecko.subredditSubscribers || 0;
  const communityStrength = clamp(
    Math.round((Math.log10(Math.max(1, twitterFollowers + subredditSubscribers)) / 7) * 100),
    10,
    100
  );

  const mentionsScore = clamp(Math.round(currentTrend), 0, 100);
  const engagementScore = clamp(
    Math.round(45 + (volumeRatio - 1) * 35 + Math.max(0, ticker.priceChangePercent) * 1.4 + Math.max(0, trendMomentum) * 0.9),
    0,
    100
  );
  const sentimentScore = clamp(
    Math.round(0.45 * communitySentiment + 0.35 * clamp(50 + ticker.priceChangePercent * 3.4, 0, 100) + 0.2 * communityStrength),
    0,
    100
  );
  const verification = classifyVerification({
    trendMomentum,
    volumeRatio,
    communitySentiment,
    communityStrength,
    currentTrend,
    priceChangePercent: ticker.priceChangePercent,
  });

  const trendScore = Math.round(mentionsScore * 0.4 + engagementScore * 0.3 + sentimentScore * 0.3);
  const prediction = bucketFromScore(trendScore);
  const movement =
    ticker.priceChangePercent >= 3 && trendMomentum >= 0 ? "Upward" : ticker.priceChangePercent <= -3 ? "Downward" : "Sideways";
  const hypeCycle =
    currentTrend >= 80 && ticker.priceChangePercent > 0
      ? "Breakout"
      : currentTrend >= 65 && ticker.priceChangePercent < 0
        ? "Distribution"
        : currentTrend >= 45
          ? "Acceleration"
          : "Emerging";

  const spikeDetected = trendMomentum >= 12 || volumeRatio >= 1.65;
  const confidence = clamp(
    Math.round(48 + Math.max(0, trendMomentum) * 0.9 + Math.min(22, Math.abs(ticker.priceChangePercent) * 1.4) + Math.min(18, Math.max(0, volumeRatio - 1) * 20)),
    45,
    97
  );

  const trustScore =
    communitySentiment >= 55 && volumeRatio <= 2.8 && movement !== "Downward"
      ? "Reliable"
      : communitySentiment < 40 || volumeRatio > 3.6
        ? "Overhyped"
        : "Watchlist";

  const socialSignals = {
    sources: [
      {
        platform: "Google Trends",
        mentions: Math.round(currentTrend * 240),
        engagement: Math.round(currentTrend * 110),
        sentiment: Math.round((communitySentiment + mentionsScore) / 2),
      },
      {
        platform: "Binance",
        mentions: Math.round(clamp(volumeRatio * 10000, 1500, 40000)),
        engagement: Math.round(ticker.quoteVolume),
        sentiment: clamp(Math.round(50 + ticker.priceChangePercent * 3), 0, 100),
      },
      {
        platform: "CoinGecko",
        mentions: Math.round(clamp(communityStrength * 110, 1200, 38000)),
        engagement: Math.round(coinGecko.totalVolume || ticker.quoteVolume),
        sentiment: Math.round(communitySentiment),
      },
    ],
    totalMentions: Math.round(currentTrend * 240),
    totalEngagement: Math.round(ticker.quoteVolume),
    overallSentiment: sentimentScore,
    spikeDetected,
    hypeCycle,
    movement,
  };

  const intervalChecks = [];
  for (let index = 1; index < Math.min(trendValues.length, priceSeries.length) - 1; index += 1) {
    const mentionScore = clamp(Math.round(trendValues[index]), 0, 100);
    const priorVolume = average(volumeValues.slice(0, index + 1)) || 1;
    const pointVolumeRatio = priceSeries[index].volume / priorVolume;
    const pointPriceChange = percentChange(priceSeries[index - 1].close, priceSeries[index].close);
    const pointSentiment = clamp(Math.round(50 + pointPriceChange * 3.4 + (trendValues[index] - trendValues[index - 1]) * 0.8), 0, 100);
    const pointEngagement = clamp(Math.round(45 + (pointVolumeRatio - 1) * 35 + Math.max(0, trendValues[index] - trendValues[index - 1]) * 0.9), 0, 100);
    const pointScore = Math.round(mentionScore * 0.4 + pointEngagement * 0.3 + pointSentiment * 0.3);
    const predicted = bucketFromScore(pointScore);
    const nextChange = percentChange(priceSeries[index].close, priceSeries[index + 1].close);
    const actual = bucketFromMove(nextChange);

    intervalChecks.push({ predicted, actual, correct: predicted === actual });
  }

  const matched = intervalChecks.filter((item) => item.correct).length;
  const accuracyValue = intervalChecks.length ? Math.round((matched / intervalChecks.length) * 100) : null;
  const accuracy = {
    label: accuracyValue === null ? "Live" : `${accuracyValue}%`,
    value: accuracyValue,
    note:
      accuracyValue === null
        ? "Live market mode is enabled, but there is not enough recent interval history yet to estimate fit."
        : `Measured against ${intervalChecks.length} recent 4h intervals using live Binance price moves and Google Trends search-interest changes.`,
    sampleSize: intervalChecks.length,
  };

  const alert = prediction === "High" ? "Strong Growth Signal" : prediction === "Low" ? "Decline Warning" : "Momentum Cooling";
  const engines = buildEngineOutputs({
    trendScore,
    trendMomentum,
    currentTrend,
    priceChangePercent: ticker.priceChangePercent,
    volumeRatio,
    communitySentiment,
    trustScore,
    verification,
    accuracy,
    hypeCycle,
  });
  const alertRecommendation = buildAlertRecommendation({
    engines,
    verification,
    trendScore,
    priceChangePercent: ticker.priceChangePercent,
  });

  return {
    mentionsScore,
    engagementScore,
    sentimentScore,
    verification,
    trendScore,
    prediction,
    growthPrediction: prediction,
    confidence,
    trustScore,
    movement,
    hypeCycle,
    spikeDetected,
    socialSignals,
    accuracy,
    alert,
    engines,
    alertRecommendation,
  };
}

function compactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function getCached(cacheKey) {
  const cached = inMemoryCache.get(cacheKey);
  if (!cached || cached.expiresAt <= Date.now()) {
    inMemoryCache.delete(cacheKey);
    return null;
  }
  return cached.value;
}

function setCached(cacheKey, value) {
  inMemoryCache.set(cacheKey, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}

export async function fetchLiveCoinSnapshot(eventLike) {
  const profile = findCoinProfile(eventLike);
  if (!profile) {
    return null;
  }

  const cacheKey = `live:${profile.coinId}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return cached;
  }

  const [tickerResult, klinesResult, coinGeckoResult, coinGeckoMarketResult, coinGeckoChartResult, trendResult] = await Promise.allSettled([
    fetchBinanceTicker(profile.symbol),
    fetchBinanceKlines(profile.symbol),
    fetchCoinGeckoCoin(profile.coinId),
    fetchCoinGeckoMarketSnapshot(profile.coinId),
    fetchCoinGeckoMarketChart(profile.coinId),
    fetchGoogleTrendsSeries(profile.keyword),
  ]);

  const coinGeckoBase =
    coinGeckoResult.status === "fulfilled"
      ? coinGeckoResult.value
      : {
          marketCap: Number(coinGeckoMarketResult.status === "fulfilled" ? coinGeckoMarketResult.value.marketCap : 0),
          totalVolume: Number(coinGeckoMarketResult.status === "fulfilled" ? coinGeckoMarketResult.value.totalVolume : 0),
          sentimentUp: 50,
          twitterFollowers: 0,
          subredditSubscribers: 0,
        };

  const ticker =
    tickerResult.status === "fulfilled"
      ? tickerResult.value
      : coinGeckoMarketResult.status === "fulfilled"
        ? {
            lastPrice: Number(coinGeckoMarketResult.value.currentPrice || 0),
            priceChangePercent: Number(coinGeckoMarketResult.value.priceChangePercent || 0),
            volume: Number(coinGeckoMarketResult.value.totalVolume || 0),
            quoteVolume: Number(coinGeckoMarketResult.value.totalVolume || 0),
          }
        : null;

  const priceSeries =
    klinesResult.status === "fulfilled" && klinesResult.value.length
      ? klinesResult.value
      : coinGeckoChartResult.status === "fulfilled" && coinGeckoChartResult.value.length
        ? coinGeckoChartResult.value
        : [];

  if (!ticker || !priceSeries.length || !coinGeckoBase.marketCap) {
    throw new Error("Required live market feeds are unavailable");
  }

  const trendSeries =
    trendResult.status === "fulfilled" && trendResult.value.length
      ? trendResult.value
      : buildTrendFallbackFromPriceSeries(priceSeries);

  const timeline = mergeTimeline(trendSeries, priceSeries);
  const metrics = calculateTrendMetrics({
    trendSeries,
    priceSeries,
    ticker,
    coinGecko: coinGeckoBase,
  });

  return setCached(cacheKey, {
    profile,
    ticker,
    coinGecko: coinGeckoBase,
    trendSeries,
    timeline,
    metrics,
    partialFallback: trendResult.status !== "fulfilled",
    fetchedAt: new Date().toISOString(),
  });
}

export function applyLiveSnapshotToEvent(eventLike, snapshot) {
  const payload = eventLike.toJSON ? eventLike.toJSON() : { ...eventLike };
  const mentionsLatest = snapshot.timeline.at(-1)?.mentions || payload.engagement?.mentions || 0;
  const volumeLatest = snapshot.timeline.at(-1)?.volume || snapshot.ticker.quoteVolume || 0;
  const marketCap = snapshot.coinGecko.marketCap || 0;

  return {
    ...payload,
    price: Number(snapshot.ticker.lastPrice.toFixed(snapshot.ticker.lastPrice < 1 ? 6 : 2)),
    marketCap: `$${compactNumber(marketCap)}`,
    volume: `$${compactNumber(snapshot.ticker.quoteVolume)}`,
    engagement: {
      views: Math.round(marketCap / 6000),
      clicks: Math.round(volumeLatest / 250000),
      mentions: mentionsLatest,
    },
    analytics: {
      ...(payload.analytics || {}),
      timeline: snapshot.timeline,
      heatmap: snapshot.timeline.map((item) => clamp(Math.round(item.trendIndex / 20), 1, 5)),
    },
    trendScore: snapshot.metrics.trendScore,
    score: snapshot.metrics.trendScore,
    trustScore: snapshot.metrics.trustScore,
    sentiment: snapshot.metrics.sentimentScore,
    confidence: snapshot.metrics.confidence,
    prediction: snapshot.metrics.prediction,
    growthPrediction: snapshot.metrics.growthPrediction,
    movement: snapshot.metrics.movement,
    hypeCycle: snapshot.metrics.hypeCycle,
    spikeDetected: snapshot.metrics.spikeDetected,
    socialSignals: snapshot.metrics.socialSignals,
    alert: snapshot.metrics.alert,
    analysis: {
      accuracy: snapshot.metrics.accuracy,
      engine: "meme-buddy-live-multi-source-v2",
      calibratedPrediction: snapshot.metrics.prediction,
      note: snapshot.partialFallback
        ? "Live prediction is using Binance and CoinGecko directly, with the interest series backfilled from recent market activity because Google Trends was temporarily unavailable."
        : "Live prediction blends Google Trends search-interest, Binance market structure, and CoinGecko community/market signals.",
      sources: snapshot.partialFallback ? ["Binance", "CoinGecko", "Interest fallback"] : ["Google Trends", "Binance", "CoinGecko"],
      fetchedAt: snapshot.fetchedAt,
      liveData: true,
      partialFallback: Boolean(snapshot.partialFallback),
      verification: snapshot.metrics.verification,
      engines: snapshot.metrics.engines,
      alertRecommendation: snapshot.metrics.alertRecommendation,
      formulaBreakdown: {
        mentions: snapshot.metrics.mentionsScore,
        engagement: snapshot.metrics.engagementScore,
        sentiment: snapshot.metrics.sentimentScore,
      },
      market: {
        priceChangePct: Number(snapshot.ticker.priceChangePercent.toFixed(2)),
        quoteVolume: Math.round(snapshot.ticker.quoteVolume),
        marketCap: Math.round(snapshot.coinGecko.marketCap || 0),
      },
    },
    verification: snapshot.metrics.verification,
    engines: snapshot.metrics.engines,
    alertRecommendation: snapshot.metrics.alertRecommendation,
  };
}
