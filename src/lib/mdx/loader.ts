import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { LineCounter, parseDocument, YAMLParseError } from "yaml";
import type { z } from "zod";
import { compileContentMeta } from "./compile";
import { componentNames, diagramIds as liveDiagramIds } from "./names";
import { ContentError, MARKER_RE, type ContentIssue, type GcatMeta } from "./remark";
import { knownCodes, liveSources, resolveKey, selfCodes, type TermSources } from "./resolve";
import {
  cwiczeniaSchema, hasloSchema, kodSchema, lekcjaSchema, programSchema, zadanieSchema,
  type Cwiczenia, type Haslo, type Kod, type Lekcja, type Program, type Zadanie,
} from "./schema";

/*
  Loader treści z content/ (krok 2 — nie jest jeszcze podpięty do żadnej strony).
  Czyta pliki, waliduje schematem (zod), sprawdza slugi/kotwice = nazwy plików, odwołania między plikami
  i kompiluje MDX (markery [[…]], kotwice {#id}, <Diagram>). Zbiera wszystkie błędy i rzuca jeden
  ContentErrors z listą „plik:linia:kolumna — opis”.
*/

export interface LoadOptions {
  /** źródła kluczy markerów (domyślnie dzisiejsze gcodes.json + glossary.json) */
  sources?: TermSources;
  diagramIds?: Set<string>;
  components?: string[];
}

export interface KodEntry { file: string; data: Kod; self: string[]; body: string; meta: GcatMeta; fields: Record<string, string> }
export interface HasloEntry { file: string; data: Haslo }
export interface LekcjaEntry { file: string; tor: "frezowanie" | "toczenie"; data: Lekcja; body: string; cwiczenia: Cwiczenia }
export interface ProgramEntry { file: string; data: Program; body: string; nc: string | null }
export interface ZadanieEntry { file: string; data: Zadanie }
export interface Content { kody: KodEntry[]; slownik: HasloEntry[]; lekcje: LekcjaEntry[]; programy: ProgramEntry[]; zadania: ZadanieEntry[] }

export class ContentErrors extends Error {
  constructor(public errors: ContentError[]) {
    const n = errors.reduce((s, e) => s + e.issues.length, 0);
    super(`Błędy w treści (${n}):\n` + errors.map((e) => e.message).join("\n"));
    this.name = "ContentErrors";
  }
}

const TORY = ["frezowanie", "toczenie"] as const;
const IGNORED = new Set(["README.md", ".gitkeep"]);

/** Plik z frontmatterem `---`: YAML + treść. Frontmatter zastąpiony pustymi liniami, żeby numery linii treści = numery w pliku. */
export function splitFrontmatter(src: string): { yaml: string; body: string; yamlLine: number } | null {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/);
  if (!m) return null;
  const blank = "\n".repeat(m[0].split("\n").length - 1);
  return { yaml: m[1], body: blank + src.slice(m[0].length), yamlLine: 2 };
}

/** YAML → schemat. Błędy z numerem linii w pliku (yamlLine = linia, od której zaczyna się YAML). */
function parseYaml<S extends z.ZodType>(yaml: string, schema: S, yamlLine: number): { data?: z.infer<S>; issues: ContentIssue[] } {
  const lc = new LineCounter();
  const doc = parseDocument(yaml, { lineCounter: lc, prettyErrors: true, uniqueKeys: true });
  if (doc.errors.length) {
    return { issues: doc.errors.map((e: YAMLParseError) => ({ line: (e.linePos?.[0].line ?? 1) + yamlLine - 1, column: e.linePos?.[0].col, message: `błąd YAML: ${e.message.split("\n")[0]}` })) };
  }
  const r = schema.safeParse(doc.toJS());
  if (r.success) return { data: r.data, issues: [] };
  return {
    issues: r.error.issues.map((i) => {
      // pozycja: najgłębszy istniejący węzeł na ścieżce błędu
      let line: number | undefined;
      for (let k = i.path.length; k >= 0 && line === undefined; k--) {
        const node = doc.getIn(i.path.slice(0, k) as (string | number)[], true); // [] = korzeń dokumentu
        const range = (node as { range?: [number, number, number] } | undefined)?.range;
        if (range) line = lc.linePos(range[0]).line + yamlLine - 1;
      }
      const where = i.path.length ? `pole „${i.path.join(".")}”` : "plik";
      return { line, message: `${where}: ${i.message}` };
    }),
  };
}

