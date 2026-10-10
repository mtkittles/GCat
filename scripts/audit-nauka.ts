/* Audyt spójności działu Nauka. Uruchom: npx tsx scripts/audit-nauka.ts */
import { flat, orderOf, type Track } from "@/lib/course";
import { buildup } from "@/content/nauka/buildup";
import { START7 } from "@/content/nauka/start7";
import { sources } from "@/content/nauka/sources";
import { diagrams } from "@/components/diagrams";
import { gcodes } from "@/lib/gcodes";
import { glossary } from "@/lib/content";
import { parseProgram } from "@/lib/parser";
import { validate } from "@/lib/parser/validate";
import { runTaskChecks } from "@/lib/taskCheck";
import type { LessonDoc, Question } from "@/lib/lesson";
import type { Block } from "@/lib/article";

const issues: string[] = [];
const warn = (where: string, msg: string) => issues.push(`${where}: ${msg}`);

const lookup = (key: string) => {
  const k = key.trim().toLowerCase();
  const code = gcodes.find((g) => g.code.toLowerCase() === k || g.code.toLowerCase().split(/[\s/]+/).includes(k) || g.slug === k.replace(/\s+/g, "-"));
  if (code) return true;
  return !!glossary.find((g) => g.term.toLowerCase() === k || g.term.toLowerCase().startsWith(k + " ") || g.aliases.some((a) => a.toLowerCase() === k));
};

function texts(doc: LessonDoc): string[] {
  const out: string[] = [doc.goal, doc.worked.intro, doc.worked.result, ...doc.worked.steps.map((s) => s.x), ...doc.summary];
  const blk = (b: Block) => { const a = b as unknown as Record<string, unknown>; if (b.t === "code" || b.t === "demo" || b.t === "sim") { if (typeof a.caption === "string") out.push(a.caption as string); return; } for (const k of ["x", "caption"]) if (typeof a[k] === "string") out.push(a[k] as string); if (Array.isArray(a.items)) out.push(...(a.items as string[])); if (Array.isArray(a.rows)) (a.rows as string[][]).forEach((r) => out.push(...r)); };
  doc.theory.forEach(blk);
  doc.pitfalls.forEach((p) => out.push(p.title, p.x));
  doc.controllers?.rows.forEach((r) => out.push(...r));
  if (doc.controllers?.note) out.push(doc.controllers.note);
  const qs: Question[] = [...doc.quiz, ...doc.practice.flatMap((p) => (p.kind === "drill" ? p.questions : []))];
  qs.forEach((q) => { out.push(q.q, q.why); if (q.kind === "choice") out.push(...q.options); });
  doc.practice.forEach((p) => out.push(p.intro));
  return out;
}

function checkQuestion(where: string, q: Question, track: Track, idx: number) {
  // Pytanie albo polecenie, nie sama etykieta („Promień toru:”) — uczeń ma wiedzieć, o co jest pytany.
  if ((q.kind === "choice" || q.kind === "gap") && !/[?.]\s*$/.test(q.q.trim())) warn(where, `treść nie jest pytaniem ani poleceniem: ${q.q}`);
  if (q.kind === "choice") {
    if (q.answer < 0 || q.answer >= q.options.length) warn(where, `odpowiedź poza zakresem: ${q.q}`);
    if (new Set(q.options).size !== q.options.length) warn(where, `powtórzone opcje: ${q.q}`);
  }
  if (q.kind === "gap") {
    const n = (q.template.match(/\{\d+\}/g) ?? []).length;
    if (n !== q.answers.length) warn(where, `luk ${n}, odpowiedzi ${q.answers.length}: ${q.q}`);
  }
  if (q.kind === "order") {
    const ok = q.answer.length === q.items.length && [...q.answer].sort((a, b) => a - b).every((v, i) => v === i);
    if (!ok) warn(where, `kolejność nie jest permutacją: ${q.q}`);
  }
  if (q.kind === "bughunt") {
    const n = q.program.split("\n").length;
    if (q.answer < 0 || q.answer >= n) warn(where, `bughunt: linia ${q.answer} poza programem (${n} linii): ${q.q}`);
  }
  if (q.kind === "token") {
    const toks = q.block.includes("|") ? q.block.split("|").map((x) => x.trim()) : q.block.split(/\s+/);
    if (q.answer >= toks.length) warn(where, `token poza zakresem: ${q.q}`);
  }
  if (q.review) {
    const o = orderOf(track, q.review);
    if (o < 0) warn(where, `powtórka z nieistniejącej lekcji ${q.review}`);
    else if (o >= idx) warn(where, `powtórka z lekcji późniejszej ${q.review}`);
  }
}

