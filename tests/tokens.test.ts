import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { allTokens, cssVars, simulatorDuplicates } from "@/design/tokens";
import { renderCss } from "../scripts/tokeny";

/*
  Trzy źródła muszą się zgadzać: src/design/tokens.css == src/design/tokens.ts == obecne wartości
  w src/app/globals.css (oraz fig.tsx i layout.tsx dla rysunków i fontów). globals.css nie jest zmieniany.
*/

const read = (f: string) => readFileSync(f, "utf8");
const norm = (v: string) => v.replace(/\s+/g, " ").trim();
const noComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Wszystkie najgłębsze reguły: [selektor, deklaracje]. */
function rules(css: string): [string, string][] {
  return [...noComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [norm(m[1].split(";").pop()!), m[2]]);
}
function decls(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const d of body.split(";")) { const i = d.indexOf(":"); if (i > 0) out[d.slice(0, i).trim()] = norm(d.slice(i + 1)); }
  return out;
}
function block(css: string, sel: string): Record<string, string> {
  return Object.assign({}, ...rules(css).filter(([s]) => s === sel).map(([, b]) => decls(b)));
}

const globals = read("src/app/globals.css");
const gRoot = block(globals, ":root");
const gDark = block(globals, '[data-theme="dark"]');

describe("tokeny stylu", () => {
  it("tokens.css jest wygenerowany z tokens.ts (npm run tokeny)", () => {
    expect(read("src/design/tokens.css")).toBe(renderCss());
    const { light, dark } = cssVars();
    expect(block(read("src/design/tokens.css"), ":root")).toEqual(light);
    expect(block(read("src/design/tokens.css"), '[data-theme="dark"]')).toEqual(dark);
  });

  it("nazwy tokenów są unikalne", () => {
    const names = allTokens.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  for (const t of allTokens) {
    it(`${t.name} = obecna wartość (${t.src.kind})`, () => {
      const s = t.src;
      if (s.kind === "var") {
        expect(gRoot[t.name], "jasny motyw w globals.css").toBe(t.value);
        if (t.dark !== undefined) expect(gDark[t.name], "ciemny motyw w globals.css").toBe(t.dark);
        else expect(gDark[t.name], "ciemny motyw nie nadpisuje — dziedziczy").toBeUndefined();
      } else if (s.kind === "same") {
        expect(gRoot[s.as]).toBe(t.value);
      } else if (s.kind === "rule") {
        const b = block(globals, s.sel);
        expect(b[s.prop], `${s.sel} { ${s.prop} }`).toBeDefined();
        // border-top: 2.5px solid → pierwsza wartość
        expect(b[s.prop].split(" ").slice(0, t.value.split(" ").length).join(" ")).toBe(t.value);
      } else if (s.kind === "file") {
        const m = read(s.file).match(new RegExp(s.re));
        expect(m, `${s.file}: ${s.re}`).not.toBeNull();
        expect(norm(m![1].replace(/["',]/g, " "))).toBe(t.value);
      } else {
        const n = [...noComments(globals).matchAll(new RegExp(`${s.prop}\\s*:\\s*([^;{}]+);`, "g"))]
          .filter((m) => m[1].split(/\s+/).includes(t.value)).length;
        expect(n, `${t.value} w ${s.prop}`).toBeGreaterThanOrEqual(s.min);
      }
    });
  }

  it("lista „do ujednolicenia później” odpowiada kodowi symulatora (tylko odczyt)", () => {
    for (const d of simulatorDuplicates) {
      const files = d.file.split(",").map((f) => f.trim()).map((f) => (f.startsWith("src/") ? f : `src/components/simulator/${f}`));
      const text = files.map(read).join("\n").toLowerCase();
      expect(text, `${d.what} w ${d.file}`).toContain(d.value.toLowerCase());
    }
  });
});
