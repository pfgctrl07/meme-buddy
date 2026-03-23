"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, setToken } from "../lib/api";

export function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "Priyan Nova",
    email: "demo@memebuddy.ai",
    password: "Demo@12345",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const path = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = await apiFetch(path, {
        method: "POST",
        body: JSON.stringify(form),
      });

      setToken(payload.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass panel-hover w-full max-w-md rounded-[2rem] p-8 shadow-glow md:p-9">
      <p className="text-xs uppercase tracking-[0.34em] text-muted">Meme Buddy</p>
      <h1 className="section-title mt-4 text-3xl font-semibold text-white md:text-4xl">Trend intelligence for meme velocity.</h1>
      <p className="mt-3 text-sm leading-7 text-muted">
        Sign in to launch events, simulate engagement, benchmark prediction accuracy, and climb the leaderboard.
      </p>

      <div className="mt-6 flex rounded-2xl bg-white/5 p-1">
        {["login", "register"].map((item) => (
          <button
            key={item}
            className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium ${mode === item ? "bg-brand text-white" : "text-muted"}`}
            onClick={() => setMode(item)}
          >
            {item === "login" ? "Login" : "Create account"}
          </button>
        ))}
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {mode === "register" ? (
          <Field label="Name" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
        ) : null}
        <Field label="Email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(value) => setForm((current) => ({ ...current, password: value }))}
        />

        {error ? <p className="rounded-2xl border border-red/40 bg-red/10 px-4 py-3 text-sm text-red">{error}</p> : null}

        <button className="w-full rounded-2xl bg-gradient-to-r from-brand to-brand2 px-4 py-4 font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-70" disabled={loading}>
          {loading ? "Working..." : mode === "login" ? "Enter Dashboard" : "Create Account"}
        </button>
      </form>

      <p className="mt-4 text-xs text-muted">Demo credentials are prefilled so the app is runnable out of the box.</p>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">{label}</span>
      <input
        className="w-full rounded-2xl border border-line bg-white/5 px-4 py-3 text-white outline-none transition focus:border-brand/60"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
