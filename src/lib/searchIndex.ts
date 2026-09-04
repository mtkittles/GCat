import { gcodes } from "./gcodes";
import { exercises, glossary, lessons } from "./content";
import { articles } from "@/content/articles";
import type { Block } from "./article";

export interface SearchDoc {
  kind: "kod" | "lekcja" | "zadanie" | "pojęcie";
  title: string; subtitle: string; href: string; body: string;
}

const blockText = (bs: Block[] | undefined) =>
  (bs ?? []).map((b) => {
    switch (b.t) {
      case "p": case "h": return b.x;
      case "note": return b.x;
      case "ul": case "ol": return b.items.join(" ");
      case "table": return [...b.head, ...b.rows.flat()].join(" ");
      case "code": case "sim": return b.caption ?? "";
      default: return "";
    }
  }).join(" ").replace(/\*\*|`/g, "");

export const searchDocs: SearchDoc[] = [
  ...gcodes.map((g) => ({
    kind: "kod" as const, title: `${g.code} — ${g.name}`, subtitle: `${g.group} · ${g.milling ? "frezowanie" : ""}${g.milling && g.turning ? " / " : ""}${g.turning ? "toczenie" : ""}`,
    href: `/kody/${g.slug}`, body: [g.code, g.name, g.short, g.desc, g.sinumerik, ...g.pitfalls, blockText(articles[g.slug])].join(" "),
  })),
  ...lessons.map((l, i) => ({
    kind: "lekcja" as const, title: l.title, subtitle: `Lekcja ${i + 1} · ${l.minutes} min`,
    href: `/nauka/${l.slug}`, body: [l.title, l.intro, ...l.sections.map((s) => `${s.h} ${s.p}`), l.task].join(" "),
  })),
  ...exercises.map((e) => ({
    kind: "zadanie" as const, title: e.title, subtitle: e.mode === "mill" ? "frezowanie" : "toczenie",
    href: `/zadania/${e.slug}`, body: [e.title, e.brief, ...e.hints].join(" "),
  })),
  ...glossary.map((g) => ({
    kind: "pojęcie" as const, title: g.term, subtitle: "słownik",
    href: `/slownik#${g.term.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-")}`, body: [g.term, ...g.aliases, g.def].join(" "),
  })),
];

const norm = (s: string) => s.toLowerCase()
  .replace(/[ąàâ]/g, "a").replace(/[ćč]/g, "c").replace(/[ęèé]/g, "e").replace(/ł/g, "l")
  .replace(/ń/g, "n").replace(/[óô]/g, "o").replace(/[śš]/g, "s").replace(/[żź]/g, "z");

export interface Hit extends SearchDoc { score: number; snippet: string }

export function search(query: string, limit = 25): Hit[] {
  const q = norm(query.trim());
  if (q.length < 2) return [];
  const terms = q.split(/\s+/);
  const hits: Hit[] = [];
  for (const d of searchDocs) {
    const title = norm(d.title), body = norm(d.body);
    let score = 0;
    for (const t of terms) {
      if (title.startsWith(t)) score += 40;
      else if (title.includes(t)) score += 22;
      const n = body.split(t).length - 1;
      if (n) score += Math.min(12, 3 + n);
    }
    if (!score) continue;
    const i = body.indexOf(terms[0]);
    const raw = d.body.replace(/\s+/g, " ");
    const snippet = i >= 0 ? `…${raw.slice(Math.max(0, i - 60), i + 140).trim()}…` : raw.slice(0, 160);
    hits.push({ ...d, score, snippet });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
