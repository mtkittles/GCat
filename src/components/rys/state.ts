import { bbox, drop, newId, translate, type Item, type RysDoc } from "@/lib/rys/model";

/*
  Stan edytora rysownika: rysunek, zaznaczenie i historia cofania.
  Reduktor bez efektów ubocznych — testowalny bez przeglądarki (tests/rys.test.ts).
*/

export interface EdState { doc: RysDoc; sel: string[]; past: RysDoc[]; future: RysDoc[] }
export type EdAction =
  | { type: "set"; doc: RysDoc; sel?: string[] }        // zmiana z wpisem do historii
  | { type: "live"; doc: RysDoc }                      // podgląd w trakcie przeciągania, bez historii
  | { type: "settle"; from: RysDoc }                   // koniec przeciągania: stan sprzed niego trafia do historii
  | { type: "sel"; sel: string[] }
  | { type: "undo" } | { type: "redo" }
  | { type: "load"; doc: RysDoc };

const LIMIT = 100;
const push = (past: RysDoc[], d: RysDoc) => [...past.slice(-(LIMIT - 1)), d];
const keep = (sel: string[], doc: RysDoc) => { const ids = new Set(doc.items.map((i) => i.id)); return sel.filter((s) => ids.has(s)); };

export function edReducer(s: EdState, a: EdAction): EdState {
  switch (a.type) {
    case "set": return { doc: a.doc, sel: keep(a.sel ?? s.sel, a.doc), past: push(s.past, s.doc), future: [] };
    case "live": return { ...s, doc: a.doc };
    case "settle": return a.from === s.doc ? s : { ...s, past: push(s.past, a.from), future: [] };
    case "sel": return { ...s, sel: a.sel };
    case "undo": { const prev = s.past[s.past.length - 1]; return prev ? { doc: prev, sel: keep(s.sel, prev), past: s.past.slice(0, -1), future: [s.doc, ...s.future] } : s; }
    case "redo": { const next = s.future[0]; return next ? { doc: next, sel: keep(s.sel, next), past: push(s.past, s.doc), future: s.future.slice(1) } : s; }
    case "load": return { doc: a.doc, sel: [], past: [], future: [] };
  }
}
export const initEd = (doc: RysDoc): EdState => ({ doc, sel: [], past: [], future: [] });

/* ───────────── operacje na rysunku (czyste) ───────────── */
export const patchItems = (doc: RysDoc, ids: string[], fn: (it: Item) => Item): RysDoc => ({ ...doc, items: doc.items.map((it) => (ids.includes(it.id) ? fn(it) : it)) });
export const removeItems = (doc: RysDoc, ids: string[]): RysDoc => ({ ...doc, items: doc.items.filter((it) => !ids.includes(it.id)) });
export const addItems = (doc: RysDoc, items: Item[]): RysDoc => ({ ...doc, items: [...doc.items, ...items] });

/** Nowe id elementów i nowe grupy (kopie, wklejanie, import) — kopia grupy jest osobną grupą, nie dołącza do oryginału. */
export function regroup(items: Item[]): Item[] {
  const map = new Map<string, string>();
  return items.map((it) => {
    const out = { ...it, id: newId() };
    if (it.g) { if (!map.has(it.g)) map.set(it.g, newId()); out.g = map.get(it.g)!; }
    return out;
  });
}
/** Zaznaczenie rozszerzone o całe grupy, do których należą elementy. */
export function withGroups(doc: RysDoc, ids: string[]): string[] {
  const gs = new Set(doc.items.filter((it) => it.g && ids.includes(it.id)).map((it) => it.g));
  return gs.size ? doc.items.filter((it) => ids.includes(it.id) || (it.g && gs.has(it.g))).map((it) => it.id) : ids;
}
export const group = (doc: RysDoc, ids: string[]): RysDoc => { const g = newId(); return patchItems(doc, ids, (it) => ({ ...it, g })); };
export const ungroup = (doc: RysDoc, ids: string[]): RysDoc => patchItems(doc, ids, (it) => drop(it, "g"));

/** Kopie zaznaczonych elementów przesunięte o (dx, dy); zwraca rysunek i id kopii. */
export function duplicate(doc: RysDoc, ids: string[], dx = 10, dy = 10): { doc: RysDoc; ids: string[] } {
  const copies = regroup(doc.items.filter((it) => ids.includes(it.id))).map((it) => translate(it, dx, dy));
  return { doc: addItems(doc, copies), ids: copies.map((c) => c.id) };
}

/** Kolejność rysowania: "up"/"down" o jedno miejsce, "top"/"bottom" na skraj. Kolejność względna zaznaczonych zostaje. */
export function reorder(doc: RysDoc, ids: string[], dir: "up" | "down" | "top" | "bottom"): RysDoc {
  const items = [...doc.items], isSel = (it: Item) => ids.includes(it.id);
  if (dir === "top") return { ...doc, items: [...items.filter((i) => !isSel(i)), ...items.filter(isSel)] };
  if (dir === "bottom") return { ...doc, items: [...items.filter(isSel), ...items.filter((i) => !isSel(i))] };
  if (dir === "up") { for (let i = items.length - 2; i >= 0; i--) if (isSel(items[i]) && !isSel(items[i + 1])) [items[i], items[i + 1]] = [items[i + 1], items[i]]; }
  else for (let i = 1; i < items.length; i++) if (isSel(items[i]) && !isSel(items[i - 1])) [items[i], items[i - 1]] = [items[i - 1], items[i]];
  return { ...doc, items };
}

/** Wyrównanie zaznaczonych do wspólnej krawędzi albo środka (po prostokątach otaczających). */
export function align(doc: RysDoc, ids: string[], how: "left" | "cx" | "right" | "top" | "cy" | "bottom"): RysDoc {
  const sel = doc.items.filter((it) => ids.includes(it.id));
  if (sel.length < 2) return doc;
  const bs = sel.map(bbox);
  const x0 = Math.min(...bs.map((b) => b[0])), x1 = Math.max(...bs.map((b) => b[2])), y0 = Math.min(...bs.map((b) => b[1])), y1 = Math.max(...bs.map((b) => b[3]));
  return patchItems(doc, ids, (it) => {
    const b = bbox(it);
    switch (how) {
      case "left": return translate(it, x0 - b[0], 0);
      case "right": return translate(it, x1 - b[2], 0);
      case "cx": return translate(it, (x0 + x1) / 2 - (b[0] + b[2]) / 2, 0);
      case "top": return translate(it, 0, y0 - b[1]);
      case "bottom": return translate(it, 0, y1 - b[3]);
      case "cy": return translate(it, 0, (y0 + y1) / 2 - (b[1] + b[3]) / 2);
    }
  });
}
