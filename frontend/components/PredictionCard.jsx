export function PredictionCard({ event }) {
  const tone = event.prediction === "High" ? "text-green" : event.prediction === "Low" ? "text-red" : "text-yellow";
  const statusLabel = event.prediction === "High" ? "High Growth" : event.prediction === "Low" ? "Decline" : "Medium Growth";
  const gradient =
    event.prediction === "High"
      ? "from-green/20 via-brand/10 to-transparent"
      : event.prediction === "Low"
        ? "from-red/20 via-red/10 to-transparent"
        : "from-yellow/20 via-brand2/10 to-transparent";

  return (
    <div className={`glass panel-hover rounded-4xl bg-gradient-to-br ${gradient} p-6 md:p-7`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">Prediction Engine</p>
          <h3 className="section-title mt-3 text-xl font-semibold text-white md:text-2xl">{event.name}</h3>
          <p className="mt-1 text-sm text-brand2">{event.asset}</p>
        </div>
        <div className="text-right">
          <div className={`rounded-full px-4 py-2 text-sm font-semibold ${tone} bg-white/5`}>{event.prediction}</div>
          <p className="mt-2 text-xs uppercase tracking-[0.24em] text-muted">{statusLabel}</p>
        </div>
      </div>

      <div className="mt-6 rounded-[1.75rem] border border-line bg-black/10 p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Growth signal</p>
            <p className={`section-title mt-3 text-4xl font-semibold ${tone} md:text-5xl`}>{event.score ?? event.trendScore}</p>
          </div>
          <div className="rounded-3xl border border-line bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Confidence</p>
            <p className="mt-2 text-2xl font-semibold text-white">{event.confidence}%</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted">
          {statusLabel === "High Growth"
            ? "Momentum, engagement velocity, and trust are aligned for upside breakout conditions."
            : statusLabel === "Decline"
              ? "Engagement quality is fading and the event is showing signs of exhaustion."
              : "The signal is active, but conviction is mixed and needs more momentum to confirm."}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Trend Score" value={`${event.trendScore}/100`} />
        <Metric label="Trust Score" value={event.trustScore} />
        <Metric label="Confidence" value={`${event.confidence}%`} />
        <Metric label="Accuracy" value={event.analysis?.accuracy?.label || "Unverified"} />
      </div>

      <p className="mt-5 text-sm leading-7 text-muted">
        {event.analysis?.accuracy?.note ||
          (event.analysis?.liveData
            ? "This live prediction blends Google Trends, Binance, and CoinGecko signals."
            : "This prototype prediction blends engagement, trend momentum, and simulated trust signals.")}
      </p>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-3xl border border-line bg-white/5 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
