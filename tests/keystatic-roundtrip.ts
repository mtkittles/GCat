/*
  Round-trip pliku treści przez Keystatic: dokładnie te kroki, które wykonuje panel przy otwarciu i zapisie wpisu
  (@keystatic/core 0.6.9, keystatic-core-ui.js: parseEntry → loadDataFile + parseProps; serializeEntryToFiles →
  serializeProps + js-yaml dump + „---” + treść). Funkcje parseProps/serializeProps/object pochodzą z wewnętrznego
  modułu Keystatic (wersja przypięta w package.json); wymaga środowiska z DOM (happy-dom) i przeglądarkowej wersji pakietu.
*/
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { dump, load } from "js-yaml";

const KS = path.resolve("node_modules/@keystatic/core/dist");
const enc = new TextEncoder(), dec = new TextDecoder();

/** Pliki z katalogów obrazów komponentów (`<katalog>/<slug>/…`) — jak getFilesForAssetsOrContentField w panelu. */
function plikiObrazow(dirs: string[], slug: string) {
  const out = new Map<string, Map<string, Uint8Array>>();
  for (const dir of dirs) {
    const start = `${dir}/${slug}`;
    if (!existsSync(start)) continue;
    const files = new Map(readdirSync(start).map((f) => [f, new Uint8Array(readFileSync(`${start}/${f}`))] as const));
    if (files.size) out.set(dir, files);
  }
  return out;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function roundtripEntry(cfg: any, collection: string, slug: string, raw: string): Promise<string> {
  const { p: parseProps, c: serializeProps } = await import(/* @vite-ignore */ `${KS}/index-3c244051.js`);
  const { o: object } = await import(/* @vite-ignore */ `${KS}/index-5d64e651.js`);
  const c = cfg.collections[collection];
  const contentField = c.format?.contentField;
  let loaded: unknown, content: Uint8Array | undefined;
  if (contentField) {
    // splitFrontmatter z Keystatic (required-files-*.js)
    const m = raw.match(/^---(?:\r?\n([^]*?))?\r?\n---\r?\n?/);
    if (!m) throw new Error("brak frontmattera");
    loaded = load(m[1] ?? "");
    content = enc.encode(raw.slice(m[0].length));
  } else loaded = load(raw);
  const root = object(c.schema);
  const state = parseProps(root, loaded, [], [], (schema: any, value: unknown, p: string[]) => {
    if (p.length === 1 && p[0] === c.slugField) return schema.parse(value, { slug });
    if (schema.formKind === "content") return schema.parse(value, { content, other: new Map(), external: plikiObrazow(schema.directories ?? [], slug), slug });
    if (schema.formKind === "asset") return schema.parse(value, { asset: undefined, slug });
    return schema.parse(value, undefined);
  }, false);
  const { value, extraFiles } = serializeProps(state, root, c.slugField, slug, true);
  const data = dump(value);
  if (!contentField) return data;
  const body = extraFiles.find((f: any) => f.path === `${contentField}.mdx`);
  if (!body) throw new Error("brak treści po zapisie");
  return `---\n${data}---\n${dec.decode(body.contents)}`;
}