for (const track of ["frezowanie", "toczenie"] as Track[]) {
  const all = flat(track);
  const prefix = track === "frezowanie" ? "F" : "T";
  const other = prefix === "F" ? "T" : "F";
  for (const [idx, l] of all.entries()) {
    const doc = l.doc;
    if (!doc) { warn(l.id, "brak treści"); continue; }
    const W = doc.id;
    if (doc.id !== l.id) warn(W, `id w treści ${doc.id} ≠ ${l.id}`);
    if (doc.title !== l.title) warn(W, `tytuł w planie „${l.title}” ≠ w lekcji „${doc.title}”`);
    // rysunki
    const figIds = [...doc.theory.filter((b) => b.t === "diagram").map((b) => (b as { id: string }).id), doc.worked.fig, ...doc.pitfalls.map((p) => p.fig)].filter(Boolean) as string[];
    figIds.forEach((f) => { if (!diagrams[f]) warn(W, `brak rysunku ${f}`); });
    doc.sources.forEach((s) => { if (!sources[s.id]) warn(W, `brak źródła ${s.id}`); });
    // pytania
    [...doc.quiz, ...doc.practice.flatMap((p) => (p.kind === "drill" ? p.questions : []))].forEach((q) => checkQuestion(W, q, track, idx));
    if (doc.quiz.length < 5) warn(W, `test ma tylko ${doc.quiz.length} pytań`);
    if (!doc.quiz.some((q) => q.review) && idx > 0) warn(W, "test bez pytania powtórkowego");
    // teksty
    for (const t of texts(doc)) {
      for (const m of t.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g)) if (!lookup(m[1])) warn(W, `pojęcie bez karty/hasła: [[${m[1]}]]`);
      const prose = t.replace(/`[^`]*`/g, "");
      for (const m of prose.matchAll(/(?<![\w.−-])(\d+\.\d{1,2})(?![\w.\d])/g)) warn(W, `kropka dziesiętna w tekście: „${m[1]}” w: ${prose.slice(0, 70)}`);
      for (const m of prose.matchAll(/(?:lekcj\w*|modu\w*|\()\s*([FT])(\d)\.(\d)(?![\d])/g)) {
        const id = `${m[1]}${m[2]}.${m[3]}`;
        if (m[1] === prefix) { if (orderOf(track, id) < 0) warn(W, `odwołanie do nieistniejącej lekcji ${id}`); }
        else if (m[1] === other) warn(W, `odwołanie do innej ścieżki: ${id} — „${prose.slice(Math.max(0, (m.index ?? 0) - 60), (m.index ?? 0) + 20)}”`);
      }
    }
    // zadania
    for (const p of doc.practice) {
      if (p.kind !== "task") continue;
      const mode = p.mode ?? "mill";
      const sol = runTaskChecks(p.solution, p.checks, mode);
      const st = runTaskChecks(p.starter, p.checks, mode);
      if (!sol.passed) warn(W, `rozwiązanie zadania nie przechodzi: ${sol.checks.filter((c) => !c.ok).map((c) => c.label).join("; ")}`);
      if (st.passed) warn(W, "program startowy zadania już przechodzi");
    }
  }
  // program narastający
  const lines = buildup[track].lines;
  lines.forEach((ln) => {
    if (orderOf(track, ln.since) < 0) warn(`buildup ${track}`, `since ${ln.since} nie istnieje: ${ln.code}`);
    if (ln.until && orderOf(track, ln.until) < 0) warn(`buildup ${track}`, `until ${ln.until} nie istnieje: ${ln.code}`);
  });
  for (const [idx, l] of all.entries()) {
    const shown = lines.filter((ln) => orderOf(track, ln.since) <= idx && !(ln.until && orderOf(track, ln.until) <= idx));
    const src = shown.map((ln) => ln.code).join("\n");
    const prog = parseProgram(src, { diameterX: track === "toczenie" });
    const errs = prog.lines.flatMap((x) => x.errors.map((e) => `${x.index + 1}: ${e}`));
    const vals = validate(prog).filter((v) => v.level === "error").map((v) => v.msg);
    if (errs.length || vals.length) warn(`program ${l.id}`, [...errs, ...vals].join(" | "));
  }
}

// Plan „7 dni”: powtórki w testach muszą dotyczyć lekcji, które uczeń przeszedł w tym planie.
{
  const seen = new Set<string>();
  for (const d of START7) for (const id of d.lessons) {
    const doc = flat("frezowanie").find((l) => l.id === id)?.doc;
    if (!doc) { warn(`7 dni, dzień ${d.day}`, `brak lekcji ${id}`); continue; }
    for (const q of doc.quiz) if (q.review && !seen.has(q.review)) warn(`7 dni, dzień ${d.day}`, `${id}: powtórka z ${q.review}, której nie ma wcześniej w planie`);
    seen.add(id);
  }
}

console.log(issues.length ? issues.join("\n") : "Brak uwag.");
console.log(`\n${issues.length} uwag`);
