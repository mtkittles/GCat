/* Audyt programów osadzonych w treści: każdy przez parser + walidator (Fanuc).
   Błędy parsera/walidatora kończą się kodem 1 (poza starterami, które z założenia są niekompletne).
   Uruchom: npm run audit:programy */
import { readFileSync } from "node:fs";
import { parseProgram } from "@/lib/parser";
import { validate } from "@/lib/parser/validate";
import { checkExercise } from "@/lib/checker";
import { runTaskChecks } from "@/lib/taskCheck";
import { gcodes } from "@/lib/gcodes";
import { exercises } from "@/lib/content";
import { flat, type Track } from "@/lib/course";
import { articles } from "@/content/articles";
import { PROGRAMS } from "@/content/programy";
import type { Block } from "@/lib/article";

type Mode = "mill" | "lathe";
type Item = { where: string; src: string; mode: Mode; starter?: boolean; dialect?: "fanuc" | "sinumerik" };
const items: Item[] = [];
const add = (where: string, src: string | undefined, mode: Mode = "mill", starter = false) => { if (src) items.push({ where, src, mode, starter }); };

for (const g of gcodes) if (g.simulate !== false) add(`kody/${g.slug}`, g.example, g.exampleMode ?? (g.turning && !g.milling ? "lathe" : "mill"));
for (const e of exercises) { add(`zadania/${e.slug} starter`, e.starter, e.mode, true); add(`zadania/${e.slug} wzorzec`, e.reference, e.mode); }
for (const [slug, blocks] of Object.entries(articles)) (blocks as Block[]).forEach((b, i) => { if (b.t === "sim" || b.t === "demo") add(`artykuł ${slug} blok ${i}`, b.src, b.mode ?? "mill"); });
for (const t of ["frezowanie", "toczenie"] as Track[]) for (const l of flat(t)) {
  const d = l.doc; if (!d) continue; const mode: Mode = t === "frezowanie" ? "mill" : "lathe";
  d.theory.forEach((b, i) => { if (b.t === "sim" || b.t === "demo") add(`${d.id} teoria blok ${i}`, b.src, b.mode ?? mode); });
  d.practice.forEach((p, i) => {
    if (p.kind === "task") { add(`${d.id} zadanie ${i} starter`, p.starter, p.mode ?? mode, true); add(`${d.id} zadanie ${i} rozwiązanie`, p.solution, p.mode ?? mode); }
    if (p.kind === "state") add(`${d.id} stan ${i}`, p.program, mode);
  });
}
for (const p of PROGRAMS) items.push({ where: `programy/${p.slug}`, src: p.src, mode: p.mode, dialect: p.dialect });
const home = readFileSync("src/app/page.tsx", "utf8").match(/const DEMO = `([\s\S]*?)`;/);
if (home) add("strona główna DEMO", home[1], "mill");

let errors = 0, warned = 0, warnTotal = 0;
for (const it of items) {
  const prog = parseProgram(it.src, { diameterX: it.mode === "lathe" });
  const issues = validate(prog, it.dialect ?? "fanuc");
  const errs = [...prog.lines.flatMap((l) => l.errors.map((e) => `L${l.index + 1}: ${e}`)), ...issues.filter((i) => i.level === "error").map((i) => `L${i.line + 1}: ${i.msg}`)];
  const warns = issues.filter((i) => i.level === "warn");
  if (errs.length && !it.starter) { errors++; console.log(`✗ ${it.where}`); [...new Set(errs)].forEach((e) => console.log("   " + e)); }
  else if (warns.length) { warned++; warnTotal += warns.length; console.log(`~ ${it.where}`); warns.forEach((w) => console.log(`   L${w.line + 1}: ${w.msg}`)); }
}

// Rozwiązania wzorcowe muszą przechodzić własne sprawdzenie.
for (const e of exercises) {
  const r = checkExercise(e.reference, { mode: e.mode, reference: e.reference, tolerance: e.tolerance, requireCodes: e.requireCodes, forbidCodes: e.forbidCodes, maxCutLength: e.maxCutLength });
  if (!r.passed) { errors++; console.log(`✗ zadania/${e.slug}: wzorzec nie przechodzi — ${r.checks.filter((c) => !c.ok).map((c) => c.label).join("; ")}`); }
}
for (const t of ["frezowanie", "toczenie"] as Track[]) for (const l of flat(t)) l.doc?.practice.forEach((p, i) => {
  if (p.kind !== "task") return;
  const r = runTaskChecks(p.solution, p.checks, p.mode ?? (t === "frezowanie" ? "mill" : "lathe"));
  if (!r.passed) { errors++; console.log(`✗ ${l.id} zadanie ${i}: rozwiązanie nie przechodzi — ${r.checks.filter((c) => !c.ok).map((c) => c.label).join("; ")}`); }
});

console.log(`\n${items.length} programów · błędy: ${errors} · programy z ostrzeżeniami: ${warned} (${warnTotal} ostrzeżeń)`);
process.exit(errors ? 1 : 0);
