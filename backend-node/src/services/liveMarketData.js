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

  return {
    mentionsScore,
    engagementScore,
    sentimentScore,
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

  const [tickerResult, klinesResult, coinGeckoResult, trendResult] = await Promise.allSettled([
    fetchBinanceTicker(profile.symbol),
    fetchBinanceKlines(profile.symbol),
    fetchCoinGeckoCoin(profile.coinId),
    fetchGoogleTrendsSeries(profile.keyword),
  ]);

  if (tickerResult.status !== "fulfilled" || klinesResult.status !== "fulfilled" || coinGeckoResult.status !== "fulfilled") {
    throw new Error("Required live market feeds are unavailable");
  }

  const ticker = tickerResult.value;
  const klines = klinesResult.value;
  const coinGecko = coinGeckoResult.value;
  const trendSeries =
    trendResult.status === "fulfilled" && trendResult.value.length
      ? trendResult.value
      : buildTrendFallbackFromPriceSeries(klines);

  const timeline = mergeTimeline(trendSeries, klines);
  const metrics = calculateTrendMetrics({
    trendSeries,
    priceSeries: klines,
    ticker,
    coinGecko,
  });

  return setCached(cacheKey, {
    profile,
    ticker,
    coinGecko,
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
  };
}
