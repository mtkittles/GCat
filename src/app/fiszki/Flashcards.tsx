"use client";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import PageBanner from "@/components/ui/PageBanner";
import { rich } from "@/components/Rich";
import { glossary } from "@/lib/content";
import { gcodes } from "@/lib/gcodes";
import { useAccount } from "@/lib/auth";
import { can } from "@/lib/entitlements";
import { deckStats, dueCards, review, type Deck } from "@/lib/leitner";

/*
  Fiszki: przód — hasło albo kod, tył — definicja albo działanie. Stan powtórek w przeglądarce.
  Free: 15 pierwszych haseł słownika (demo). Pro: słownik i wszystkie karty kodów.
*/
const KEY = "gcat:fiszki";
const FREE_LIMIT = 15;

type Card = { id: string; front: string; back: string; href: string; kind: "pojęcie" | "kod" };
const ALL: Card[] = [
  ...glossary.map((g) => ({ id: `t:${g.term}`, front: g.term, back: g.def, href: `/slownik#${g.anchor}`, kind: "pojęcie" as const })),
  ...gcodes.map((g) => ({ id: `g:${g.slug}`, front: `${g.code} — ${g.name}`, back: g.short, href: `/kody/${g.slug}`, kind: "kod" as const })),
];

// stan talii: moduł z subskrypcją, żeby pierwszy render po stronie klienta zgadzał się z HTML z serwera
const EMPTY: Deck = {};
let mem: Deck = EMPTY; let loaded = false;
const subs = new Set<() => void>();
const load = (): Deck => { if (loaded) return mem; loaded = true; try { const v = JSON.parse(localStorage.getItem(KEY) || "{}"); mem = v && typeof v === "object" ? v : {}; } catch { mem = {}; } return mem; };
const save = (d: Deck) => { mem = d; try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} subs.forEach((s) => s()); };
const useDeck = () => useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb); }; }, load, () => EMPTY);

export default function Flashcards() {
  const acc = useAccount();
  const pro = can(acc.profile?.plan ?? "free", "flashcards");
  const [scope, setScope] = useState<"all" | "pojęcie" | "kod">("all");
  const cards = useMemo(() => {
    const base = pro ? ALL : ALL.filter((c) => c.kind === "pojęcie").slice(0, FREE_LIMIT);
    return scope === "all" ? base : base.filter((c) => c.kind === scope);
  }, [pro, scope]);
  const deck = useDeck();
  const ready = true;
  const [queue, setQueue] = useState<string[] | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);
  const stats = useMemo(() => deckStats(deck, cards.map((c) => c.id)), [deck, cards]);

  const start = () => { setQueue(dueCards(deck, cards.map((c) => c.id))); setFlipped(false); setDone(0); };
  const answer = (known: boolean) => {
    if (!queue?.length) return;
    const id = queue[0];
    const next = review(deck, id, known);
    save(next);
    setQueue(known ? queue.slice(1) : [...queue.slice(1), id]);
    setFlipped(false); setDone((d) => d + (known ? 1 : 0));
  };
  const cur = queue?.length ? byId.get(queue[0]) : undefined;

  return (
    <div className="grid gap-6 max-w-3xl">
      <PageBanner src="/img/banner-tasks.jpg" kicker="Powtórki" title="Fiszki" subtitle="Kody G i M oraz hasła słownika — pytanie z przodu, odpowiedź z tyłu. Co umiesz, wraca rzadziej." size="compact" priority />
      {!pro && (
        <div className="note note-info">W wersji Free dostępnych jest {FREE_LIMIT} fiszek ze słownika. Pełny zestaw ({ALL.length} kart: słownik i wszystkie kody) jest w planie <Link href="/konto/pro" className="underline">Pro</Link>.</div>
      )}
      <div className="fc-top">
        <div className="filters" role="group" aria-label="Zakres">
          <button aria-pressed={scope === "all"} onClick={() => { setScope("all"); setQueue(null); }}>Wszystko</button>
          <button aria-pressed={scope === "pojęcie"} onClick={() => { setScope("pojęcie"); setQueue(null); }}>Słownik</button>
          <button aria-pressed={scope === "kod"} onClick={() => { setScope("kod"); setQueue(null); }} disabled={!pro}>Kody{!pro ? " (Pro)" : ""}</button>
        </div>
        <div className="fc-stats" aria-live="polite">
          <span><b>{stats.due + stats.boxes[0]}</b> do powtórki</span>
          <span><b>{stats.learned}</b> opanowane</span>
          <span><b>{stats.total}</b> razem</span>
        </div>
      </div>
      {!ready ? <p className="text-muted">Wczytywanie…</p> : !queue ? (
        <button type="button" className="btn w-fit" onClick={start}>Zacznij powtórkę</button>
      ) : !cur ? (
        <div className="acct-card">
          <h2 className="text-xl font-bold">Na dziś koniec</h2>
          <p className="text-muted">Zaliczone w tej sesji: {done}. Karty wrócą, gdy minie ich odstęp — od jednego dnia (pudełko 1) do miesiąca (pudełko 5).</p>
          <button type="button" className="btn ghost w-fit" onClick={() => setQueue(null)}>Wróć</button>
        </div>
      ) : (
        <div className="fc">
          <button type="button" className={`fc-card${flipped ? " is-back" : ""}`} onClick={() => setFlipped((f) => !f)} aria-label={flipped ? "Odpowiedź" : "Pytanie — tapnij, aby odwrócić"}>
            <span className="fc-kind">{cur.kind}{deck[cur.id] ? ` · pudełko ${deck[cur.id].box}` : " · nowa"}</span>
            {!flipped ? <span className="fc-front">{cur.front}</span> : <span className="fc-back">{rich(cur.back)}</span>}
            <span className="fc-hint">{flipped ? "Oceń, czy to wiedziałeś" : "Tapnij, aby zobaczyć odpowiedź"}</span>
          </button>
          {flipped ? (
            <div className="fc-actions">
              <button type="button" className="btn ghost" onClick={() => answer(false)}>Nie wiem</button>
              <button type="button" className="btn" onClick={() => answer(true)}>Wiem</button>
            </div>
          ) : <div className="fc-actions"><button type="button" className="btn ghost" onClick={() => setFlipped(true)}>Pokaż odpowiedź</button></div>}
          <p className="fc-meta">Zostało w tej sesji: {queue.length} · <Link href={cur.href} className="underline">otwórz w serwisie</Link></p>
        </div>
      )}
    </div>
  );
}
