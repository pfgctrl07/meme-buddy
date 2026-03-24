"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Eye, Hash, MousePointerClick, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { useParams } from "next/navigation";
import { AppShell } from "../../../components/AppShell";
import { LeaderboardPanel } from "../../../components/LeaderboardPanel";
import { PredictionCard } from "../../../components/PredictionCard";
import { StatCard } from "../../../components/StatCard";
import { TrendChartCard } from "../../../components/TrendChartCard";
import { apiFetch } from "../../../lib/api";
import { useProtectedPage } from "../../../lib/useProtectedPage";

export default function EventDetailPage() {
  useProtectedPage();
  const params = useParams();
  const [eventData, setEventData] = useState(null);
  const [chartMode, setChartMode] = useState("mentions");

  useEffect(() => {
    if (!params?.eventId) return;
    apiFetch(`/events/${params.eventId}`).then(setEventData).catch(() => {});
  }, [params?.eventId]);

  const event = eventData?.event;

  const chartData = useMemo(
    () =>
      (event?.analytics?.timeline || []).map((item) => ({
        label: item.label,
        mentions: item.mentions,
        clicks: item.clicks,
        views: item.views,
        volume: item.volume,
        price: item.price,
        trendIndex: item.trendIndex,
      })),
    [event]
  );

  const chartTitle = chartMode === "mentions" ? "Search-interest growth" : chartMode === "volume" ? "Market volume trend" : "Price trend";
  const chartSubtitle =
    chartMode === "mentions"
      ? "Google Trends interest over time"
      : chartMode === "volume"
        ? "Binance quote volume over time"
        : "Binance closing price over time";
  const chartStroke = chartMode === "mentions" ? "#6c7cff" : chartMode === "volume" ? "#3dc6ff" : "#39d98a";

  return (
    <AppShell title={event?.name || "Event detail"} eyebrow="Realtime simulation room">
      {event ? (
        <>
          <section className="glass overflow-hidden rounded-4xl p-6 md:p-8 shadow-glow">
            <div className="grid gap-8 xl:grid-cols-[1.2fr,0.8fr] xl:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-4 py-2 text-sm text-muted">
                  <Sparkles className="h-4 w-4 text-brand2" />
                  Event code {event.inviteCode}
                </div>
                <h2 className="mt-5 text-4xl font-semibold leading-tight text-white md:text-5xl">{event.name}</h2>
                <p className="mt-3 text-base font-medium text-brand2">{event.asset}</p>
                <p className="mt-5 max-w-3xl text-sm leading-7 text-muted">{event.description}</p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <SignalBadge icon={TrendingUp} label={event.prediction} />
                  <SignalBadge icon={ShieldCheck} label={event.trustScore} />
                  <SignalBadge icon={Activity} label={`${event.confidence}% confidence`} />
                  <SignalBadge icon={Sparkles} label={`${event.movement || "Sideways"} movement`} />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                <HighlightMetric label="Trend score" value={`${event.trendScore}/100`} tone="text-brand2" />
                <HighlightMetric label="Accuracy" value={event.analysis?.accuracy?.label || "Unverified"} tone="text-green" />
                <HighlightMetric label="Participants" value={event.participantCount || 0} tone="text-yellow" />
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Views"
              value={event.engagement.views.toLocaleString()}
              hint="Audience reach expanding across discovery surfaces"
              tone="text-brand2"
            />
            <StatCard
              label="Clicks"
              value={event.engagement.clicks.toLocaleString()}
              hint="Interaction intent from live traffic"
              tone="text-cyan-300"
            />
            <StatCard
              label="Mentions"
              value={event.engagement.mentions.toLocaleString()}
              hint="Social spread and narrative density"
              tone="text-green"
            />
            <StatCard
              label="Prediction"
              value={event.prediction}
              hint={event.alert}
              tone={event.prediction === "High" ? "text-green" : event.prediction === "Low" ? "text-red" : "text-yellow"}
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.45fr,0.95fr]">
            <div className="glass rounded-4xl p-6">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">Growth graph</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">Event momentum</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "mentions", label: "Interest", icon: Hash },
                    { key: "volume", label: "Volume", icon: MousePointerClick },
                    { key: "price", label: "Price", icon: Eye },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = chartMode === item.key;
                    return (
                      <button
                        key={item.key}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
                          active ? "bg-brand text-white" : "bg-white/5 text-muted"
                        }`}
                        onClick={() => setChartMode(item.key)}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <TrendChartCard title={chartTitle} subtitle={chartSubtitle} data={chartData} dataKey={chartMode} stroke={chartStroke} />
            </div>

            <PredictionCard event={event} />
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.08fr,0.92fr]">
            <div className="glass rounded-4xl p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Signal board</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Prediction score breakdown</h3>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <DataTile label="Prediction score" value={`${event.score ?? event.trendScore}/100`} detail="Computed from live interest, market activity, and sentiment." />
                <DataTile label="Confidence" value={`${event.confidence}%`} detail="Model certainty based on the final trend score." />
                <DataTile label="Sentiment" value={`${event.sentiment ?? 50}/100`} detail="Sentiment contribution blended from price action and community health." />
                <DataTile label="Measured fit" value={event.analysis?.accuracy?.label || "Unverified"} detail="Recent interval hit-rate using live series." />
                <DataTile
                  label="Verification"
                  value={event.verification?.classification || "Needs Human Review"}
                  detail={`Authenticity ${event.verification?.authenticityScore ?? 0}/100 • Bot risk ${event.verification?.botRiskScore ?? 0}/100`}
                />
                <DataTile
                  label="Reviewer action"
                  value={event.verification?.reviewerAction || "Human moderation recommended"}
                  detail={(event.verification?.reasons || []).join(", ") || "No verification detail available yet."}
                />
              </div>

              <div className="mt-6 rounded-[1.75rem] border border-line bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">Model note</p>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {event.analysis?.note ||
                    event.analysis?.accuracy?.note ||
                    "The prediction engine blends live search interest, exchange structure, and market/community trust signals into a single event score."}
                </p>
              </div>
            </div>

            <LeaderboardPanel entries={eventData?.leaderboard || []} />
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
            <div className="glass rounded-4xl p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Social media analytics</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Source integrations and sentiment tracking</h3>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {(event.socialSignals?.sources || []).map((source) => (
                  <div key={source.platform} className="rounded-[1.75rem] border border-line bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-muted">{source.platform}</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{source.mentions.toLocaleString()}</p>
                    <p className="mt-2 text-sm text-muted">{source.engagement.toLocaleString()} engagement</p>
                    <p className="mt-2 text-sm text-brand2">{source.sentiment}/100 sentiment</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-4xl p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Trend alerts</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Spikes, hype cycles, and direction</h3>

              <div className="mt-6 grid gap-3">
                <DataTile label="Movement direction" value={event.movement || "Sideways"} detail="Predicted upward/downward pressure based on social signals." />
                <DataTile label="Hype cycle" value={event.hypeCycle || "Emerging"} detail="Current stage of meme attention and crowd behavior." />
                <DataTile label="Spike detection" value={event.spikeDetected ? "Spike detected" : "No spike"} detail="Looks for sharp changes in mentions and engagement." />
                <DataTile label="Alert status" value={event.alert} detail="Dashboard-ready alert output for the current event." />
                <DataTile label="Origin check" value={event.verification?.classification || "Needs Human Review"} detail={event.verification?.verifiedBy || "Rule-based model"} />
              </div>
            </div>
          </section>
        </>
      ) : null}
    </AppShell>
  );
}

function SignalBadge({ icon: Icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-4 py-2 text-sm text-white">
      <Icon className="h-4 w-4 text-brand2" />
      {label}
    </div>
  );
}

function HighlightMetric({ label, value, tone }) {
  return (
    <div className="rounded-[1.75rem] border border-line bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
      <p className={`mt-3 text-2xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

function DataTile({ label, value, detail }) {
  return (
    <div className="rounded-[1.75rem] border border-line bg-black/10 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
    </div>
  );
}
