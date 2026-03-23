export function StatCard({ label, value, hint, tone = "text-white" }) {
  return (
    <div className="glass panel-hover rounded-4xl p-5 md:p-6">
      <p className="text-xs uppercase tracking-[0.26em] text-muted">{label}</p>
      <p className={`section-title mt-4 text-3xl font-semibold ${tone} md:text-[2.15rem]`}>{value}</p>
      <p className="mt-3 text-sm leading-6 text-muted">{hint}</p>
    </div>
  );
}
