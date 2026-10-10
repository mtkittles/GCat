/* Audyt działów poza Nauką (Kody, Zadania, Programy, Słownik) względem standardu lekcji:
   przykłady przez parser + walidator, G94 w programach frezarskich z ruchem roboczym,
   słowa bezwarunkowe i alarmistyczne, źródła. Raport w markdown na stdout.
   Uruchom: npm run audit:dzialy */
import { parseProgram } from "@/lib/parser";
import { validate } from "@/lib/parser/validate";
import { gcodes } from "@/lib/gcodes";
import { exercises, glossary } from "@/lib/content";
import { PROGRAMS } from "@/content/programy";

type Mode = "mill" | "lathe";
const ABS = /\b(zawsze|nigdy|wyłącznie|na każdym sterowaniu|każde sterowanie|jedyn[aey])\b/gi;
const ALARM = /złama\w*|rozbij\w*|zniszcz\w*|katastrof\w*/gi;

function prog(src: string, mode: Mode, dialect?: "fanuc" | "sinumerik") {
  const p = parseProgram(src, { diameterX: mode === "lathe" });
  const v = validate(p, dialect ?? "fanuc");
  const errors = [...p.lines.flatMap((l) => l.errors), ...v.filter((i) => i.level === "error").map((i) => i.msg)];
  const warns = v.filter((i) => i.level === "warn").map((i) => i.msg);
  const feedMoves = p.segments.some((s) => s.kind === "linear" || s.kind === "arc");
  const g94 = /(^|[^0-9A-Z])G0*94(?![0-9])/im.test(src.toUpperCase());
  return { errors, warns, noG94: mode === "mill" && (dialect ?? "fanuc") === "fanuc" && feedMoves && !g94 };
}
const hits = (t: string, re: RegExp) => [...t.matchAll(re)].map((m) => m[0].toLowerCase());

const out: string[] = [];
const section = (title: string, rows: [string, string | number][], list: [string, string[]][]) => {
  out.push(`## ${title}`, "", "| Wskaźnik | Wartość |", "|---|---|", ...rows.map(([k, v]) => `| ${k} | ${v} |`), "");
  for (const [name, items] of list) if (items.length) out.push(`**${name}** (${items.length}): ${items.slice(0, 40).join(", ")}${items.length > 40 ? ", …" : ""}`, "");
};

/* ---------- Kody ---------- */
{
  const noG94: string[] = [], warned: string[] = [], errs: string[] = [], abs: string[] = [], alarm: string[] = [];
  for (const g of gcodes) {
    const text = [g.short, g.desc, g.sinumerik, ...(g.pitfalls ?? []), ...(g.params ?? []).map((p) => p.desc)].join(" ");
    if (hits(text, ABS).length) abs.push(`${g.code} (${[...new Set(hits(text, ABS))].join("/")})`);
    if (hits(text, ALARM).length) alarm.push(g.code);
    if (g.simulate === false || !g.example) continue;
    const mode: Mode = g.exampleMode ?? (g.turning && !g.milling ? "lathe" : "mill");
    const r = prog(g.example, mode, g.exampleDialect);
    if (r.errors.length) errs.push(g.code);
    if (r.warns.length) warned.push(`${g.code} (${r.warns.length})`);
    if (r.noG94) noG94.push(g.code);
  }
  section("Kody", [
    ["karty", gcodes.length],
    ["opracowane ★", gcodes.filter((g) => g.star).length],
    ["karty z polem źródeł", "0 — schemat karty nie ma pola `sources`"],
    ["przykłady z błędami", errs.length],
    ["przykłady z ostrzeżeniami walidatora", warned.length],
    ["przykłady frezarskie z ruchem roboczym bez G94", noG94.length],
    ["karty ze słowami bezwarunkowymi", abs.length],
    ["karty ze słownictwem alarmistycznym", alarm.length],
  ], [["Błędy", errs], ["Ostrzeżenia", warned], ["Bez G94", noG94], ["Słowa bezwarunkowe", abs], ["Alarmistyczne", alarm]]);
}

/* ---------- Zadania ---------- */
{
  const noG94: string[] = [], warned: string[] = [], abs: string[] = [];
  for (const e of exercises) {
    const r = prog(e.reference, e.mode);
    if (r.warns.length) warned.push(`${e.slug} (${r.warns.join("; ")})`);
    if (r.noG94) noG94.push(e.slug);
    const text = [e.brief, ...(e.hints ?? [])].join(" ");
    if (hits(text, ABS).length) abs.push(e.slug);
  }
  section("Zadania", [
    ["zadania", exercises.length],
    ["wzorce z ostrzeżeniami walidatora", warned.length],
    ["wzorce frezarskie bez G94", noG94.length],
    ["treści ze słowami bezwarunkowymi", abs.length],
  ], [["Ostrzeżenia", warned], ["Bez G94", noG94], ["Słowa bezwarunkowe", abs]]);
}

/* ---------- Programy ---------- */
{
  const noG94: string[] = [], warned: string[] = [], errs: string[] = [];
  for (const p of PROGRAMS) {
    const r = prog(p.src, p.mode, p.dialect);
    if (r.errors.length) errs.push(p.slug);
    if (r.warns.length) warned.push(`${p.slug} (${r.warns.length})`);
    if (r.noG94) noG94.push(p.slug);
  }
  section("Programy", [
    ["programy", PROGRAMS.length],
    ["z błędami", errs.length],
    ["z ostrzeżeniami walidatora", warned.length],
    ["frezarskie Fanuc bez G94", noG94.length],
  ], [["Błędy", errs], ["Ostrzeżenia", warned], ["Bez G94", noG94]]);
}

/* ---------- Słownik ---------- */
{
  const abs: string[] = [], alarm: string[] = [], noSee: string[] = [];
  for (const h of glossary) {
    if (hits(h.def, ABS).length) abs.push(`${h.term} (${[...new Set(hits(h.def, ABS))].join("/")})`);
    if (hits(h.def, ALARM).length) alarm.push(h.term);
    if (!h.see?.length) noSee.push(h.term);
  }
  section("Słownik", [
    ["hasła", glossary.length],
    ["hasła ze źródłem", "0 — schemat hasła nie ma pola źródła"],
    ["hasła bez odnośnika do karty kodu", noSee.length],
    ["hasła ze słowami bezwarunkowymi", abs.length],
    ["hasła ze słownictwem alarmistycznym", alarm.length],
  ], [["Słowa bezwarunkowe", abs], ["Alarmistyczne", alarm]]);
}

console.log(["# Audyt działów — stan automatyczny", "", "Wygenerowano: `npm run audit:dzialy`. Słowa bezwarunkowe i alarmistyczne to kandydaci do przeglądu, nie automatyczne błędy.", "", ...out].join("\n"));
