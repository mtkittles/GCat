"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useAccount } from "@/lib/auth";
import { can } from "@/lib/entitlements";
import { flat, tracks, type Track } from "@/lib/course";
import { isPassed, progressKey, useProgress } from "@/lib/progress";

/*
  Certyfikat ukończenia ścieżki: wszystkie testy zaliczone (≥ 80 %), konto z planem Pro.
  Strona do druku (PDF z przeglądarki); numer certyfikatu wynika z konta i ścieżki.
*/
function certId(userId: string, track: string) {
  let h = 2166136261;
  for (const ch of `${userId}|${track}`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return `GC-${track === "frezowanie" ? "F" : "T"}-${h.toString(16).toUpperCase().padStart(8, "0")}`;
}

export default function Certificate({ track }: { track: Track }) {
  const T = tracks[track];
  const acc = useAccount();
  const prog = useProgress();
  const lessons = useMemo(() => flat(track).filter((l) => l.doc), [track]);
  const passed = lessons.filter((l) => isPassed(prog[progressKey(track, l.id)]));
  const complete = passed.length === lessons.length && lessons.length > 0;
  const pro = can(acc.profile?.plan ?? "free", "certificate");
  const name = acc.profile?.displayName || acc.user?.email || "";
  const ok = complete && pro && !!acc.user;
  const date = new Date().toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
  const avg = passed.length ? Math.round(passed.reduce((a, l) => { const q = prog[progressKey(track, l.id)]!.quiz!; return a + q.score / q.total; }, 0) / passed.length * 100) : 0;
  return (
    <div className="grid gap-5 max-w-3xl">
      <div className="cert-tools">
        <Link href="/konto" className="btn ghost">← Konto</Link>
        {ok && <button type="button" className="btn" onClick={() => window.print()}>Drukuj / zapisz PDF</button>}
      </div>
      {!ok && (
        <div className="note note-info">
          {!acc.user ? <>Certyfikat wymaga konta — <Link href="/konto" className="underline">zaloguj się</Link>.</>
            : !pro ? <>Certyfikat ścieżki jest w planie <Link href="/konto/pro" className="underline">Pro</Link>. Poniżej podgląd.</>
            : <>Do certyfikatu brakuje zaliczonych testów: {passed.length} z {lessons.length}. Test zalicza wynik od 80 %.</>}
        </div>
      )}
      <article className={`cert${ok ? "" : " is-preview"}`} aria-label="Certyfikat">
        <div className="cert-brand">GCat · ucz się · programuj · skrawaj</div>
        <h1>Certyfikat ukończenia</h1>
        <p className="cert-track">ścieżka <b>{T.title}</b> — {lessons.length} lekcji z testami</p>
        <p className="cert-name">{name || "Imię i nazwisko"}</p>
        <p className="cert-text">ukończył(a) wszystkie lekcje ścieżki i zaliczył(a) testy ze średnim wynikiem {ok ? avg : "—"} %. Zakres: {T.blurb.toLowerCase()}</p>
        <div className="cert-foot">
          <span>Data: {ok ? date : "—"}</span>
          <span>Nr: {acc.user ? certId(acc.user.id, track) : "GC-…"}</span>
          <span>Weryfikacja: gcat · /konto</span>
        </div>
        {!ok && <div className="cert-wm">PODGLĄD</div>}
      </article>
    </div>
  );
}
