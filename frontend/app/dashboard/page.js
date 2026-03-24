"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CandlestickChart, RadioTower, Waves } from "lucide-react";
import Link from "next/link";
import { AppShell } from "../../components/AppShell";
import { PredictionCard } from "../../components/PredictionCard";
import { StatCard } from "../../components/StatCard";
import { TrendChartCard } from "../../components/TrendChartCard";
import { TrendEventCard } from "../../components/TrendEventCard";
import { apiFetch } from "../../lib/api";
import { useProtectedPage } from "../../lib/useProtectedPage";

export default function DashboardPage() {
  useProtectedPage();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [selectedCoinId, setSelectedCoinId] = useState("");
  const [mailStatus, setMailStatus] = useState("");

  useEffect(() => {
    apiFetch("/dashboard")
      .then((payload) => {
        setData(payload);
        setSelectedCoinId(payload.activeCoin?._id || payload.liveCoins?.[0]?._id || "");
      })
      .catch((err) => setError(err.message));
  }, []);

  const activeCoin = useMemo(() => {
    const liveCoins = data?.liveCoins || [];
    return liveCoins.find((item) => item._id === selectedCoinId) || data?.activeCoin || liveCoins[0] || null;
  }, [data, selectedCoinId]);

  const chartData = (activeCoin?.analytics?.timeline || []).map((item) => ({
    label: item.label,
    mentions: item.mentions,
  }));

  return (
    <AppShell
      title="Live meme coin intelligence"
      eyebrow="Realtime market prediction"
      action={
        <Link href="/events" className="rounded-2xl bg-gradient-to-r from-brand to-brand2 px-4 py-3 text-sm font-semibold text-white">
          <span className="inline-flex items-center gap-2">
            Open Event Studio
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      }
    >
      {error ? <div className="glass rounded-4xl p-5 text-red">{error}</div> : null}

      {activeCoin ? (
        <section className="glass overflow-hidden rounded-4xl p-6 md:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.15fr,0.85fr] xl:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-muted">Live market mode</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-white md:text-5xl">
                Track live meme coin momentum with the uploaded prediction pipeline.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
                This dashboard is now dedicated to actual live coin monitoring. Event creation and join flows stay separate inside Event Studio.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <SourceBadge icon={RadioTower} label="Google Trends search-interest" />
                <SourceBadge icon={CandlestickChart} label="Binance price and volume" />
                <SourceBadge icon={Waves} label="CoinGecko market and community" />
              </div>
            </div>

            <div className="rounded-[1.9rem] border border-line bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.26em] text-muted">Selected coin</p>
              <p className="mt-3 text-3xl font-semibold text-white">{activeCoin.asset}</p>
              <p className="mt-2 text-sm text-muted">{activeCoin.description}</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <MiniMetric label="Prediction" value={activeCoin.prediction} />
                <MiniMetric label="Measured fit" value={activeCoin.analysis?.accuracy?.label || "Live"} />
                <MiniMetric label="Trust" value={activeCoin.trustScore} />
                <MiniMetric label="Confidence" value={`${activeCoin.confidence}%`} />
              </div>
              <div className="mt-5 rounded-[1.5rem] border border-line bg-black/10 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Alert recommendation</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {activeCoin.alertRecommendation?.side || "WATCH"} • {activeCoin.alertRecommendation?.action || "Wait and monitor"}
                </p>
                <p className="mt-2 text-sm text-muted">{activeCoin.alertRecommendation?.summary || "No current email alert recommendation."}</p>
                <p className="mt-2 text-sm text-brand2">{activeCoin.alertRecommendation?.reason || ""}</p>
                <button
                  className="mt-4 rounded-2xl bg-gradient-to-r from-brand to-brand2 px-4 py-3 text-sm font-semibold text-white"
                  onClick={async () => {
                    try {
                      const payload = await apiFetch("/alerts/email", {
                        method: "POST",
                        body: JSON.stringify({ coinId: activeCoin._id }),
                      });
                      setMailStatus(payload.message);
                    } catch (mailError) {
                      setMailStatus(mailError.message);
                    }
                  }}
                >
                  Send Alert Mail
                </button>
                {mailStatus ? <p className="mt-3 text-sm text-muted">{mailStatus}</p> : null}
              </div>
              <div className="mt-5 rounded-[1.5rem] border border-line bg-black/10 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Trend verification</p>
                <p className="mt-2 text-lg font-semibold text-white">{activeCoin.verification?.classification || "Needs Human Review"}</p>
                <p className="mt-2 text-sm text-muted">
                  Authenticity {activeCoin.verification?.authenticityScore ?? 0}/100 • Bot risk {activeCoin.verification?.botRiskScore ?? 0}/100
                </p>
                <p className="mt-2 text-sm text-brand2">{activeCoin.verification?.reviewerAction || "Human moderation recommended"}</p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-4">
        {(data?.stats || []).map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} hint={item.hint} tone={item.toneClass} />
        ))}
      </section>

      {activeCoin ? (
        <section className="grid gap-4 xl:grid-cols-[1.35fr,1fr]">
          <TrendChartCard title="Search-interest over time" subtitle="Live Google Trends series" data={chartData} />
          <PredictionCard event={activeCoin} />
        </section>
      ) : null}

      {activeCoin?.engines ? (
        <section className="grid gap-4 xl:grid-cols-3">
          <EngineCard
            title="Hype vs Reality"
            value={activeCoin.engines.hypeReality?.label}
            detail={activeCoin.engines.hypeReality?.summary}
            footer={activeCoin.engines.hypeReality?.takeaway}
            tone={activeCoin.engines.hypeReality?.tone}
          />
          <EngineCard
            title="Hype Timing"
            value={activeCoin.engines.timing?.phase}
            detail={activeCoin.engines.timing?.message}
            footer={activeCoin.engines.timing?.risk}
            tone={activeCoin.engines.timing?.phase === "Late" ? "warning" : activeCoin.engines.timing?.phase === "Early" ? "success" : "neutral"}
          />
          <EngineCard
            title="Pump & Dump"
            value={activeCoin.engines.pumpDump?.status}
            detail={activeCoin.engines.pumpDump?.detail}
            footer={`${activeCoin.engines.pumpDump?.risk || "Moderate"} risk`}
            tone={activeCoin.engines.pumpDump?.risk === "High" ? "danger" : "neutral"}
          />
          <EngineCard
            title="Lifecycle"
            value={activeCoin.engines.lifecycle?.phase}
            detail={activeCoin.engines.lifecycle?.message}
            footer="Early → Growth → Peak → Dump"
            tone={activeCoin.engines.lifecycle?.phase === "Growth" ? "success" : activeCoin.engines.lifecycle?.phase === "Peak" || activeCoin.engines.lifecycle?.phase === "Dump" ? "danger" : "neutral"}
          />
          <EngineCard
            title="Signal vs Noise"
            value={activeCoin.engines.signalNoise?.label}
            detail={activeCoin.engines.signalNoise?.summary}
            footer={`Trust: ${activeCoin.trustScore}`}
            tone={activeCoin.engines.signalNoise?.label === "High Signal" ? "success" : activeCoin.engines.signalNoise?.label === "Unreliable" ? "danger" : "neutral"}
          />
          <EngineCard
            title="Beginner Decision"
            value={activeCoin.engines.beginnerDecision?.action}
            detail={activeCoin.engines.beginnerDecision?.summary}
            footer="Simple action output"
            tone={activeCoin.engines.beginnerDecision?.action === "Buy" ? "success" : activeCoin.engines.beginnerDecision?.action === "Avoid" ? "danger" : "warning"}
          />
        </section>
      ) : null}

      <section className="glass rounded-4xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Live meme coin board</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Actual market signals</h3>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Pick a live coin to inspect current trend score, prediction, accuracy, and source-backed signal quality.
            </p>
          </div>
          <Link href="/discover" className="text-sm text-brand2">
            Open discovery feed
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(data?.liveCoins || []).map((coin) => (
            <TrendEventCard
              key={coin._id}
              event={coin}
              interactive
              active={coin._id === activeCoin?._id}
              onClick={() => setSelectedCoinId(coin._id)}
            />
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function SourceBadge({ icon: Icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-4 py-2 text-sm text-white">
      <Icon className="h-4 w-4 text-brand2" />
      {label}
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-3xl border border-line bg-black/10 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </div>
  );
}

function EngineCard({ title, value, detail, footer, tone = "neutral" }) {
  const toneClass =
    tone === "success"
      ? "text-green"
      : tone === "danger"
        ? "text-red"
        : tone === "warning"
          ? "text-yellow"
          : "text-white";

  return (
    <div className="glass rounded-4xl p-5 md:p-6">
      <p className="text-xs uppercase tracking-[0.26em] text-muted">{title}</p>
      <p className={`mt-4 text-2xl font-semibold ${toneClass}`}>{value}</p>
      <p className="mt-3 text-sm leading-6 text-muted">{detail}</p>
      <p className="mt-4 text-sm font-medium text-brand2">{footer}</p>
    </div>
  );
}
