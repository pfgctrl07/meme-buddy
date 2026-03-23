export function LeaderboardPanel({ entries, compact = false }) {
  return (
    <div className="glass panel-hover rounded-4xl p-6 md:p-7">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">{compact ? "Top operators" : "Live ranking"}</p>
        <h3 className="section-title mt-2 text-xl font-semibold text-white md:text-2xl">{compact ? "Leaderboard Preview" : "Leaderboard"}</h3>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={`${entry.rank}-${entry.name}`}
            className={`flex items-center justify-between rounded-3xl border px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 ${
              entry.rank === 1
                ? "border-yellow/30 bg-yellow/10"
                : entry.rank === 2
                  ? "border-white/15 bg-white/7"
                  : entry.rank === 3
                    ? "border-orange-400/20 bg-orange-400/10"
                    : "border-line bg-white/5"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl font-semibold text-white ${
                  entry.rank === 1
                    ? "bg-yellow/20"
                    : entry.rank === 2
                      ? "bg-white/10"
                      : entry.rank === 3
                        ? "bg-orange-400/20"
                        : "bg-white/10"
                }`}
              >
                {entry.rank}
              </div>
              <div>
                <p className="font-medium text-white">{entry.name}</p>
                <p className="text-sm text-muted">{entry.badge}</p>
              </div>
            </div>
            <p className="font-semibold text-brand2">{entry.points} pts</p>
          </div>
        ))}
      </div>
    </div>
  );
}
