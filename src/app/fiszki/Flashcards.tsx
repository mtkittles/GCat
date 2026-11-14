"use client";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { rich } from "@/components/Rich";
import { useAccount } from "@/lib/auth";
import { can } from "@/lib/entitlements";
import { DECKS, FLASHCARDS, FREE_LIMIT, freeCards, type DeckId, type Flashcard } from "@/lib/flashcards";
import { BOX_DAYS, buildSession, deckStats, requeue, review, shuffle, type Deck } from "@/lib/leitner";

/*
  Fiszki: pytanie z przodu, odpowiedź z tyłu, powtórki w pięciu pudełkach (Leitner). Stan w przeglądarce.
  Free: 15 pierwszych haseł słownika. Pro: słownik, wzory i kody w obie strony.
*/
const KEY = "gcat:fiszki";

// stan talii: moduł z subskrypcją, żeby pierwszy render po stronie klienta zgadzał się z HTML z serwera
const EMPTY: Deck = {};
let mem: Deck = EMPTY; let loaded = false;
const subs = new Set<() => void>();
const load = (): Deck => { if (loaded) return mem; loaded = true; try { const v = JSON.parse(localStorage.getItem(KEY) || "{}"); mem = v && typeof v === "object" ? v : {}; } catch { mem = {}; } return mem; };
const save = (d: Deck) => { mem = d; try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} subs.forEach((s) => s()); };
const useDeck = () => useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb); }; }, load, () => EMPTY);

type Scope = "all" | DeckId;
const SIZES = [10, 20, 0] as const; // 0 = wszystkie zaległe i nowe
const BOX_LABEL = ["nowe", "1 dzień", "3 dni", "7 dni", "14 dni", "30 dni"];

/** „1 karta”, „204 karty”, „15 kart”. */
const karty = (n: number) => `${n} ${n === 1 ? "karta" : n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14) ? "karty" : "kart"}`;

interface Run { queue: string[]; total: number; flipped: boolean; known: number; missed: Set<string>; practice: boolean }

function Face({ c, back }: { c: Flashcard; back: boolean }) {
  if (!back) return <span className={`fc-front${c.frontMono ? " is-mono" : ""}`}>{c.front}</span>;
  return (
    <span className="fc-back">
      {c.title && <span className={`fc-title${c.titleMono ? " is-mono" : ""}`}>{c.title}</span>}
      {c.lines?.map((l) => <span key={l} className="fc-line">{l}</span>)}
      {c.back && <span className="fc-text">{rich(c.back)}</span>}
      {c.note && <span className="fc-note"><b>Przykład.</b> {c.note}</span>}
    </span>
  );
}