const rel = (f: string) => path.relative(process.cwd(), f) || f;
const list = (dir: string) => (existsSync(dir) ? readdirSync(dir).filter((f) => !IGNORED.has(f)).sort() : []);

export async function loadContent(root = "content", o: LoadOptions = {}): Promise<Content> {
  const sources = o.sources ?? liveSources;
  const diagramIds = o.diagramIds ?? liveDiagramIds;
  const components = o.components ?? componentNames;
  const errors: ContentError[] = [];
  const fail = (file: string, issues: ContentIssue[]) => { if (issues.length) errors.push(new ContentError(rel(file), issues)); };
  const compileOpts = (file: string) => ({ file: rel(file), sources, components, diagramIds });
  const tryCompileMeta = async (file: string, src: string, extra: { autoCodes?: { known: Set<string>; self: string[] } } = {}) => {
    try { return await compileContentMeta(src, { ...compileOpts(file), ...extra }); } catch (e) {
      if (e instanceof ContentError) errors.push(e); else throw e;
      return { code: "", meta: { headings: [], diagrams: 0 } };
    }
  };
  const tryCompile = async (file: string, src: string, extra: { autoCodes?: { known: Set<string>; self: string[] } } = {}) => (await tryCompileMeta(file, src, extra)).code;
  const readMdx = <S extends z.ZodType>(file: string, schema: S) => {
    const src = readFileSync(file, "utf8");
    const fm = splitFrontmatter(src);
    if (!fm) { fail(file, [{ line: 1, message: "brak frontmattera (plik musi zaczynać się od ---)" }]); return null; }
    const { data, issues } = parseYaml(fm.yaml, schema, fm.yamlLine);
    fail(file, issues);
    return data ? { data, body: fm.body } : null;
  };
  const readYaml = <S extends z.ZodType>(file: string, schema: S) => {
    const { data, issues } = parseYaml(readFileSync(file, "utf8"), schema, 1);
    fail(file, issues);
    return data ?? null;
  };
  /** Markery [[…]] w polach tekstowych YAML (nie przechodzą przez MDX) — ta sama kontrola kluczy. */
  const checkMarkers = (file: string, data: unknown) => {
    const issues: ContentIssue[] = [];
    const walk = (v: unknown, at: string) => {
      if (typeof v === "string") {
        for (const m of v.matchAll(MARKER_RE)) if (!resolveKey(m[1], sources)) issues.push({ message: `pole „${at}”: marker [[${m[0].slice(2, -2)}]] — klucz „${m[1]}” nie pasuje do żadnej karty ani hasła słownika` });
      } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, at ? `${at}.${i}` : String(i)));
      else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, at ? `${at}.${k}` : k);
    };
    walk(data, "");
    fail(file, issues);
  };
  const unexpected = (dir: string, f: string, want: string) => fail(path.join(dir, f), [{ message: `nieoczekiwany plik — w tym katalogu tylko ${want} (i README.md)` }]);

  const out: Content = { kody: [], slownik: [], lekcje: [], programy: [], zadania: [] };

  // ── karty kodów
  const kodyDir = path.join(root, "kody");
  const known = knownCodes(sources);
  for (const f of list(kodyDir)) {
    if (!f.endsWith(".mdx")) { unexpected(kodyDir, f, "<slug>.mdx"); continue; }
    const file = path.join(kodyDir, f);
    const r = readMdx(file, kodSchema);
    if (!r) continue;
    if (r.data.slug !== f.slice(0, -4)) fail(file, [{ message: `slug „${r.data.slug}” ≠ nazwa pliku „${f}”` }]);
    const self = selfCodes(r.data.code);
    const { code: body, meta } = await tryCompileMeta(file, r.body);
    // pola karty: auto-linki gołych kodów G/M jak CodeText
    const fields: Record<string, string> = {};
    const fieldTexts: [string, string][] = [
      ["short", r.data.short], ["desc", r.data.desc], ["sinumerik", r.data.sinumerik],
      ...r.data.params.map((p, i): [string, string] => [`params.${i}`, p.desc]),
      ...r.data.pitfalls.map((p, i): [string, string] => [`pitfalls.${i}`, p]),
    ];
    for (const [k, v] of fieldTexts) fields[k] = await tryCompile(`${file} (pole ${k})`, v, { autoCodes: { known, self } });
    out.kody.push({ file: rel(file), data: r.data, self, body, meta, fields });
  }

  // ── słownik
  const slownikDir = path.join(root, "slownik");
  for (const f of list(slownikDir)) {
    if (!f.endsWith(".yaml")) { unexpected(slownikDir, f, "<kotwica>.yaml"); continue; }
    const file = path.join(slownikDir, f);
    const data = readYaml(file, hasloSchema);
    if (!data) continue;
    if (data.anchor !== f.slice(0, -5)) fail(file, [{ message: `anchor „${data.anchor}” ≠ nazwa pliku „${f}”` }]);
    if (data.diagram && !diagramIds.has(data.diagram)) fail(file, [{ message: `diagram „${data.diagram}” — nie ma takiego rysunku w diagrams.tsx` }]);
    checkMarkers(file, data);
    out.slownik.push({ file: rel(file), data });
  }

  // ── lekcje: nauka/<tor>/<slug>/{index.mdx, cwiczenia.yaml}
  const naukaDir = path.join(root, "nauka");
  for (const tor of list(naukaDir)) {
    const torDir = path.join(naukaDir, tor);
    if (!(TORY as readonly string[]).includes(tor) || !statSync(torDir).isDirectory()) { unexpected(naukaDir, tor, `katalogi ${TORY.join(", ")}`); continue; }
    for (const dir of list(torDir)) {
      const lDir = path.join(torDir, dir);
      if (!statSync(lDir).isDirectory()) { unexpected(torDir, dir, "katalogi lekcji <slug>/"); continue; }
      for (const f of list(lDir)) if (f !== "index.mdx" && f !== "cwiczenia.yaml") unexpected(lDir, f, "index.mdx i cwiczenia.yaml");
      const index = path.join(lDir, "index.mdx"), cw = path.join(lDir, "cwiczenia.yaml");
      if (!existsSync(index)) { fail(lDir, [{ message: "brak index.mdx" }]); continue; }
      if (!existsSync(cw)) { fail(lDir, [{ message: "brak cwiczenia.yaml" }]); continue; }
      const r = readMdx(index, lekcjaSchema);
      const c = readYaml(cw, cwiczeniaSchema);
      if (!r || !c) continue;
      if (r.data.slug !== dir) fail(index, [{ message: `slug „${r.data.slug}” ≠ nazwa katalogu „${dir}”` }]);
      if (!r.data.id.startsWith(tor === "frezowanie" ? "F" : "T")) fail(index, [{ message: `id „${r.data.id}” nie pasuje do toru „${tor}” (F… frezowanie, T… toczenie)` }]);
      const figs = [...r.data.pitfalls.map((p) => p.fig), c.worked.fig, ...c.quiz.map((q) => ("fig" in q ? q.fig : undefined))];
      for (const fig of figs) if (fig && !diagramIds.has(fig)) fail(index, [{ message: `fig „${fig}” — nie ma takiego rysunku w diagrams.tsx` }]);
      checkMarkers(index, r.data);
      checkMarkers(cw, c);
      const body = await tryCompile(index, r.body);
      out.lekcje.push({ file: rel(index), tor: tor as LekcjaEntry["tor"], data: r.data, body, cwiczenia: c });
    }
  }

  // ── programy: <slug>.mdx + <slug>.nc
  const progDir = path.join(root, "programy");
  for (const f of list(progDir)) {
    if (f.endsWith(".nc")) { if (!existsSync(path.join(progDir, f.slice(0, -3) + ".mdx"))) fail(path.join(progDir, f), [{ message: "plik .nc bez pliku .mdx o tej samej nazwie" }]); continue; }
    if (!f.endsWith(".mdx")) { unexpected(progDir, f, "<slug>.mdx i <slug>.nc"); continue; }
    const file = path.join(progDir, f);
    const r = readMdx(file, programSchema);
    if (!r) continue;
    const s = f.slice(0, -4);
    if (r.data.slug !== s) fail(file, [{ message: `slug „${r.data.slug}” ≠ nazwa pliku „${f}”` }]);
    let nc: string | null = null;
    if (r.data.src) {
      if (r.data.src !== `./${s}.nc`) fail(file, [{ message: `src „${r.data.src}” — oczekiwano „./${s}.nc”` }]);
      const ncFile = path.join(progDir, r.data.src);
      if (existsSync(ncFile)) nc = readFileSync(ncFile, "utf8"); else fail(file, [{ message: `brak pliku ${r.data.src}` }]);
    }
    for (const op of r.data.ops) if (!r.data.tools[String(op.t)]) fail(file, [{ message: `ops: narzędzie T${op.t} nie ma wpisu w tools` }]);
    checkMarkers(file, r.data);
    const body = await tryCompile(file, r.body);
    out.programy.push({ file: rel(file), data: r.data, body, nc });
  }

  // ── zadania
  const zadDir = path.join(root, "zadania");
  for (const f of list(zadDir)) {
    if (!f.endsWith(".yaml")) { unexpected(zadDir, f, "<slug>.yaml"); continue; }
    const file = path.join(zadDir, f);
    const data = readYaml(file, zadanieSchema);
    if (!data) continue;
    if (data.slug !== f.slice(0, -5)) fail(file, [{ message: `slug „${data.slug}” ≠ nazwa pliku „${f}”` }]);
    checkMarkers(file, data);
    out.zadania.push({ file: rel(file), data });
  }

  // ── odwołania między plikami (karty: nowe ∪ dzisiejsze, bo migracja idzie partiami)
  const kodSlugs = new Set([...sources.gcodes.map((g) => g.slug), ...out.kody.map((k) => k.data.slug)]);
  const dup = <T,>(items: T[], key: (t: T) => string, file: (t: T) => string, what: string) => {
    const seen = new Map<string, string>();
    for (const t of items) { const k = key(t); if (seen.has(k)) fail(file(t), [{ message: `${what} „${k}” powtarza się (także w ${seen.get(k)})` }]); else seen.set(k, file(t)); }
  };
  dup(out.lekcje, (l) => l.data.slug, (l) => l.file, "slug lekcji");
  dup(out.lekcje, (l) => l.data.id, (l) => l.file, "id lekcji");
  dup(out.programy.flatMap((p) => [p.data.slug, ...p.data.redirectsFrom].map((s) => ({ s, file: p.file }))), (x) => x.s, (x) => x.file, "adres programu");
  for (const k of out.kody) for (const r of k.data.related) if (!kodSlugs.has(r)) fail(k.file, [{ message: `related: nie ma karty „${r}”` }]);
  for (const h of out.slownik) for (const r of h.data.see) if (!kodSlugs.has(r)) fail(h.file, [{ message: `see: nie ma karty „${r}”` }]);
  for (const l of out.lekcje) for (const r of l.data.codes) if (!kodSlugs.has(r)) fail(l.file, [{ message: `codes: nie ma karty „${r}”` }]);

  if (errors.length) throw new ContentErrors(errors);
  return out;
}
