"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { AppShell } from "../../components/AppShell";
import { LeaderboardPanel } from "../../components/LeaderboardPanel";
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

  useEffect(() => {
    apiFetch("/dashboard")
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const activeEvent = data?.activeEvent;
  const chartData = (activeEvent?.analytics?.timeline || []).map((item) => ({
    label: item.label,
    mentions: item.mentions,
  }));
  const topThree = (data?.leaderboard || []).slice(0, 3);
  const sourceBadges = activeEvent?.socialSignals?.sources || [];

  return (
    <AppShell
      title="Command center"
      eyebrow="AI trend operations"
      action={
        <Link href="/events" className="rounded-2xl bg-gradient-to-r from-brand to-brand2 px-4 py-3 text-sm font-semibold text-white">
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Trend
          </span>
        </Link>
      }
    >
      {error ? <div className="glass rounded-4xl p-5 text-red">{error}</div> : null}

      {activeEvent ? (
        <section className="glass overflow-hidden rounded-4xl p-6 md:p-8">
          <div className="grid gap-8 xl:grid-cols-[1.2fr,0.8fr] xl:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-muted">Live control room</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-white md:text-5xl">
                Track meme momentum before the rest of the timeline catches up.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
                Meme Buddy blends social media signal tracking, sentiment analysis, hype-cycle detection, and movement prediction into one premium operator dashboard.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/events/${activeEvent._id}`} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-bg">
                  Open Active Event
                </Link>
                <Link href="/discover" className="rounded-2xl border border-line bg-white/5 px-5 py-3 text-sm font-semibold text-white">
                  Explore Trends
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {sourceBadges.map((source) => (
                  <span key={source.platform} className="rounded-full border border-line bg-white/5 px-4 py-2 text-sm text-white">
                    {source.platform} {source.mentions.toLocaleString()} mentions
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              {topThree.map((entry) => (
                <div key={entry.rank} className="rounded-[1.75rem] border border-line bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">Rank #{entry.rank}</p>
                  <p className="mt-3 text-lg font-semibold text-white">{entry.name}</p>
                  <p className="mt-1 text-sm text-muted">{entry.badge}</p>
                  <p className="mt-4 text-sm font-semibold text-brand2">{entry.points} pts</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-4">
        {(data?.stats || []).map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} hint={item.hint} tone={item.toneClass} />
        ))}
      </section>

      {activeEvent ? (
        <section className="grid gap-4 xl:grid-cols-[1.4fr,1fr]">
          <TrendChartCard title="Mentions vs Time" subtitle="Realtime velocity" data={chartData} />
          <PredictionCard event={activeEvent} />
        </section>
      ) : null}

      {activeEvent ? (
        <section className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="glass rounded-4xl p-6">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Social analytics</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Platform signals and trend tracking</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {(activeEvent.socialSignals?.sources || []).map((source) => (
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
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Alerts and movement</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Spike detection</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <InsightTile label="Movement" value={activeEvent.movement || "Sideways"} tone={activeEvent.movement === "Upward" ? "text-green" : activeEvent.movement === "Downward" ? "text-red" : "text-yellow"} />
              <InsightTile label="Hype cycle" value={activeEvent.hypeCycle || "Emerging"} tone="text-brand2" />
              <InsightTile label="Spike" value={activeEvent.spikeDetected ? "Detected" : "Normal"} tone={activeEvent.spikeDetected ? "text-green" : "text-white"} />
              <InsightTile label="Alert" value={activeEvent.alert} tone="text-yellow" />
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.35fr,0.95fr]">
        <div className="glass rounded-4xl p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Trending events</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Hot simulations</h3>
              <p className="mt-2 max-w-xl text-sm text-muted">
                Trending events are ranked by momentum, trust, and operator participation so the strongest startup-style signals float to the top.
              </p>
            </div>
            <Link href="/discover" className="text-sm text-brand2">
              View all
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {(data?.trendingEvents || []).map((event) => (
              <TrendEventCard key={event._id} event={event} />
            ))}
          </div>
        </div>

        <LeaderboardPanel entries={data?.leaderboard || []} compact />
      </section>
    </AppShell>
  );
}

function InsightTile({ label, value, tone }) {
  return (
    <div className="rounded-[1.75rem] border border-line bg-black/10 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
      <p className={`mt-3 text-lg font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
