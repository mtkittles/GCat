/*
  Powtórki metodą Leitnera: pięć pudełek, każde z własnym odstępem. „Wiem” przenosi kartę
  o pudełko dalej, „nie wiem” cofa do pierwszego. Czyste funkcje — stan trzyma strona.
*/
export const BOX_DAYS = [0, 1, 3, 7, 14, 30]; // pudełko 0 = nowa karta (od razu), 1…5 = odstępy w dniach
export interface CardState { box: number; due: number }
export type Deck = Record<string, CardState>;
const DAY = 86_400_000;

export function review(deck: Deck, id: string, known: boolean, now = Date.now()): Deck {
  const cur = deck[id] ?? { box: 0, due: now };
  const box = known ? Math.min(5, cur.box + 1) : 1;
  return { ...deck, [id]: { box, due: now + BOX_DAYS[box] * DAY } };
}

/** Karty do powtórki teraz: zaległe i nowe, najstarsze najpierw; nowe ograniczone limitem. */
export function dueCards(deck: Deck, ids: string[], now = Date.now(), newLimit = 10): string[] {
  const due = ids.filter((id) => deck[id] && deck[id].due <= now).sort((a, b) => deck[a].due - deck[b].due);
  const fresh = ids.filter((id) => !deck[id]).slice(0, newLimit);
  return [...due, ...fresh];
}

/** Tasowanie Fishera–Yatesa; `rnd` jak Math.random (wstrzykiwane w testach). */
export function shuffle<T>(arr: readonly T[], rnd: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/**
  Kolejka jednej tury: najpierw karty zaległe, potem nowe — obie grupy w losowej kolejności.
  `size` ogranicza długość tury; zaległe mają pierwszeństwo przed nowymi.
*/
export function buildSession(deck: Deck, ids: string[], o: { now?: number; size?: number; rnd?: () => number } = {}): string[] {
  const now = o.now ?? Date.now(), rnd = o.rnd ?? Math.random, size = o.size ?? Infinity;
  const due = shuffle(ids.filter((id) => deck[id] && deck[id].due <= now), rnd);
  const fresh = shuffle(ids.filter((id) => !deck[id]), rnd);
  return [...due, ...fresh].slice(0, size);
}

/** „Nie wiem”: karta wraca w tej samej turze 3–5 pozycji dalej (albo na koniec, gdy kolejka jest krótsza). */
export function requeue(queue: string[], rnd: () => number = Math.random): string[] {
  const [id, ...rest] = queue;
  if (id === undefined) return queue;
  const at = Math.min(rest.length, 3 + Math.floor(rnd() * 3));
  return [...rest.slice(0, at), id, ...rest.slice(at)];
}

export function deckStats(deck: Deck, ids: string[], now = Date.now()) {
  const boxes = [0, 0, 0, 0, 0, 0];
  let due = 0;
  for (const id of ids) { const c = deck[id]; if (!c) { boxes[0]++; continue; } boxes[c.box]++; if (c.due <= now) due++; }
  return { boxes, due, learned: boxes[4] + boxes[5], total: ids.length };
}
