"use client";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import PageBanner from "@/components/ui/PageBanner";
import { signInWithEmail, signInWithGoogle, signOut, useAccount } from "@/lib/auth";
import { PLAN_LABEL } from "@/lib/entitlements";
import { useDone } from "@/lib/exercisesDone";
import { exercises } from "@/lib/content";
import { flat, lessonHref, trackList } from "@/lib/course";
import { isFinished, isPassed, isRead, progressKey, useProgress, type ProgressStore } from "@/lib/progress";
import { loadPrograms } from "@/app/symulator/programs";
import { getSyncStatus, subscribeSync } from "@/lib/sync";

const fmtDate = (ms: number) => new Date(ms).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });

function useSync() { return useSyncExternalStore(subscribeSync, getSyncStatus, () => ({ status: "off" as const, error: null })); }

function trackStats(prog: ProgressStore, key: "frezowanie" | "toczenie") {
  const all = flat(key).filter((l) => l.doc);
  const P = (id: string) => prog[progressKey(key, id)];
  const passed = all.filter((l) => isPassed(P(l.id)));
  const read = all.filter((l) => isRead(P(l.id)));
  const visited = all.filter((l) => P(l.id)?.visited);
  const scores = all.map((l) => P(l.id)?.quiz).filter((q): q is { score: number; total: number; at: number } => !!q && q.total > 0);
  const avg = scores.length ? Math.round((scores.reduce((a, q) => a + q.score / q.total, 0) / scores.length) * 100) : null;
  const next = all.find((l) => !isFinished(P(l.id)));
  const last = all.filter((l) => P(l.id)?.visited).sort((a, b) => (P(b.id)!.visited! - P(a.id)!.visited!))[0];
  return { total: all.length, passed: passed.length, read: read.length, visited: visited.length, avg, next, last, lastAt: last ? P(last.id)!.visited! : null };
}

function Stats() {
  const prog = useProgress();
  const done = useDone();
  const programs = useSyncExternalStore(() => () => {}, () => loadPrograms().length, () => 0);
  const tracks = trackList.map((t) => ({ t, s: trackStats(prog, t.key) }));
  const lastAt = Math.max(0, ...tracks.map(({ s }) => s.lastAt ?? 0));
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ exported: new Date().toISOString(), progress: prog, exercises: done, programs: loadPrograms() }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `gcat-postep-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(a.href);
  };
  return (
    <section className="grid gap-4" aria-labelledby="stats-h">
      <h2 id="stats-h" className="text-xl font-bold">Statystyki nauki</h2>
      <div className="stat-grid acct-stats">
        <div><span>Zaliczone testem</span><b>{tracks.reduce((a, { s }) => a + s.passed, 0)} / {tracks.reduce((a, { s }) => a + s.total, 0)}</b></div>
        <div><span>Przeczytane</span><b>{tracks.reduce((a, { s }) => a + s.read, 0)}</b></div>
        <div><span>Zadania</span><b>{done.length} / {exercises.length}</b></div>
        <div><span>Programy w symulatorze</span><b>{programs}</b></div>
        <div><span>Ostatnia aktywność</span><b>{lastAt ? fmtDate(lastAt) : "—"}</b></div>
        <div><span>Średni wynik testów</span><b>{(() => { const v = tracks.map(({ s }) => s.avg).filter((x): x is number => x !== null); return v.length ? `${Math.round(v.reduce((a, b) => a + b, 0) / v.length)} %` : "—"; })()}</b></div>
      </div>
      <div className="acct-tracks">
        {tracks.map(({ t, s }) => (
          <div key={t.key} className="acct-track">
            <div className="acct-track-h"><b>{t.title}</b><span>{s.passed} z {s.total} zaliczonych{s.avg !== null ? ` · średnio ${s.avg} %` : ""}</span></div>
            <div className="tp-bar"><i style={{ width: `${s.total ? Math.round(((s.passed + s.read * 0.5) / s.total) * 100) : 0}%` }} /></div>
            {s.next ? <Link href={lessonHref(t.key, s.next.slug!)} className="acct-next">Następna: {s.next.id} {s.next.title} →</Link> : <span className="acct-next">Ścieżka ukończona.</span>}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn ghost" onClick={exportData}>Pobierz dane (JSON)</button>
        <Link href="/konto/pro" className="btn ghost">Co daje Pro?</Link>
      </div>
    </section>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(null);
    const r = await signInWithEmail(email.trim()); setBusy(false);
    if (r) setErr(r); else setSent(true);
  };
  return (
    <section className="acct-card" aria-labelledby="login-h">
      <h2 id="login-h" className="text-xl font-bold">Zaloguj się</h2>
      <p className="text-muted">Bez hasła: podaj e‑mail, wyślemy link do logowania. Postęp z tej przeglądarki zostanie połączony z kontem.</p>
      {sent ? <p className="note note-tip">Sprawdź pocztę — link logowania wysłany na {email}.</p> : (
        <form onSubmit={submit} className="acct-form">
          <label><span>E‑mail</span><input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ty@przyklad.pl" /></label>
          <button className="btn" type="submit" disabled={busy}>{busy ? "Wysyłanie…" : "Wyślij link"}</button>
        </form>
      )}
      <button type="button" className="btn ghost" onClick={async () => { const r = await signInWithGoogle(); if (r) setErr(r); }}>Zaloguj przez Google</button>
      {err && <p className="note note-warn">{err}</p>}
    </section>
  );
}

function Session() {
  const { user, profile } = useAccount();
  const sync = useSync();
  if (!user) return null;
  const plan = profile?.plan ?? "free";
  return (
    <section className="acct-card" aria-labelledby="sess-h">
      <div className="acct-head">
        <div>
          <h2 id="sess-h" className="text-xl font-bold">{profile?.displayName || user.email || "Konto"}</h2>
          <p className="text-muted">{user.email}</p>
        </div>
        <span className={`chip ${plan === "pro" ? "chip-accent" : ""}`}>{PLAN_LABEL[plan]}</span>
      </div>
      <p className="acct-sync" data-status={sync.status}>
        {sync.status === "syncing" ? "Synchronizacja…" : sync.status === "ok" ? "Postęp zapisany na koncie." : sync.status === "error" ? `Synchronizacja nie powiodła się: ${sync.error}` : "Synchronizacja wyłączona."}
      </p>
      <div className="flex flex-wrap gap-2">
        <Link href="/konto/pro" className="btn ghost">Plan {PLAN_LABEL[plan]} — szczegóły</Link>
        <button type="button" className="btn plain" onClick={() => signOut()}>Wyloguj</button>
      </div>
    </section>
  );
}

export default function Account() {
  const acc = useAccount();
  return (
    <div className="grid gap-6 max-w-4xl">
      <PageBanner src="/img/banner-tasks.jpg" kicker="Twoje konto" title="Konto"
        subtitle="Postęp nauki, statystyki i zapisane programy." size="compact" priority />
      {!acc.enabled && (
        <section className="acct-card">
          <h2 className="text-xl font-bold">Konto wkrótce</h2>
          <p className="text-muted">Logowanie nie jest jeszcze włączone na tej stronie. Postęp nauki zapisuje się w tej przeglądarce — poniżej statystyki z tego urządzenia; możesz je pobrać jako plik.</p>
        </section>
      )}
      {acc.enabled && !acc.ready && <p className="text-muted">Sprawdzanie sesji…</p>}
      {acc.enabled && acc.ready && (acc.user ? <Session /> : <Login />)}
      {acc.error && <p className="note note-warn">{acc.error}</p>}
      <Stats />
    </div>
  );
}
