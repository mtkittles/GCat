/*
  audit:jezyk — miary języka w Nauce i w kartach kodów (audyt Kody G i M, cz. 2, §3.2, §3.5, §9).
  Raport, nie bramka: liczy zdania > 25 słów, pauzy „ — ” i ozdobniki na 1000 słów, formy „zostaje/zostanie”.
  Kryterium paczki X2 dla kart: ozdobniki ≤ 3 i pauzy ≤ 10 na 1000 słów. `--karty` wypisuje karty powyżej progu.
*/
import { readdirSync, readFileSync } from "node:fs";
import { parse } from "yaml";
import { readyLessons } from "@/lib/course";
import { flatBlocks, type Block } from "@/lib/article";
import { splitFrontmatter } from "@/lib/mdx/loader";

// granice słów przez \p{L} — `\b` w JS nie zna polskich liter („warto|ść”)
const W = (x: string) => new RegExp(`(?<!\\p{L})(?:${x})(?!\\p{L})`, "giu");
const ORN = [
  W("naj(?!pierw|wyżej|niżej|mniej|bliż|dalej|azd|echa|eżdża|eźdz)\\p{L}+"), W("w praktyce"), W("zupełnie"), W("po prostu"),
  W("klasyczn\\p{L}*"), W("kluczow\\p{L}*"), W("warto"), /\bEfekt:/g, /(^|[.!?]\s)To jest(?!\p{L})/gu, W("bardzo"), /!/g,
];
const clean = (t: string) => t.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2").replace(/\[\[([^\]]+)\]\]/g, "$1").replace(/`[^`]*`/g, "KOD").replace(/\*\*|\\/g, "");
const words = (t: string) => t.match(/\p{L}+/gu) ?? [];
const sentences = (t: string) => t.split(/(?<=[.!?])\s+(?=[\p{Lu}0-9„])/u).filter((s) => words(s).length >= 3);

interface Stat { words: number; sent: number; long: number; pause: number; orn: number; pass: number }
const zero = (): Stat => ({ words: 0, sent: 0, long: 0, pause: 0, orn: 0, pass: 0 });
function add(st: Stat, raw: string) {
  const t = clean(raw);
  st.words += words(t).length;
  for (const s of sentences(t)) { st.sent++; if (words(s).length > 25) st.long++; }
  st.pause += (t.match(/ — /g) ?? []).length;
  st.orn += ORN.reduce((n, re) => n + (t.match(re) ?? []).length, 0);
  st.pass += (t.match(/(?<!\p{L})(zostaje|zostanie|zostają|zostaną)\s+\p{L}+(ny|na|ne|ty|ta|te|ni|ci)(?!\p{L})/giu) ?? []).length;
}
const per1k = (n: number, w: number) => (w ? (1000 * n) / w : 0).toFixed(1);
const line = (name: string, s: Stat) =>
  `${name.padEnd(22)} ${String(s.words).padStart(6)} słów · zdania > 25 słów: ${s.long} (${s.sent ? ((100 * s.long) / s.sent).toFixed(1) : 0}%) · pauzy ${per1k(s.pause, s.words)}/1000 · ozdobniki ${per1k(s.orn, s.words)}/1000 · strona bierna ${s.pass}`;

// Nauka
const nauka = zero();
const txt = (b: Block): string[] => {
  const x = b as Record<string, unknown>;
  if (b.t === "code" || b.t === "sim" || b.t === "demo") return [String(x.caption ?? "")];
  if (b.t === "table") return [...(b.head ?? []), ...b.rows.flat(), b.caption ?? ""];
  if (b.t === "ul" || b.t === "ol") return b.items;
  return [String(x.x ?? ""), String(x.caption ?? ""), String(x.title ?? "")];
};
for (const t of ["frezowanie", "toczenie"] as const)
  for (const l of readyLessons(t)) {
    const d = l.doc!;
    [d.goal, d.worked.intro, d.worked.result, ...d.worked.steps.map((s) => s.x), ...d.pitfalls.map((p) => p.x), ...d.summary,
      ...flatBlocks(d.theory).flatMap(txt)].forEach((x) => add(nauka, x));
  }

// Karty kodów: artykuł (treść MDX bez kodu i komponentów) + pola opisowe
const karty = new Map<string, Stat>();
const kodyAll = zero();
for (const f of readdirSync("content/kody").filter((x) => x.endsWith(".mdx"))) {
  const fm = splitFrontmatter(readFileSync(`content/kody/${f}`, "utf8"))!;
  const d = parse(fm.yaml);
  const st = zero();
  [d.short, d.desc, ...(d.pitfalls ?? [])].filter(Boolean).forEach((x: string) => add(st, x));
  let code = false;
  for (const l of fm.body.split("\n")) {
    if (/^\s*```/.test(l)) { code = !code; continue; }
    if (code || /^\s*(<|\|)/.test(l) || !l.trim()) continue;
    add(st, l.replace(/^#+\s*|^\s*[*-]\s+/, "").replace(/\\\{#.*\}/, ""));
  }
  karty.set(f.slice(0, -4), st);
  for (const k of Object.keys(st) as (keyof Stat)[]) kodyAll[k] += st[k];
}

console.log(line("Nauka", nauka));
console.log(line("Kody G i M", kodyAll));
if (process.argv.includes("--karty")) {
  console.log("\nKarty powyżej progu X2 (ozdobniki > 3 albo pauzy > 10 na 1000 słów, od 150 słów):");
  for (const [k, s] of [...karty].sort((a, b) => b[1].pause / b[1].words - a[1].pause / a[1].words))
    if (s.words >= 150 && ((1000 * s.orn) / s.words > 3 || (1000 * s.pause) / s.words > 10)) console.log("  " + line(k, s));
}