export default function Flashcards() {
  const acc = useAccount();
  const pro = can(acc.profile?.plan ?? "free", "flashcards");
  const [scope, setScope] = useState<Scope>("all");
  const [size, setSize] = useState<(typeof SIZES)[number]>(10);
  const [run, setRun] = useState<Run | null>(null);
  const deck = useDeck();

  const cards = useMemo(() => {
    const base = pro ? FLASHCARDS : freeCards();
    return scope === "all" ? base : base.filter((c) => c.deck === scope);
  }, [pro, scope]);
  const ids = useMemo(() => cards.map((c) => c.id), [cards]);
  const byId = useMemo(() => new Map(FLASHCARDS.map((c) => [c.id, c])), []);
  const stats = useMemo(() => deckStats(deck, ids), [deck, ids]);
  const waiting = stats.due + stats.boxes[0];

  const begin = (practice: boolean) => {
    const queue = practice ? shuffle(ids).slice(0, size || ids.length) : buildSession(deck, ids, { size: size || undefined });
    setRun({ queue, total: queue.length, flipped: false, known: 0, missed: new Set(), practice });
  };
  const flip = () => setRun((r) => (r && r.queue.length ? { ...r, flipped: !r.flipped } : r));
  const answer = (known: boolean) => {
    if (!run?.queue.length || !run.flipped) return;
    const id = run.queue[0];
    if (!run.practice) save(review(deck, id, known));
    const missed = known ? run.missed : new Set(run.missed).add(id);
    setRun({ ...run, queue: known ? run.queue.slice(1) : requeue(run.queue), flipped: false, known: run.known + (known ? 1 : 0), missed });
    // przyciski oceny znikają razem z odpowiedzią — fokus wraca na kartę, żeby klawiatura działała dalej
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>("[data-fc='flip']")?.focus({ preventScroll: true }));
  };

  // klawiatura w trakcie tury: spacja odwraca, 1 / ← „nie wiem”, 2 / → „wiem”
  const active = !!run?.queue.length;
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, select, textarea")) return;
      if (e.key === " " || e.key === "Enter") {
        if (t?.closest("a, button")) return; // przycisk i link obsługują spację i Enter same
        e.preventDefault(); document.querySelector<HTMLButtonElement>("[data-fc='flip']")?.click();
      }
      else if (e.key === "1" || e.key === "ArrowLeft") document.querySelector<HTMLButtonElement>("[data-fc='no']")?.click();
      else if (e.key === "2" || e.key === "ArrowRight") document.querySelector<HTMLButtonElement>("[data-fc='yes']")?.click();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const cur = run?.queue.length ? byId.get(run.queue[0]) : undefined;
  const scopes: [Scope, string][] = [["all", "Wszystko"], ...(Object.entries(DECKS) as [DeckId, string][])];
  const countOf = (s: Scope) => (pro ? FLASHCARDS : freeCards()).filter((c) => s === "all" || c.deck === s).length;

  return (
    <div className="fc-page">
      <header className="fc-head">
        <h1>Fiszki</h1>
        <p>Pytanie z przodu, odpowiedź z tyłu. Co umiesz, wraca rzadziej.</p>
      </header>

      {!run ? (
        <>
          {!pro && (
            <div className="note note-info">W wersji Free jest {FREE_LIMIT} fiszek ze słownika. Pełna talia ({karty(FLASHCARDS.length)}: słownik, wzory i kody pytane w obie strony) jest w planie <Link href="/konto/pro" className="underline">Pro</Link>.</div>
          )}
          <section className="fc-setup" aria-label="Ustawienia powtórki">
            <div className="fc-row">
              <span className="fc-label" id="fc-scope">Talia</span>
              <div className="fc-opts" role="group" aria-labelledby="fc-scope">
                {scopes.map(([s, l]) => {
                  const n = countOf(s);
                  return <button key={s} type="button" aria-pressed={scope === s} disabled={!n} onClick={() => setScope(s)}>{l}<small>{n ? n : "Pro"}</small></button>;
                })}
              </div>
            </div>
            <div className="fc-row">
              <span className="fc-label" id="fc-size">Kart w turze</span>
              <div className="fc-opts" role="group" aria-labelledby="fc-size">
                {SIZES.map((n) => <button key={n} type="button" aria-pressed={size === n} onClick={() => setSize(n)}>{n || "Wszystkie"}</button>)}
              </div>
            </div>
            <div className="fc-go">
              <button type="button" className="btn" disabled={!waiting} onClick={() => begin(false)}>{waiting ? "Zacznij powtórkę" : "Na dziś wszystko powtórzone"}</button>
              <button type="button" className="btn ghost" onClick={() => begin(true)}>Losowe karty bez zapisu</button>
            </div>
            <p className="fc-sub">W powtórce najpierw idą karty zaległe, potem nowe — w losowej kolejności. „Losowe karty bez zapisu” to trening: nie przesuwa kart między pudełkami.</p>
          </section>

          <section className="fc-boxes" aria-label="Stan talii">
            <p className="fc-sum" aria-live="polite"><b>{stats.due}</b> zaległych · <b>{stats.boxes[0]}</b> nowych · <b>{stats.learned}</b> opanowanych · {stats.total} razem</p>
            <ol>
              {stats.boxes.map((n, i) => (
                <li key={i} className={n ? undefined : "is-empty"}>
                  <b>{n}</b>
                  <span>{i === 0 ? "nowe" : `pudełko ${i}`}</span>
                  <small>{i === 0 ? "jeszcze nie pytane" : `wraca po: ${BOX_LABEL[i]}`}</small>
                </li>
              ))}
            </ol>
          </section>
        </>
      ) : !cur ? (
        <section className="fc-done">
          <h2>{run.total ? "Tura skończona" : "Brak kart w tej talii"}</h2>
          {run.total > 0 && (
            <p>Kart: <b>{run.total}</b>. Od razu znanych: <b>{run.total - run.missed.size}</b>, do powtórzenia było: <b>{run.missed.size}</b>.{" "}
              {run.practice ? "To był trening — pudełka się nie zmieniły." : `Karty wrócą po swoim odstępie: od ${BOX_DAYS[1]} dnia (pudełko 1) do ${BOX_DAYS[5]} dni (pudełko 5).`}</p>
          )}
          {run.missed.size > 0 && (
            <ul className="fc-missed">
              {[...run.missed].map((id) => { const c = byId.get(id)!; return <li key={id}><Link href={c.href}>{c.front}</Link></li>; })}
            </ul>
          )}
          <div className="fc-go">
            <button type="button" className="btn" onClick={() => begin(true)}>Losowe karty bez zapisu</button>
            <button type="button" className="btn ghost" onClick={() => setRun(null)}>Wróć do talii</button>
          </div>
        </section>
      ) : (
        <section className="fc-stage" aria-label="Powtórka">
          <div className="fc-bar">
            <div className="fc-progress" role="progressbar" aria-label="Postęp tury" aria-valuemin={0} aria-valuemax={run.total} aria-valuenow={run.known}>
              <i style={{ width: `${(run.known / run.total) * 100}%` }} />
            </div>
            <span>{run.known} / {run.total}</span>
            <button type="button" className="link-btn" onClick={() => setRun(null)}>Zakończ</button>
          </div>

          <button type="button" data-fc="flip" className={`fc-card${run.flipped ? " is-back" : ""}`} onClick={flip}
            aria-label={run.flipped ? "Odpowiedź — kliknij, aby wrócić do pytania" : "Pytanie — kliknij, aby zobaczyć odpowiedź"}>
            <span className="fc-kind">{DECKS[cur.deck]}{run.practice ? " · trening" : deck[cur.id] ? ` · pudełko ${deck[cur.id].box}` : " · nowa"}</span>
            <span className="fc-face" key={`${cur.id}:${run.flipped}`}>
              <span className="fc-ask">{run.flipped ? cur.front : cur.ask}</span>
              <Face c={cur} back={run.flipped} />
            </span>
          </button>

          {run.flipped ? (
            <div className="fc-actions">
              <button type="button" data-fc="no" className="btn ghost" onClick={() => answer(false)}>Nie wiem <kbd>1</kbd></button>
              <button type="button" data-fc="yes" className="btn" onClick={() => answer(true)}>Wiem <kbd>2</kbd></button>
            </div>
          ) : (
            <div className="fc-actions"><button type="button" className="btn" onClick={flip}>Pokaż odpowiedź <kbd>spacja</kbd></button></div>
          )}
          <p className="fc-meta">{run.flipped ? <Link href={cur.href} className="underline">Otwórz w serwisie</Link> : "Najpierw odpowiedz w myślach, potem odwróć kartę."}</p>
        </section>
      )}
    </div>
  );
}
