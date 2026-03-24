export function TrendEventCard({ event, interactive = false, active = false, onClick }) {
  const predictionTone = event.prediction === "High" ? "text-green" : event.prediction === "Low" ? "text-red" : "text-yellow";
  const Container = interactive ? "button" : "div";

  return (
    <Container
      type={interactive ? "button" : undefined}
      onClick={interactive ? onClick : undefined}
      className={`glass panel-hover block rounded-4xl bg-gradient-to-br from-white/[0.04] to-transparent p-5 text-left transition md:p-6 ${
        active ? "border-brand/50 shadow-glow" : "hover:border-brand/30"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="section-title text-lg font-semibold text-white md:text-[1.35rem]">{event.asset}</p>
          <p className="mt-1 text-sm text-brand2">{event.name}</p>
        </div>
        <span className={`rounded-full bg-white/5 px-3 py-1 text-sm ${predictionTone}`}>{event.prediction}</span>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-3xl border border-line bg-black/10 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Signal state</p>
          <p className="mt-2 text-base font-semibold text-white">
            {event.prediction === "High" ? "Bullish setup" : event.prediction === "Low" ? "Bearish pressure" : "Neutral watch"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Accuracy</p>
          <p className="mt-2 text-base font-semibold text-white">{event.analysis?.accuracy?.label || "Live"}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <SmallMetric label="Trend score" value={event.score ?? event.trendScore} />
        <SmallMetric label="Trust" value={event.trustScore} />
        <SmallMetric label="Mentions" value={event.engagement?.mentions || 0} />
        <SmallMetric label="Confidence" value={`${event.confidence}%`} />
      </div>

      <div className="mt-4 rounded-3xl border border-line bg-black/10 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.24em] text-muted">Verification</p>
        <p className="mt-2 text-base font-semibold text-white">{event.verification?.classification || "Needs Human Review"}</p>
        <p className="mt-2 text-sm text-muted">
          Authenticity {event.verification?.authenticityScore ?? 0}/100 • Bot risk {event.verification?.botRiskScore ?? 0}/100
        </p>
      </div>
    </Container>
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
