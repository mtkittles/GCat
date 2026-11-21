import { compileContentMeta, type CompileOptions } from "@/lib/mdx/compile";
import { liveSources } from "@/lib/mdx/live";
import { componentNames, diagramIds } from "@/lib/mdx/names";
import { ContentError, MARKER_RE, type GcatMeta } from "@/lib/mdx/remark";
import { knownCodes, resolveKey, selfCodes } from "@/lib/mdx/resolve";
import { artykulSchema, hasloSchema, kodSchema, rysunekSchema, type Artykul, type Kod } from "@/lib/mdx/schema";
import { glossary } from "@/lib/content";
import { sources as SOURCES } from "@/content/nauka/sources";
import { artykuly, dzialy, lekcje } from "@/lib/technologia";
import { parseDoc, storeDoc } from "@/lib/rys/model";
import { splitFile } from "./plik";
import { checkImage, IMG_RE } from "./rysunek";

/*
  Sprawdzenie pliku treści przed zapisem — te same reguły co `npm run tresci` przy buildzie (schemat pól,
  kotwice, markery [[…]], dozwolone komponenty), żeby publikacja z edytora nie mogła zepsuć builda.
  Działa w przeglądarce (podgląd błędów na bieżąco) i w API (ostatnia kontrola przed commitem).
*/

export interface Problem { where: string; message: string; line?: number }
export type Rodzaj = "kod" | "haslo" | "rysunek" | "obraz" | "artykul";
export const SCIEZKI: { re: RegExp; kind: Rodzaj }[] = [
  { re: /^content\/kody\/([a-z0-9]+(?:-[a-z0-9]+)*)\.mdx$/, kind: "kod" },
  { re: /^content\/slownik\/([\p{Ll}\p{N}-]+)\.yaml$/u, kind: "haslo" },
  { re: /^content\/rysunki\/([a-z0-9]+(?:-[a-z0-9]+)*)\.yaml$/, kind: "rysunek" },
  { re: IMG_RE, kind: "obraz" },
  /** artykuł Technologii: content/technologia/<dział>/<slug>.mdx */
  { re: /^content\/technologia\/([a-z0-9]+(?:-[a-z0-9]+)*)\/([a-z0-9]+(?:-[a-z0-9]+)*)\.mdx$/, kind: "artykul" },
];
export const ARTYKUL_RE = SCIEZKI[4].re;
export const rodzaj = (path: string) => SCIEZKI.find((s) => s.re.test(path));

export interface Wynik { problems: Problem[]; data?: Kod; meta?: GcatMeta; code?: string }

/** Karta kodu: content/kody/<slug>.mdx. `publicFile` — kontrola plików <Obraz> (serwer); w przeglądarce pomijana. */
export async function sprawdzKarte(path: string, text: string, o: Pick<CompileOptions, "publicFile" | "rysIds"> = {}): Promise<Wynik> {
  const problems: Problem[] = [];
  const slug = path.match(SCIEZKI[0].re)?.[1];
  const f = splitFile(text);
  const parsed = kodSchema.safeParse(f.data);
  if (!parsed.success) for (const i of parsed.error.issues) problems.push({ where: i.path.join(".") || "plik", message: i.message });
  const data = parsed.success ? parsed.data : undefined;
  if (data && slug && data.slug !== slug) problems.push({ where: "slug", message: `slug „${data.slug}” ≠ nazwa pliku „${slug}.mdx”` });
  const base = { file: path, sources: liveSources, components: componentNames, diagramIds, ...o };
  let meta: GcatMeta | undefined, code: string | undefined;
  const catchIssues = (where: string, e: unknown) => {
    if (e instanceof ContentError) for (const i of e.issues) problems.push({ where, message: i.message, line: i.line });
    else problems.push({ where, message: e instanceof Error ? e.message : String(e) });
  };
  try { ({ meta, code } = await compileContentMeta(f.body, base)); } catch (e) { catchIssues("treść", e); }
  if (data) {
    const auto = { known: knownCodes(liveSources), self: selfCodes(data.code) };
    const fields: [string, string][] = [
      ["krótki opis", data.short], ["opis", data.desc], ["Sinumerik", data.sinumerik],
      ...data.params.map((p, i): [string, string] => [`adres ${i + 1}`, p.desc]),
      ...data.pitfalls.map((p, i): [string, string] => [`na co uważać ${i + 1}`, p]),
    ];
    for (const [where, v] of fields) {
      try { await compileContentMeta(v, { ...base, file: `${path} (${where})`, autoCodes: auto }); } catch (e) { catchIssues(where, e); }
    }
  }
  return { problems, data, meta, code };
}

export interface WynikArtykulu { problems: Problem[]; data?: Artykul; meta?: GcatMeta }

