import { gcodes } from "./gcodes";
import { exercises, glossary } from "./content";
// tekst artykułów kart (content/kody/*.mdx), wygenerowany przez npm run tresci
import articleText from "../../content/.generated/szukaj.json";
import { readyLessons, lessonHref, tracks } from "./course";
import { flatBlocks, type Block } from "./article";
import { norm, queryTerms } from "./searchNorm";

export interface SearchDoc {
  kind: "kod" | "lekcja" | "zadanie" | "pojęcie";
  title: string; subtitle: string; href: string; body: string;
}

const blockText = (bs: Block[] | undefined) =>
  flatBlocks(bs ?? []).map((b) => {
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
    href: `/kody/${g.slug}`, body: [g.code, g.name, g.short, g.desc, g.sinumerik, ...g.pitfalls, (articleText as Record<string, string>)[g.slug] ?? ""].join(" "),
  })),
  ...(["frezowanie", "toczenie"] as const).flatMap((t) => readyLessons(t).map((l) => ({
    kind: "lekcja" as const, title: `${l.id} ${l.title}`, subtitle: `${tracks[t].title} · ${l.doc!.minutes} min`,
    href: lessonHref(t, l.slug!), body: [l.title, l.doc!.goal, blockText(l.doc!.theory), ...l.doc!.summary, ...l.doc!.pitfalls.map((p) => `${p.title} ${p.x}`)].join(" "),
  }))),
  ...exercises.map((e) => ({
    kind: "zadanie" as const, title: e.title, subtitle: e.mode === "mill" ? "frezowanie" : "toczenie",
    href: `/zadania/${e.slug}`, body: [e.title, e.brief, ...e.hints].join(" "),
  })),
  ...glossary.map((g) => ({
    kind: "pojęcie" as const, title: g.term, subtitle: "słownik",
    href: `/slownik#${g.anchor}`, body: [g.term, ...g.aliases, g.def].join(" "),
  })),
];


export interface Hit extends SearchDoc { score: number; snippet: string }

export function search(query: string, limit = 25): Hit[] {
  if (norm(query.trim()).length < 2) return [];
  const terms = queryTerms(query);
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

/** Podgląd pozycji w palecie Ctrl+K (prawa kolumna): krótki opis, a dla kodu — składnia obu sterowań. */
export interface Peek {
  kind: SearchDoc["kind"]; title: string; sub: string; text: string; href: string;
  code?: string; syntax?: { fanuc: string; sinumerik: string }; modal?: boolean;
}
const clean = (s: string) => s.replace(/\*\*|`|\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_m, a, b) => (a ? (b || a) : "")).replace(/\s+/g, " ").trim();
const firstLines = (s: string, n = 2) => s.split("\n").slice(0, n).join("\n");

export function peek(href: string): Peek | null {
  const path = href.split("#")[0];
  const code = gcodes.find((g) => `/kody/${g.slug}` === path);
  if (code) return {
    kind: "kod", title: code.name, sub: `${code.group} · ${code.modal ? "modalny" : "niemodalny"}`, text: clean(code.short), href,
    code: code.code, modal: code.modal, syntax: code.syntax ? { fanuc: firstLines(code.syntax.fanuc), sinumerik: firstLines(code.syntax.sinumerik) } : undefined,
  };
  if (path === "/slownik") {
    const g = glossary.find((x) => `/slownik#${x.anchor}` === href);
    if (g) return { kind: "pojęcie", title: g.term, sub: g.aliases.length ? `także: ${g.aliases.slice(0, 3).join(", ")}` : "słownik", text: clean(g.def), href };
  }
  const ex = exercises.find((e) => `/zadania/${e.slug}` === path);
  if (ex) return { kind: "zadanie", title: ex.title, sub: ex.mode === "mill" ? "zadanie · frezowanie" : "zadanie · toczenie", text: clean(ex.brief), href };
  const doc = searchDocs.find((d) => d.kind === "lekcja" && d.href === path);
  if (doc) {
    const l = (["frezowanie", "toczenie"] as const).flatMap((t) => readyLessons(t).map((x) => ({ x, href: lessonHref(t, x.slug!) }))).find((o) => o.href === path);
    return { kind: "lekcja", title: doc.title, sub: doc.subtitle, text: clean(l?.x.doc?.goal ?? ""), href };
  }
  return null;
}
