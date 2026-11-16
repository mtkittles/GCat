import { compileContentMeta, type CompileOptions } from "@/lib/mdx/compile";
import { liveSources } from "@/lib/mdx/live";
import { componentNames, diagramIds } from "@/lib/mdx/names";
import { ContentError, type GcatMeta } from "@/lib/mdx/remark";
import { knownCodes, selfCodes } from "@/lib/mdx/resolve";
import { kodSchema, type Kod } from "@/lib/mdx/schema";
import { splitFile } from "./plik";

/*
  Sprawdzenie pliku treści przed zapisem — te same reguły co `npm run tresci` przy buildzie (schemat pól,
  kotwice, markery [[…]], dozwolone komponenty), żeby publikacja z edytora nie mogła zepsuć builda.
  Działa w przeglądarce (podgląd błędów na bieżąco) i w API (ostatnia kontrola przed commitem).
*/

export interface Problem { where: string; message: string; line?: number }
export const SCIEZKI: { re: RegExp; kind: "kod" }[] = [{ re: /^content\/kody\/([a-z0-9]+(?:-[a-z0-9]+)*)\.mdx$/, kind: "kod" }];
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
