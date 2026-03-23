"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { LeaderboardPanel } from "../../components/LeaderboardPanel";
import { apiFetch } from "../../lib/api";
import { useProtectedPage } from "../../lib/useProtectedPage";

export default function LeaderboardPage() {
  useProtectedPage();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    apiFetch("/leaderboard").then((payload) => setLeaderboard(payload.entries)).catch(() => {});
  }, []);

  return (
    <AppShell title="Leaderboard" eyebrow="Gamified rankings">
      <div className="fade-slide">
        <LeaderboardPanel entries={leaderboard} />
      </div>
    </AppShell>
  );
}
