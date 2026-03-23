"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { StatCard } from "../../components/StatCard";
import { TrendChartCard } from "../../components/TrendChartCard";
import { apiFetch } from "../../lib/api";
import { useProtectedPage } from "../../lib/useProtectedPage";

export default function ProfilePage() {
  useProtectedPage();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    apiFetch("/profile/me").then(setProfile).catch(() => {});
  }, []);

  const activity = (profile?.activitySeries || []).map((value, index) => ({
    label: `W${index + 1}`,
    mentions: value,
  }));

  return (
    <AppShell title="Operator profile" eyebrow="Performance and achievements">
      {profile ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total points" value={profile.points.toLocaleString()} hint="Leaderboard credit" tone="text-brand2" />
            <StatCard label="Events joined" value={profile.eventsJoined} hint="Participation footprint" />
            <StatCard label="Events created" value={profile.eventsCreated} hint="Builder output" />
            <StatCard label="Win rate" value={`${profile.winRate}%`} hint="Prediction success ratio" tone="text-green" />
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.35fr,1fr]">
            <TrendChartCard title="Activity performance" subtitle="Engagement over time" data={activity} />
            <div className="glass panel-hover rounded-4xl p-6 md:p-7">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Achievements</p>
              <h3 className="section-title mt-2 text-xl font-semibold text-white md:text-2xl">{profile.name}</h3>
              <p className="mt-1 text-sm text-brand2">{profile.email}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {profile.achievements.map((achievement) => (
                  <span key={achievement} className="rounded-full border border-line bg-white/5 px-4 py-2 text-sm text-white transition hover:border-brand/30">
                    {achievement}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </AppShell>
  );
}
