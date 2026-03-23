"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, DoorOpen, PlusSquare, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { AppShell } from "../../components/AppShell";
import { apiFetch } from "../../lib/api";
import { useProtectedPage } from "../../lib/useProtectedPage";

const initialCreateForm = { name: "", asset: "", description: "" };

export default function EventsPage() {
  useProtectedPage();
  const router = useRouter();
  const [tab, setTab] = useState("create");
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [code, setCode] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const payload = await apiFetch("/events");
      setEvents(payload.items || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = await apiFetch("/events", {
        method: "POST",
        body: JSON.stringify(createForm),
      });
      setMessage(`Trend launched. Invite code: ${payload.event.inviteCode}`);
      setCreateForm(initialCreateForm);
      await loadEvents();
      router.push(`/events/${payload.event._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = await apiFetch("/events/join", {
        method: "POST",
        body: JSON.stringify({ inviteCode: code.toUpperCase() }),
      });
      setMessage(payload.message);
      setCode("");
      await loadEvents();
      router.push(`/events/${payload.event._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Event Studio" eyebrow="Launch and enter rooms">
      <section className="grid gap-4 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="glass rounded-4xl p-6 md:p-8 shadow-glow">
          <p className="text-xs uppercase tracking-[0.34em] text-muted">Trend simulation</p>
          <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">Create meme events and route operators into live rooms.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
            Launch a hashtag or meme coin simulation, generate an invite code instantly, and let participants join the event from a single control surface.
          </p>

          <div className="mt-8 flex rounded-3xl bg-white/5 p-1">
            {[
              { key: "create", label: "Create Trend", icon: PlusSquare },
              { key: "join", label: "Join Trend", icon: DoorOpen },
            ].map((item) => {
              const Icon = item.icon;
              const active = tab === item.key;
              return (
                <button
                  key={item.key}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-3xl px-4 py-3 font-medium ${
                    active ? "bg-gradient-to-r from-brand to-brand2 text-white" : "text-muted"
                  }`}
                  onClick={() => setTab(item.key)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {tab === "create" ? (
            <form className="mt-6 space-y-4" onSubmit={handleCreate}>
              <Field
                label="Event name"
                placeholder="Pepe World Cup Finals"
                value={createForm.name}
                onChange={(value) => setCreateForm((current) => ({ ...current, name: value }))}
              />
              <Field
                label="Hashtag / coin"
                placeholder="#PEPECUP or $PEPE"
                value={createForm.asset}
                onChange={(value) => setCreateForm((current) => ({ ...current, asset: value }))}
              />
              <Field
                label="Description"
                placeholder="Describe the narrative, the operator strategy, and what kind of momentum you expect."
                value={createForm.description}
                onChange={(value) => setCreateForm((current) => ({ ...current, description: value }))}
                textarea
              />
              <button
                className="w-full rounded-2xl bg-gradient-to-r from-brand to-brand2 px-4 py-4 font-semibold text-white disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Launching..." : "Launch Trend Simulation"}
              </button>
            </form>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleJoin}>
              <Field label="Invite code" placeholder="Enter event code" value={code} onChange={setCode} />
              <button
                className="w-full rounded-2xl bg-gradient-to-r from-brand to-brand2 px-4 py-4 font-semibold text-white disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Joining..." : "Join Event Room"}
              </button>
            </form>
          )}

          {error ? <p className="mt-4 rounded-2xl border border-red/30 bg-red/10 px-4 py-3 text-sm text-red">{error}</p> : null}
          {message ? <p className="mt-4 rounded-2xl border border-green/30 bg-green/10 px-4 py-3 text-sm text-green">{message}</p> : null}
        </div>

        <div className="glass rounded-4xl p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Live rooms</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Stored trend events</h3>
            </div>
            <button className="rounded-2xl border border-line bg-white/5 px-4 py-3 text-sm text-white" onClick={loadEvents}>
              Refresh
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {events.map((item) => (
              <div key={item._id} className="rounded-[1.75rem] border border-line bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{item.name}</p>
                    <p className="mt-1 text-sm text-brand2">{item.asset}</p>
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-muted">{item.prediction}</span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MiniMetric label="Code" value={item.inviteCode} />
                  <MiniMetric label="Trend" value={`${item.trendScore}/100`} />
                  <MiniMetric label="Mentions" value={item.engagement?.mentions?.toLocaleString?.() || item.engagement?.mentions || 0} />
                  <MiniMetric label="Participants" value={item.participantCount || 0} />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted">{item.analysis?.accuracy?.label || "Unverified"} benchmark</p>
                  <Link href={`/events/${item._id}`} className="inline-flex items-center gap-2 text-sm font-medium text-brand2">
                    Open room
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}

            {events.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-line bg-white/[0.03] p-6 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-brand2" />
                <p className="mt-4 text-base font-medium text-white">No events stored yet</p>
                <p className="mt-2 text-sm text-muted">Create the first trend to test the full backend-connected event flow.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function Field({ label, value, onChange, placeholder, textarea = false }) {
  const className =
    "w-full rounded-2xl border border-line bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-muted focus:border-brand/60";

  return (
    <label className="block">
      <span className="mb-2 block text-sm text-muted">{label}</span>
      {textarea ? (
        <textarea
          className={`${className} min-h-36 resize-none`}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input className={className} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-3xl border border-line bg-black/10 px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.24em] text-muted">{label}</p>
      <p className="mt-2 text-base font-semibold text-white">{value}</p>
    </div>
  );
}
