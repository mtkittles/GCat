import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/*
  Standard treści (docs/standard-ui.md, „Podpis rysunku”): podpis 1–2 zdania.
  Liczy zdania w `caption` każdego `Fig` w plikach figs*.tsx.
*/
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /^figs.*\.tsx$/.test(f) ? [p] : [];
  });

export function sentences(jsx: string): string[] {
  const t = jsx
    .replace(/\{" "\}/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\{[^{}]*\}/g, "X")
    // skróty i liczby z kropką nie kończą zdania
    .replace(/\b(np|tzw|m\.in|ok|wg|tj|itd|itp|maks|nr|rys|por|zob|śr)\./g, "$1§")
    .replace(/(\d)\.(\d)/g, "$1§$2")
    // adres z kropką w zapisie programu: „X0. Y0.”, „X35. daje”
    .replace(/(\b[A-Z]−?\d+)\.(?=\s+(?:[A-Z]−?\d|[a-ząćęłńóśźż]))/g, "$1§")
    .trim();
  return t.split(/(?<=[.!?])\s+(?=[A-ZĄĆĘŁŃÓŚŹŻ0-9„(⌀*+|])/).filter((s) => s.trim());
}

const captions = files("src/components").flatMap((f) => {
  const src = readFileSync(f, "utf8");
  const out: { at: string; n: number }[] = [];
  for (const m of src.matchAll(/caption=\{<>([\s\S]*?)<\/>\}|caption="([^"]*)"/g)) {
    const line = src.slice(0, m.index).split("\n").length;
    out.push({ at: `${f}:${line}`, n: sentences(m[1] ?? m[2]).length });
  }
  return out;
});

describe("podpisy rysunków", () => {
  it("licznik zdań nie myli adresów programu z końcem zdania", () => {
    expect(sentences("<b>G52 X0. Y0.</b> wraca do zera G54.")).toHaveLength(1);
    expect(sentences("Ten sam blok G01 X35. daje rowek. Kąt R liczy się od osi X.")).toHaveLength(2);
    expect(sentences("Głębokość ok. 0,5 mm. Drugie. Trzecie.")).toHaveLength(3);
  });

  it("każdy podpis w figs*.tsx ma 1–2 zdania", () => {
    expect(captions.length).toBeGreaterThan(150);
    expect(captions.filter((c) => c.n > 2).map((c) => `${c.at} (${c.n})`)).toEqual([]);
  });
});
