"use client";
import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";
import StatusLed from "@/components/tactile/StatusLed";
import { fmtClock, type RunMode } from "./transport";

/*
  Kapsuła statusu (Etap 11): gdy podgląd symulatora wyjedzie poza ekran (przewinięcie strony,
  zakładka „Kod” na telefonie), a program jest w toku — przy dole ekranu zostaje linia N,
  czas programu i narzędzie, z przyciskiem start/pauza. Klik w kapsułę wraca do podglądu.
  Na stronie może być kilka symulatorów — kapsułę pokazuje tylko ostatnio uruchomiony.
*/

let owner: string | null = null;
const subs = new Set<() => void>();
export function claimCapsule(id: string) {
  if (owner === id) return;
  owner = id;
  subs.forEach((f) => f());
}
function releaseCapsule(id: string) {
  if (owner !== id) return;
  owner = null;
  subs.forEach((f) => f());
}
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
const getOwner = () => owner;
const getServerOwner = () => null;

export default function StatusCapsule({ id, target, active, playing, held, block, elapsed, total, tool, mode, feed, onToggle, onBack }: {
  id: string;
  /** element, którego widoczność decyduje o kapsule (podgląd symulatora) */
  target: RefObject<HTMLElement | null>;
  /** program w toku (odtwarzanie albo zatrzymanie w środku programu) */
  active: boolean;
  playing: boolean;
  /** FEED HOLD / stop po bloku — w środku programu, bez ruchu */
  held: boolean;
  block: string;
  elapsed: number;
  total: number;
  tool: string;
  mode: RunMode;
  feed: number;
  onToggle: () => void;
  /** przed przewinięciem do podglądu (np. przełączenie zakładki na telefonie) */
  onBack?: () => void;
}) {
  const current = useSyncExternalStore(subscribe, getOwner, getServerOwner);
  const [away, setAway] = useState(false);

  useEffect(() => {
    const el = target.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setAway(!e.isIntersecting), { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  useEffect(() => () => releaseCapsule(id), [id]);

  if (!away || !active || current !== id) return null;

  const back = () => {
    onBack?.();
    requestAnimationFrame(() => target.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" }));
  };
  const tags = [mode !== "auto" ? (mode === "single" ? "SBK" : "DRY") : null, feed !== 100 ? `F ${feed}%` : null].filter(Boolean);
  return (
    <div className="sim-capsule" role="status" aria-live="off">
      <button type="button" className="sc-back" onClick={back} title="Wróć do podglądu symulatora">
        <StatusLed state={playing ? "ready" : held ? "warning" : "idle"} pulse={playing} size={7} />
        <b className="sc-n">{block}</b>
        <span className="sc-time"><span className="dro-n">{fmtClock(elapsed)}</span><i>/</i><span className="dro-n">{fmtClock(total)}</span></span>
        <span className="sc-tool">{tool}</span>
        {tags.length > 0 && <span className="sc-tags">{tags.join(" · ")}</span>}
      </button>
      <button type="button" className={`sc-play${playing ? " is-hold" : ""}`} onClick={onToggle} aria-label={playing ? "Wstrzymaj posuw (FEED HOLD)" : "Start cyklu (CYCLE START)"}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          {playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M7 4l13 8-13 8z" />}
        </svg>
      </button>
    </div>
  );
}
