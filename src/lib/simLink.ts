/*
  Program w adresie symulatora (paczka Z b, decyzja 7 audytu kart): karta kodu pokazuje animację `Demo`,
  a przycisk „Otwórz w symulatorze” przenosi ten sam program do pełnego warsztatu: /symulator?kod=…
  `kod` = base64url(JSON { src, mode, stock?, dialect?, name? }). Odczyt sprawdza typy i długość,
  więc ręcznie zmieniony adres nie wywróci strony — zwraca null.
*/
export type SimLinkMode = "mill" | "lathe";
export interface SimLink {
  src: string;
  mode: SimLinkMode;
  stock?: { x: number; y: number; z: number; ox: number; oy: number; oz: number };
  dialect?: "fanuc" | "sinumerik";
  /** nazwa zakładki w symulatorze, np. „G40 G41 G42 — przykład” */
  name?: string;
}

export const SIM_LINK_MAX = 20000; // znaków programu

function toB64url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function simHref(p: SimLink): string {
  const o: SimLink = { src: p.src, mode: p.mode };
  if (p.stock) o.stock = p.stock;
  if (p.dialect && p.dialect !== "fanuc") o.dialect = p.dialect;
  if (p.name) o.name = p.name;
  return `/symulator?kod=${toB64url(JSON.stringify(o))}`;
}

const STOCK_KEYS = ["x", "y", "z", "ox", "oy", "oz"] as const;

/** Program z parametru `kod` (np. `window.location.search`); null, gdy brak albo dane są nieprawidłowe. */
export function readSimLink(search: string): SimLink | null {
  const raw = new URLSearchParams(search).get("kod");
  if (!raw) return null;
  try {
    const o = JSON.parse(fromB64url(raw)) as Record<string, unknown>;
    if (typeof o.src !== "string" || !o.src.trim() || o.src.length > SIM_LINK_MAX) return null;
    if (o.mode !== "mill" && o.mode !== "lathe") return null;
    const out: SimLink = { src: o.src, mode: o.mode };
    if (o.dialect === "sinumerik") out.dialect = "sinumerik";
    if (typeof o.name === "string") out.name = o.name.slice(0, 80);
    const st = o.stock as Record<string, unknown> | undefined;
    if (st && typeof st === "object" && STOCK_KEYS.every((k) => typeof st[k] === "number" && Number.isFinite(st[k]))) {
      out.stock = Object.fromEntries(STOCK_KEYS.map((k) => [k, st[k] as number])) as SimLink["stock"];
    }
    return out;
  } catch {
    return null;
  }
}
