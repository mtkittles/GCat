"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "motion/react";
import { Drawer } from "vaul";
import { ChevronDown, X } from "lucide-react";
import TactileSegmentedControl from "@/components/tactile/TactileSegmentedControl";
import StatusLed from "@/components/tactile/StatusLed";
import { useMedia } from "@/lib/ui/prefs";
import { rich } from "@/components/Rich";
import { useAccount } from "@/lib/auth";
import { can } from "@/lib/entitlements";
import { DECKS, FLASHCARDS, FREE_LIMIT, freeCards, type DeckId, type Flashcard } from "@/lib/flashcards";
import { BOX_DAYS, buildSession, deckStats, requeue, review, shuffle, type Deck } from "@/lib/leitner";

/*
  Fiszki: pytanie z przodu, odpowiedź z tyłu, powtórki w pięciu pudełkach (Leitner). Stan w przeglądarce.
  Free: 15 pierwszych haseł słownika. Pro: słownik, wzory i kody w obie strony.
  Karta od razu po wejściu (V6): tura startuje sama z zapisanej talii; talia, liczba kart i stan pudełek
  są w arkuszu „Ustawienia powtórki” (telefon — dół ekranu, komputer — z prawej).
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
const few = (n: number) => n % 10 >= 2 && n % 10 <= 4 && !(n % 100 >= 12 && n % 100 <= 14);
const karty = (n: number) => `${n} ${n === 1 ? "karta" : few(n) ? "karty" : "kart"}`;
/** „1 karta czeka”, „3 karty czekają”, „15 kart czeka”. */
const czeka = (n: number) => `${karty(n)} ${n !== 1 && few(n) ? "czekają" : "czeka"}`;
const noop = () => () => {};

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
  const [sheet, setSheet] = useState(false);
  const [restart, setRestart] = useState(0);
  const deck = useDeck();
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const wide = useMedia("(min-width: 768px)", true);
  const reduce = useReducedMotion();
  // telefon: odwróconą kartę przesuwa się w prawo (opanowane) albo w lewo (do powtórki)
  const touch = useMedia("(pointer: coarse)");
  const x = useMotionValue(0);
  const tilt = useTransform(x, [-220, 0, 220], [-7, 0, 7]);
  const yesO = useTransform(x, [20, 110], [0, 1]);
  const noO = useTransform(x, [-110, -20], [1, 0]);
  const dragged = useRef(0);

  const cards = useMemo(() => {
    const base = pro ? FLASHCARDS : freeCards();
    return scope === "all" ? base : base.filter((c) => c.deck === scope);
  }, [pro, scope]);
  const ids = useMemo(() => cards.map((c) => c.id), [cards]);
  const byId = useMemo(() => new Map(FLASHCARDS.map((c) => [c.id, c])), []);
  const stats = useMemo(() => deckStats(deck, ids), [deck, ids]);
  const waiting = stats.due + stats.boxes[0];

  // talia czytana prosto z localStorage (load), bo zaraz po hydratacji `deck` może być jeszcze pusty
  const makeRun = (practice: boolean): Run => {
    const queue = practice ? shuffle(ids).slice(0, size || ids.length) : buildSession(load(), ids, { size: size || undefined });
    return { queue, total: queue.length, flipped: false, known: 0, missed: new Set(), practice };
  };
  const begin = (practice: boolean) => { setRun(makeRun(practice)); setSheet(false); };

  // start tury od razu po wejściu i po zmianie talii / liczby kart w arkuszu; gdy dojdzie plan Pro
  // (konto wczytuje się później), tura zmienia się tylko, jeśli nie została jeszcze zaczęta
  const key = `${pro ? 1 : 0}|${scope}|${size}`;
  const [seen, setSeen] = useState<{ key: string; restart: number } | null>(null);
  if (hydrated && (!seen || seen.key !== key || seen.restart !== restart)) {
    const asked = !seen || seen.restart !== restart;
    const touched = !!run && (run.known > 0 || run.missed.size > 0 || run.flipped);
    setSeen({ key, restart });
    if (asked || !touched) {
      const st = deckStats(load(), ids);
      setRun(st.due + st.boxes[0] ? makeRun(false) : null);
    }
  }
  const pick = <T,>(set: (v: T) => void) => (v: T) => { set(v); setRestart((r) => r + 1); };
  const flip = (e?: { timeStamp: number }) => { if (e && e.timeStamp - dragged.current < 250) return; setRun((r) => (r && r.queue.length ? { ...r, flipped: !r.flipped } : r)); };
  const onSwipe = (e: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    dragged.current = e.timeStamp;
    if (info.offset.x > 90 || info.velocity.x > 600) answer(true);
    else if (info.offset.x < -90 || info.velocity.x < -600) answer(false);
  };
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
      if (t?.closest("input, select, textarea, [role='dialog']")) return;
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
  const scopeName = scopes.find(([v]) => v === scope)?.[1] ?? "Wszystko";
  const sizeName = size ? karty(size) : "wszystkie karty";

  return (
    <div className="fc-page">
      <header className="ph fc-ph">
        <div className="fc-title-row">
          <h1 className="ph-title">Fiszki <span className="ph-n">{karty((pro ? FLASHCARDS : freeCards()).length)}</span></h1>
          <button type="button" className="fc-pick" aria-haspopup="dialog" onClick={() => setSheet(true)}
            aria-label={`Ustawienia powtórki: ${scopeName}, ${sizeName}`}>
            <span>{scopeName} · {sizeName}</span><ChevronDown aria-hidden />
          </button>
        </div>
        <p className="ph-lead">Pytanie z przodu, odpowiedź z tyłu. To, co już umiesz, wraca rzadziej.</p>
      </header>

      {!hydrated ? (
        <section className="fc-stage" aria-busy="true" aria-label="Powtórka"><div className="fcx-card fc-wait" aria-hidden /></section>
      ) : !run ? (
        <section className="fc-done fc-idle" aria-live="polite">
          <h2>{waiting ? `${czeka(waiting)} na powtórkę` : "Na dziś wszystko powtórzone"}</h2>
          <p className="fc-sum"><b>{stats.due}</b> zaległych · <b>{stats.boxes[0]}</b> nowych · <b>{stats.learned}</b> opanowanych · {stats.total} razem</p>
          <div className="fc-go">
            {waiting > 0 && <button type="button" className="btn" onClick={() => begin(false)}>Zacznij powtórkę</button>}
            <button type="button" className={`btn${waiting ? " ghost" : ""}`} onClick={() => begin(true)}>Losowe karty bez zapisu</button>
          </div>
        </section>
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
            <button type="button" className="btn ghost" onClick={() => setRun(null)}>Stan talii</button>
          </div>
        </section>
      ) : (
        <section className="fc-stage" aria-label="Powtórka">
          <div className="fc-bar">
            <span className="fc-bar-t">Zrobione {run.known} z {run.total}</span>
            <span className="fc-bar-s">{run.practice ? "trening bez zapisu" : `${stats.boxes[0]} nowych · ${stats.due} zaległych`}</span>
            <button type="button" className="link-btn" onClick={() => setRun(null)}>Zakończ</button>
            <div className="fc-progress" role="progressbar" aria-label="Postęp tury" aria-valuemin={0} aria-valuemax={run.total} aria-valuenow={run.known}>
              <i style={{ width: `${(run.known / run.total) * 100}%` }} />
            </div>
          </div>
          <motion.div className="fcx-drag" style={{ x, rotate: tilt }}
            drag={touch && run.flipped ? "x" : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.7} dragSnapToOrigin onDragEnd={onSwipe}>
            {touch && run.flipped && (
              <>
                <motion.span className="fcx-swipe is-no" style={{ opacity: noO }} aria-hidden><StatusLed state="warning" pulse={false} />Do powtórki</motion.span>
                <motion.span className="fcx-swipe is-yes" style={{ opacity: yesO }} aria-hidden><StatusLed state="ready" pulse={false} />Opanowane</motion.span>
              </>
            )}
            <button type="button" data-fc="flip" className="fcx-card" onClick={flip} aria-pressed={run.flipped}
              aria-label={run.flipped ? "Odpowiedź — kliknij, aby wrócić do pytania" : "Pytanie — kliknij, aby zobaczyć odpowiedź"}>
              {/* obie strony karty w jednym miejscu siatki, obrót 3D wokół osi pionowej; nowa karta zaczyna od pytania bez animacji */}
              <motion.span key={cur.id} className="fcx-in" initial={false} animate={{ rotateY: run.flipped ? 180 : 0 }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 240, damping: 26 }}>
                <span className="fcx-face fcx-q" aria-hidden={run.flipped}>
                  <span className="fc-kind">{DECKS[cur.deck]}{run.practice ? " · trening" : deck[cur.id] ? ` · pudełko ${deck[cur.id].box}` : " · nowa"}</span>
                  <span className="fc-ask">{cur.ask}</span>
                  <Face c={cur} back={false} />
                </span>
                <span className="fcx-face fcx-a" aria-hidden={!run.flipped}>
                  <span className="fc-kind">{DECKS[cur.deck]} · odpowiedź</span>
                  <span className="fc-ask">{cur.front}</span>
                  <Face c={cur} back />
                </span>
              </motion.span>
            </button>
          </motion.div>

          {run.flipped ? (
            <div className="fc-actions">
              <button type="button" data-fc="no" className="btn ghost" onClick={() => answer(false)}><StatusLed state="warning" pulse={false} /> Do powtórki <kbd>1</kbd></button>
              <button type="button" data-fc="yes" className="btn" onClick={() => answer(true)}><StatusLed state="ready" pulse={false} /> Opanowane <kbd>2</kbd></button>
            </div>
          ) : (
            <div className="fc-actions"><button type="button" className="btn" onClick={flip}>Pokaż odpowiedź <kbd>spacja</kbd></button></div>
          )}
          <p className="fc-meta">{run.flipped
            ? <>{touch ? "Przesuń kartę w prawo — opanowane, w lewo — do powtórki. " : "Strzałki: ← do powtórki, → opanowane. "}<Link href={cur.href} className="underline">Otwórz w serwisie</Link></>
            : touch ? "Odpowiedz w myślach i dotknij karty, żeby ją odwrócić." : "Odpowiedz w myślach i odwróć kartę: klik albo spacja."}</p>
        </section>
      )}

      {!pro && <p className="fc-pro">Wersja Free: {karty(FREE_LIMIT)} ze słownika. Wzory i kody w obie strony — w planie <Link href="/konto/pro" className="underline">Pro</Link>.</p>}

      <Drawer.Root open={sheet} onOpenChange={setSheet} direction={wide ? "right" : "bottom"}>
        <Drawer.Portal>
          <Drawer.Overlay className="vd-overlay" />
          <Drawer.Content className={`vd ${wide ? "vd-right" : "vd-bottom"} fc-sheet`} aria-describedby={undefined}>
            {!wide && <div className="vd-handle" aria-hidden />}
            <div className="fc-sheet-head">
              <Drawer.Title className="fc-sheet-t">Ustawienia powtórki</Drawer.Title>
              <Drawer.Close className="cd-x" aria-label="Zamknij"><X aria-hidden /></Drawer.Close>
            </div>
            <div className="fc-sheet-body" data-vaul-no-drag="">
              <div className="fc-row">
                <span className="fc-label">Talia</span>
                <TactileSegmentedControl<Scope> label="Talia" size="sm" value={scope} onChange={pick(setScope)} className="fc-tsc"
                  options={scopes.map(([s, l]) => { const n = countOf(s); return { value: s, label: <>{l} <small className="tl-n">{n ? n : "Pro"}</small></>, disabled: !n }; })} />
              </div>
              <div className="fc-row">
                <span className="fc-label">Kart w turze</span>
                <TactileSegmentedControl<string> label="Kart w turze" size="sm" value={String(size)} onChange={pick((v: string) => setSize(Number(v) as (typeof SIZES)[number]))} className="fc-tsc"
                  options={SIZES.map((n) => ({ value: String(n), label: n ? String(n) : "Wszystkie", led: false }))} />
              </div>
              <p className="fc-sub">Zmiana talii albo liczby kart zaczyna nową turę. W powtórce najpierw idą karty zaległe, potem nowe — w losowej kolejności. „Losowe karty bez zapisu” to trening: nie przesuwa kart między pudełkami.</p>
              <div className="fc-go">
                <button type="button" className="btn" disabled={!waiting} onClick={() => begin(false)}>{waiting ? "Zacznij powtórkę od nowa" : "Na dziś wszystko powtórzone"}</button>
                <button type="button" className="btn ghost" onClick={() => begin(true)}>Losowe karty bez zapisu</button>
              </div>
              <section className="fc-boxes" aria-label="Stan talii">
                <p className="fc-sum" aria-live="polite"><b>{stats.due}</b> zaległych · <b>{stats.boxes[0]}</b> nowych · <b>{stats.learned}</b> opanowanych · {stats.total} razem</p>
                <ol>
                  {stats.boxes.map((n, i) => (
                    <li key={i} className={n ? undefined : "is-empty"}>
                      <b>{n}</b>
                      <span><StatusLed state={!n ? "idle" : i === 0 ? "warning" : i >= stats.boxes.length - 1 ? "ready" : "on"} pulse={false} />{i === 0 ? "nowe" : `pudełko ${i}`}</span>
                      <small>{i === 0 ? "jeszcze nie pytane" : `wraca po: ${BOX_LABEL[i]}`}</small>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