/** Artykuł Technologii: content/technologia/<dział>/<slug>.mdx — schemat, dział, powiązania, źródła, treść (jak loader). */
export async function sprawdzArtykul(path: string, text: string, o: Pick<CompileOptions, "publicFile" | "rysIds"> = {}): Promise<WynikArtykulu> {
  const problems: Problem[] = [];
  const m = path.match(ARTYKUL_RE);
  const f = splitFile(text);
  const parsed = artykulSchema.safeParse(f.data);
  if (!parsed.success) problems.push(...zodProblems(parsed.error.issues));
  const data = parsed.success ? parsed.data : undefined;
  if (data && m) {
    if (data.slug !== m[2]) problems.push({ where: "slug", message: `slug „${data.slug}” ≠ nazwa pliku „${m[2]}.mdx”` });
    if (data.dzial !== m[1]) problems.push({ where: "dzial", message: `dział „${data.dzial}” ≠ katalog „${m[1]}”` });
  }
  if (data) {
    if (!dzialy.some((d) => d.slug === data.dzial)) problems.push({ where: "dzial", message: `nie ma działu „${data.dzial}” w content/technologia/dzialy.yaml` });
    const p = data.powiazane, self = `${data.dzial}/${data.slug}`;
    for (const k of p.kody) if (!liveSources.gcodes.some((g) => g.slug === k)) problems.push({ where: "powiązane kody", message: `nie ma karty „${k}”` });
    for (const h of p.hasla) if (!glossary.some((g) => g.anchor === h)) problems.push({ where: "powiązane hasła", message: `nie ma hasła „${h}”` });
    for (const l of p.lekcje) if (!lekcje.some((x) => x.id === l)) problems.push({ where: "powiązane lekcje", message: `nie ma gotowej lekcji „${l}”` });
    for (const x of p.artykuly) if (x === self || !artykuly.some((a) => a.key === x)) problems.push({ where: "powiązane artykuły", message: x === self ? "artykuł wskazuje sam siebie" : `nie ma artykułu „${x}”` });
    data.sources.forEach((s, i) => { if (!SOURCES[s.id]) problems.push({ where: `źródło ${i + 1}`, message: `nie ma źródła „${s.id}” w rejestrze (src/content/nauka/sources.ts)` }); });
    markers(data, problems);
  }
  let meta: GcatMeta | undefined;
  try { ({ meta } = await compileContentMeta(f.body, { file: path, sources: liveSources, components: componentNames, diagramIds, ...o })); } catch (e) {
    if (e instanceof ContentError) for (const i of e.issues) problems.push({ where: "treść", message: i.message, line: i.line });
    else problems.push({ where: "treść", message: e instanceof Error ? e.message : String(e) });
  }
  return { problems, data, meta };
}

/** Markery [[…]] we wszystkich polach tekstowych (jak checkMarkers w loaderze). */
function markers(data: unknown, problems: Problem[]) {
  const walk = (v: unknown, at: string) => {
    if (typeof v === "string") { for (const m of v.matchAll(MARKER_RE)) if (!resolveKey(m[1], liveSources)) problems.push({ where: at || "plik", message: `odnośnik [[${m[0].slice(2, -2)}]] — nie ma takiej karty ani hasła` }); }
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, at ? `${at}.${i + 1}` : String(i + 1)));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, at ? `${at}.${k}` : k);
  };
  walk(data, "");
}
const zodProblems = (issues: { path: PropertyKey[]; message: string }[]): Problem[] => issues.map((i) => ({ where: i.path.join(".") || "plik", message: i.message }));

/** Hasło słownika: content/slownik/<kotwica>.yaml (te same reguły co loader). */
export function sprawdzHaslo(path: string, text: string, o: { rysIds?: Set<string> } = {}): Problem[] {
  const problems: Problem[] = [];
  const anchor = path.match(SCIEZKI[1].re)?.[1];
  const r = hasloSchema.safeParse(splitFile(text, "yaml").data);
  if (!r.success) return zodProblems(r.error.issues);
  if (anchor && r.data.anchor !== anchor) problems.push({ where: "anchor", message: `kotwica „${r.data.anchor}” ≠ nazwa pliku „${anchor}.yaml”` });
  if (r.data.diagram && !diagramIds.has(r.data.diagram)) problems.push({ where: "diagram", message: `nie ma rysunku „${r.data.diagram}” w bibliotece strony` });
  if (r.data.rysunek && o.rysIds && !o.rysIds.has(r.data.rysunek)) problems.push({ where: "rysunek", message: `nie ma rysunku content/rysunki/${r.data.rysunek}.yaml` });
  markers(r.data, problems);
  return problems;
}

/** Rysunek z rysownika: content/rysunki/<slug>.yaml. */
export function sprawdzRysunek(path: string, text: string): Problem[] {
  const r = rysunekSchema.safeParse(splitFile(text, "yaml").data);
  if (!r.success) return zodProblems(r.error.issues);
  const problems: Problem[] = [];
  if (JSON.stringify(storeDoc(parseDoc(r.data.rys))) !== JSON.stringify(r.data.rys)) problems.push({ where: "rys", message: "zapis rysunku inny niż z rysownika" });
  markers({ podpis: r.data.caption }, problems);
  return problems;
}

/** Obraz w public/rysunki/: rozszerzenie, sygnatura pliku, rozmiar, SVG bez skryptów. */
export function sprawdzObraz(path: string, bytes: Uint8Array): Problem[] {
  const ext = path.split(".").pop()!.toLowerCase();
  const bad = checkImage(ext, bytes);
  return bad ? [{ where: path.split("/").pop()!, message: bad }] : [];
}
