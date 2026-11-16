import { Document, isMap, isScalar, parseDocument, Scalar, visit, type Pair } from "yaml";

/*
  Plik treści: frontmatter YAML (MDX) albo cały plik YAML. Zmiana pola podmienia w tekście tylko jego fragment
  (klucz najwyższego poziomu) — pozostałe pola, komentarze i formatowanie zostają bajt w bajt.
  Styl nowych wartości jak w zapisie Keystatic: długi tekst `>-`, tekst wielowierszowy `|-`.
*/

export type Data = Record<string, unknown>;
export interface Plik {
  /** "mdx": ---\nYAML---\ntreść; "yaml": cały plik to YAML */
  kind: "mdx" | "yaml";
  yaml: string;
  data: Data;
  body: string;
}

const FM = /^---\r?\n([\s\S]*?\r?\n)?---\r?\n?/;

export function splitFile(src: string, kind: "mdx" | "yaml" = "mdx"): Plik {
  if (kind === "yaml") return { kind, yaml: src, data: (parseDocument(src).toJS() ?? {}) as Data, body: "" };
  const m = src.match(FM);
  if (!m) return { kind, yaml: "", data: {}, body: src };
  const yaml = m[1] ?? "";
  return { kind, yaml, data: (parseDocument(yaml).toJS() ?? {}) as Data, body: src.slice(m[0].length) };
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Jedno pole jako YAML (klucz: wartość\n) w stylu zapisu Keystatic. */
export function pairYaml(key: string, value: unknown): string {
  const d = new Document({ [key]: value });
  visit(d, {
    Scalar(_k, n: Scalar) {
      if (typeof n.value !== "string") return;
      if (n.value.includes("\n")) n.type = Scalar.BLOCK_LITERAL;
      else if (n.value.length > 72) n.type = Scalar.BLOCK_FOLDED;
    },
  });
  return d.toString({ lineWidth: 80, minContentWidth: 20 });
}

/** Nowy tekst YAML: zmienione pola podmienione w miejscu, nowe dopisane na końcu, usunięte wycięte. */
export function updateYaml(yaml: string, before: Data, after: Data): string {
  if (same(before, after)) return yaml;
  const doc = parseDocument(yaml);
  if (!isMap(doc.contents)) return Object.entries(after).map(([k, v]) => pairYaml(k, v)).join("");
  const items = doc.contents.items as Pair[];
  // granice pól: od początku linii klucza do początku linii następnego klucza
  const lineStart = (i: number) => yaml.lastIndexOf("\n", i - 1) + 1;
  const spans = items.map((p, i) => {
    const key = isScalar(p.key) ? String(p.key.value) : String(p.key);
    const a = lineStart((p.key as Scalar).range![0]);
    const b = i + 1 < items.length ? lineStart((items[i + 1].key as Scalar).range![0]) : yaml.length;
    return { key, a, b };
  });
  let out = "";
  let pos = 0;
  for (const s of spans) {
    out += yaml.slice(pos, s.a);
    if (!(s.key in after)) { pos = s.b; continue; }
    if (same(before[s.key], after[s.key])) out += yaml.slice(s.a, s.b);
    else {
      const text = yaml.slice(s.a, s.b);
      const trailing = text.match(/\n*$/)?.[0] ?? "";
      out += pairYaml(s.key, after[s.key]).replace(/\n$/, "") + (trailing || "\n");
    }
    pos = s.b;
  }
  out += yaml.slice(pos);
  const known = new Set(spans.map((s) => s.key));
  for (const [k, v] of Object.entries(after)) if (!known.has(k) && v !== undefined) out += (out.endsWith("\n") || !out ? "" : "\n") + pairYaml(k, v);
  return out;
}

/** Złożenie pliku z (zmienionymi) danymi i treścią. */
export function joinFile(f: Plik, data: Data, body: string = f.body): string {
  const yaml = updateYaml(f.yaml, f.data, data);
  if (f.kind === "yaml") return yaml;
  return `---\n${yaml}---\n${body}`;
}
