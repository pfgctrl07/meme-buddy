"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Compass, Gauge, LogOut, Medal, PlusSquare, Sparkles, Trophy, UserCircle2 } from "lucide-react";
import { setToken } from "../lib/api";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/events", label: "Create / Join", icon: PlusSquare },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: UserCircle2 },
];

export function AppShell({ title, eyebrow, children, action }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-5 lg:px-6 xl:gap-7">
        <aside className="glass panel-hover hidden w-72 shrink-0 rounded-4xl p-5 shadow-glow lg:flex lg:flex-col">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 rounded-3xl bg-white/5 px-3 py-2 fade-slide">
              <div className="rounded-2xl bg-gradient-to-br from-brand to-brand2 p-2">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">Meme Buddy</p>
                <p className="text-sm font-semibold text-white">Trend Intelligence</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 ${
                    active ? "bg-gradient-to-r from-brand/25 to-brand2/15 text-white" : "text-muted hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-3xl border border-line bg-white/5 p-4 fade-slide stagger-2">
            <p className="text-xs uppercase tracking-[0.26em] text-muted">Prototype status</p>
            <p className="mt-3 text-sm leading-6 text-white">Backed by MongoDB, JWT auth, simulation engine, analytics, and live leaderboard flow.</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <header className="glass page-enter flex flex-col gap-4 rounded-4xl px-5 py-5 shadow-glow sm:flex-row sm:items-center sm:justify-between md:px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-muted">{eyebrow}</p>
              <h1 className="section-title mt-2 text-[1.9rem] font-semibold text-white md:text-[2.1rem]">{title}</h1>
            </div>

            <div className="flex items-center gap-3">
              {action}
              <button className="rounded-2xl border border-line bg-white/5 p-3 text-muted transition hover:-translate-y-0.5 hover:text-white">
                <Bell className="h-4 w-4" />
              </button>
              <button
                className="rounded-2xl border border-line bg-white/5 p-3 text-muted transition hover:-translate-y-0.5 hover:text-white"
                onClick={() => {
                  setToken("");
                  window.location.href = "/login";
                }}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide lg:hidden fade-slide">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`glass whitespace-nowrap rounded-2xl px-4 py-3 text-sm transition-all duration-200 ${
                    active ? "border-brand/40 text-white" : "text-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <main className="card-grid page-enter">{children}</main>
        </div>
      </div>
    </div>
  );
}
