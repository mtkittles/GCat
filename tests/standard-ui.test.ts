/*
  Standard UI (docs/standard-ui.md) — pilnuje, żeby do arkuszy nie wracały surowe rozmiary czcionek,
  promienie spoza skali i systemowy monospace na kanwie symulatora.
*/
import { readFileSync, readdirSync } from "node:fs";
import postcss from "postcss";
import { describe, expect, it } from "vitest";
import { mono, monoFamily } from "@/components/simulator/canvasFont";

const CSS = readdirSync("src/app").filter((f) => f.endsWith(".css")).map((f) => `src/app/${f}`);
// Wyjątki: napisy w SVG (jednostki rysunku), miniatury podglądów obszarów (.pv-*), certyfikat do druku.
const EXEMPT = /svg|\btext\b|\.pv-|\.pp\b|\.cert|wordmark/;
const SIZE_OK = /^(var\(--fs-[a-z0-9]+\)|inherit|0|1em|\.875em|max\(var\(--fs-label\), round\(\.875em, 1px\)\))$/;

function decls(prop: RegExp) {
  const out: { file: string; sel: string; value: string }[] = [];
  for (const file of CSS) {
    postcss.parse(readFileSync(file, "utf8")).walkDecls(prop, (d) => {
      const parent = d.parent as postcss.Rule;
      if (parent.parent?.type === "atrule" && /keyframes/.test((parent.parent as postcss.AtRule).name)) return;
      out.push({ file, sel: parent.selector ?? "", value: d.value.trim() });
    });
  }
  return out;
}

describe("standard UI — typografia", () => {
  it("rozmiary czcionek tylko z tokenów --fs-*", () => {
    const bad = decls(/^font(-size)?$/)
      .filter((d) => !EXEMPT.test(d.sel))
      .map((d) => ({ ...d, size: /^font-size/.test(d.value) ? d.value : (d.value.match(/(?:^|\s)((?:[\d.]+(?:px|rem|em))|var\(--fs-[a-z0-9]+\)|clamp\([^)]*\)|max\(.*\))(?=\/|\s|$)/) ?? [])[1] }))
      .filter((d) => d.size && !SIZE_OK.test(d.size) && !SIZE_OK.test(d.value))
      .map((d) => `${d.file} ${d.sel} → ${d.value}`);
    expect(bad).toEqual([]);
  });

  it("treść lekcji ma jeden rozmiar z resztą tekstu", () => {
    const g = readFileSync("src/app/globals.css", "utf8");
    expect(g).toMatch(/--fs-lesson: 1rem;/);
    expect(g).not.toMatch(/\.ls-main \.article p[^{]*\{[^}]*--fs-h3/);
  });

  it("kanwa symulatora używa --font-mono, nie fontu systemowego", () => {
    for (const f of ["Simulator.tsx", "Sim3D.tsx", "measure2d.ts", "unrolled.ts"]) {
      expect(readFileSync(`src/components/simulator/${f}`, "utf8"), f).not.toMatch(/"[^"]*ui-monospace/);
    }
    expect(mono(11)).toBe(`11px ${monoFamily()}`);
    expect(mono(12, 600)).toBe(`600 12px ${monoFamily()}`);
    expect(monoFamily()).toContain("monospace");
  });
});

describe("standard UI — szkielet podstron (UI-6)", () => {
  const LIST = ["src/app/nauka/page.tsx", "src/components/lesson/TrackPage.tsx", "src/app/kody/page.tsx", "src/app/programy/page.tsx",
    "src/app/zadania/ExerciseList.tsx", "src/app/slownik/Glossary.tsx", "src/app/technologia/page.tsx", "src/app/technologia/[dzial]/page.tsx",
    "src/app/fiszki/Flashcards.tsx", "src/app/kalkulator/Calc.tsx", "src/app/szukaj/Results.tsx", "src/app/nauka/start/page.tsx", "src/app/konto/Account.tsx"];
  it("podstrony mają wspólny nagłówek PageHead, bez napisu nad tytułem i bez zdjęcia", () => {
    for (const f of LIST) {
      const t = readFileSync(f, "utf8");
      expect(t, f).toContain("<PageHead");
      expect(t, f).not.toMatch(/className="ph-k"|hero-kicker|<PageBanner/);
    }
  });
  it("etykiety grup i kart bez wersalików", () => {
    const css = CSS.map((f) => readFileSync(f, "utf8")).join("\n");
    for (const sel of [".kc-h", ".cp-k", ".tech-k", ".tc-k", ".ob-meta", ".zx-state", ".pg-meta", ".s7-cta-k", ".eyebrow", ".banner-kicker", ".acct-stats span"]) {
      const re = new RegExp(`(^|\\n)${sel.replace(/[.]/g, "\\.")}[^{,]*\\{[^}]*text-transform: uppercase`);
      expect(re.test(css), sel).toBe(false);
    }
  });
  it("wybrany filtr i pole szukania bez pomarańczu", () => {
    const t = readFileSync("src/app/tactile.css", "utf8");
    expect(t).toMatch(/\.pill-f\[aria-pressed="true"\] \{ background: var\(--surface-2\)/);
    expect(t).toMatch(/\.kc-search, \.tech-search-box \{[^}]*height: 44px[^}]*border-radius: 999px/);
  });
});

describe("standard UI — telefon", () => {
  it("dok węższy niż 90% ekranu — Safari 26 nie maluje pod nim jednolitego pasa", () => {
    // WebKit fixedContainerEdges: element stały przy krawędzi o szerokości < 0,9 × (widok − 8 px) jest pomijany.
    const t = readFileSync("src/app/tactile.css", "utf8");
    const m = t.match(/--dock-inset: max\((\d+(?:\.\d+)?)vw/);
    expect(m).not.toBeNull();
    for (const w of [320, 360, 390, 430, 767]) {
      const dock = Math.min(w - 2 * (Number(m![1]) / 100) * w, 420);
      expect(dock, `${w}px`).toBeLessThan(0.9 * (w - 8) * 0.99);
    }
  });
});

describe("standard UI — kształt", () => {
  it("promienie zaokrągleń z tokenów (poza drobnymi detalami ≤ 5 px)", () => {
    const bad = decls(/^border-radius$/)
      .filter((d) => !/dock|vd-|sheet|\.cert|svg|::-webkit|thumb|track|\.pv-|led/.test(d.sel))
      .filter((d) => !/^(var\(--radius(-sm|-lg)?\)|999px|50%|0|inherit|[1-5](\.5)?px)$/.test(d.value) && !/\s/.test(d.value))
      .map((d) => `${d.file} ${d.sel} → ${d.value}`);
    expect(bad).toEqual([]);
  });
});
