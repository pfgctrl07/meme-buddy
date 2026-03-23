"use client";

import { useEffect, useState } from "react";
import { AppShell } from "../../components/AppShell";
import { TrendEventCard } from "../../components/TrendEventCard";
import { apiFetch } from "../../lib/api";
import { useProtectedPage } from "../../lib/useProtectedPage";

const filters = ["top-gaining", "most-active", "high-trust"];

export default function DiscoverPage() {
  useProtectedPage();
  const [filter, setFilter] = useState(filters[0]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    apiFetch(`/discover?filter=${filter}`).then((payload) => setItems(payload.items)).catch(() => {});
  }, [filter]);

  return (
    <AppShell title="Live discovery feed" eyebrow="Trending meme coin signals">
      <div className="glass panel-hover rounded-4xl p-6 md:p-7">
        <div className="flex flex-wrap gap-3">
          {filters.map((item) => (
            <button
              key={item}
              className={`rounded-full px-4 py-2 text-sm capitalize transition-all duration-200 ${
                filter === item ? "bg-brand text-white" : "bg-white/5 text-muted hover:text-white"
              }`}
              onClick={() => setFilter(item)}
            >
              {item.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <TrendEventCard key={item._id} event={item} />
        ))}
      </section>
    </AppShell>
  );
}
