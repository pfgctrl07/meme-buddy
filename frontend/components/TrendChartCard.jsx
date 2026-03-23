"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TrendChartCard({ title, subtitle, data, dataKey = "mentions", stroke = "#6c7cff" }) {
  const latest = data?.[data.length - 1]?.[dataKey] ?? 0;
  const prior = data?.[Math.max(0, data.length - 2)]?.[dataKey] ?? 0;
  const delta = prior ? (((latest - prior) / prior) * 100).toFixed(1) : "0.0";

  return (
    <div className="panel-hover rounded-4xl border border-line bg-black/10 p-6 transition-all duration-200 md:p-7">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted">{subtitle}</p>
          <h3 className="section-title mt-2 text-xl font-semibold text-white md:text-2xl">{title}</h3>
        </div>
        <div className="flex gap-3">
          <div className="rounded-3xl border border-line bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Current</p>
            <p className="mt-2 text-lg font-semibold text-white">{latest.toLocaleString()}</p>
          </div>
          <div className="rounded-3xl border border-line bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Delta</p>
            <p className={`mt-2 text-lg font-semibold ${Number(delta) >= 0 ? "text-green" : "text-red"}`}>
              {Number(delta) >= 0 ? "+" : ""}
              {delta}%
            </p>
          </div>
        </div>
      </div>

      <div className="h-72 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="trend-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={stroke} stopOpacity={0.6} />
                <stop offset="95%" stopColor={stroke} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="label" stroke="#8ea0c7" tickLine={false} axisLine={false} />
            <YAxis stroke="#8ea0c7" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "#0f1728",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18,
                boxShadow: "0 12px 36px rgba(0,0,0,0.28)",
              }}
            />
            <Area type="monotone" dataKey={dataKey} stroke={stroke} fill="url(#trend-gradient)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
