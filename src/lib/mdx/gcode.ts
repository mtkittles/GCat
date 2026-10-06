import type { GlossaryEntry } from "@/lib/content";
import type { GCode } from "@/lib/gcodes";
import type { Haslo, Kod } from "./schema";

/** Frontmatter karty → rekord GCode, którego używa strona (lista, dymki, wyszukiwarka, karta). */
export function kodToGcode(k: Kod, hasArticle: boolean): GCode {
  return {
    code: k.code, slug: k.slug, name: k.name, group: k.group, modal: k.modal,
    milling: k.machines.includes("frezowanie"), turning: k.machines.includes("toczenie"), level: k.level,
    short: k.short, desc: k.desc, syntax: k.syntax, params: k.params, example: k.example.src,
    sinumerik: k.sinumerik, pitfalls: k.pitfalls,
    ...(k.related.length ? { related: k.related } : {}),
    ...(k.variesBy !== null ? { variesBy: k.variesBy } : {}),
    ...(k.example.simulate === false ? { simulate: false } : {}),
    ...(k.example.mode ? { exampleMode: k.example.mode } : {}),
    ...(k.example.stock ? { exampleStock: k.example.stock } : {}),
    ...(k.example.dialect ? { exampleDialect: k.example.dialect } : {}),
    star: k.star, hasArticle,
  };
}

/** Hasło z pliku → wpis słownika strony (bez `order` — lista jest już posortowana). */
export function hasloToEntry(h: Haslo): GlossaryEntry {
  return { term: h.term, anchor: h.anchor, aliases: h.aliases, def: h.def, see: h.see, ...(h.diagram ? { diagram: h.diagram } : {}) };
}
