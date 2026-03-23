import Link from "next/link";

export function TrendEventCard({ event }) {
  const predictionTone = event.prediction === "High" ? "text-green" : event.prediction === "Low" ? "text-red" : "text-yellow";

  return (
    <Link
      href={`/events/${event._id}`}
      className="glass panel-hover block rounded-4xl bg-gradient-to-br from-white/[0.04] to-transparent p-5 transition hover:border-brand/40 md:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-title text-lg font-semibold text-white md:text-[1.35rem]">{event.name}</p>
          <p className="mt-1 text-sm text-brand2">{event.asset}</p>
        </div>
        <span className={`rounded-full bg-white/5 px-3 py-1 text-sm ${predictionTone}`}>{event.prediction}</span>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-3xl border border-line bg-black/10 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Signal state</p>
          <p className="mt-2 text-base font-semibold text-white">
            {event.prediction === "High" ? "High Growth" : event.prediction === "Low" ? "Decline" : "Stable Watch"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Accuracy</p>
          <p className="mt-2 text-base font-semibold text-white">{event.analysis?.accuracy?.label || "N/A"}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <SmallMetric label="Trend score" value={event.score ?? event.trendScore} />
        <SmallMetric label="Participants" value={event.participantCount || event.participantsCount || 0} />
        <SmallMetric label="Mentions" value={event.engagement?.mentions || 0} />
        <SmallMetric label="Sentiment" value={event.sentiment ?? 50} />
      </div>
    </Link>
  );
}

function SmallMetric({ label, value }) {
  return (
    <div className="rounded-3xl border border-line bg-black/10 px-3 py-3">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </div>
  );
}
