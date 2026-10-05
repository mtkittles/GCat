/* Generuje z src/design/tokens.ts:
   • src/design/tokens.css   — zmienne CSS (motyw jasny i ciemny),
   • docs/tokeny.md          — tabela token → wartość → gdzie używany, z podglądem kolorów,
   • docs/tokeny/*.svg       — próbki kolorów do podglądu w docs/tokeny.md,
   • docs/tokeny.json        — tokeny w formacie W3C Design Tokens (import do Figmy, np. Tokens Studio).
   Uruchom: npm run tokeny. Test tests/tokens.test.ts sprawdza, że tokens.css jest aktualny. */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { allTokens, cssVars, groups, simulatorDuplicates, type Token } from "../src/design/tokens";

export function renderCss(): string {
  const { light, dark } = cssVars();
  const lines = (m: Record<string, string>) => Object.entries(m).map(([k, v]) => `  ${k}: ${v};`).join("\n");
  return `/* Wygenerowane z src/design/tokens.ts (npm run tokeny) — nie edytuj ręcznie.
   Etap 1: plik NIE jest importowany; globals.css bez zmian. Wartości = obecne wartości globals.css. */

:root {
${lines(light)}
}

[data-theme="dark"] {
${lines(dark)}
}
`;
}

const isColor = (v: string) => /^#[0-9A-F]{6}$/i.test(v);
const sw = (v: string) => `tokeny/${v.slice(1).toUpperCase()}.svg`;
const swatch = (v: string) => (isColor(v) ? `![${v}](${sw(v)}) ` : "");
const cell = (v: string) => `${swatch(v)}\`${v}\``;
const esc = (s: string) => s.replace(/\|/g, "\\|");

function render(): string {
  const out: string[] = [
    "# Tokeny stylu GCat",
    "",
    "Wygenerowane z `src/design/tokens.ts` (`npm run tokeny`) — nie edytuj ręcznie.",
    "",
    "**Stan:** etap 1 (sprint 7b). Tokeny opisują obecne wartości 1:1. `globals.css` jest bez zmian, a `src/design/tokens.css` nie jest jeszcze nigdzie importowany. Test `tests/tokens.test.ts` pilnuje zgodności: `tokens.css` = `tokens.ts` = obecne `globals.css`, a dla rysunków także `fig.tsx` i `layout.tsx`.",
    "",
    "**Figma:**",
    "- `docs/tokeny.json` to eksport w formacie W3C Design Tokens; wczytuje go np. wtyczka Tokens Studio.",
    "- Kolory z kolumny „Wartość” to style jasne, z kolumny „Ciemny” — ciemne.",
    "- Grubości linii rysunków są w jednostkach `viewBox` (szerokość 360). W Figmie przy ramce 360 px to te same piksele.",
    "",
  ];
  for (const g of groups) {
    out.push(`## ${g.title}`, "");
    for (const sub of g.groups) {
      out.push(`### ${sub.title}`, "");
      const hasDark = sub.tokens.some((t) => t.dark !== undefined);
      out.push(hasDark ? "| Token | Wartość (jasny) | Ciemny | Gdzie używany |" : "| Token | Wartość | Gdzie używany |");
      out.push(hasDark ? "|---|---|---|---|" : "|---|---|---|");
      for (const t of sub.tokens) {
        const row = [`\`${t.name}\``, cell(t.value)];
        if (hasDark) row.push(t.dark !== undefined ? cell(t.dark) : "— (jak jasny)");
        row.push(esc(t.use) + srcNote(t));
        out.push(`| ${row.join(" | ")} |`);
      }
      out.push("");
    }
  }
  out.push(
    "## Do ujednolicenia później — tylko za zgodą",
    "",
    "Symulator jest **nietykalny**. Poniższe wartości są wpisane w jego kod obok tokenów. Nie są deduplikowane w tym kroku; ujednolicenie (import z `tokens.ts`) wymaga osobnej zgody.",
    "",
    "| Co | Wartość | Plik | Odpowiada tokenowi |",
    "|---|---|---|---|",
    ...simulatorDuplicates.map((d) => `| ${esc(d.what)} | ${cell(d.value.startsWith("0x") ? "#" + d.value.slice(2).toUpperCase() : d.value)} | \`${d.file}\` | ${d.same ? esc(d.same) : "— (brak tokenu)"} |`),
    "",
  );
  return out.join("\n");
}

function srcNote(t: Token): string {
  const s = t.src;
  if (s.kind === "var") return "";
  if (s.kind === "same") return ` · = \`${s.as}\``;
  if (s.kind === "rule") return ` · \`${s.sel} { ${s.prop} }\``;
  if (s.kind === "file") return ` · \`${s.file}\``;
  return ` · wartość z reguł \`${s.prop}\``;
}

function figmaJson() {
  const tree: Record<string, unknown> = {};
  for (const g of groups) {
    const gg: Record<string, unknown> = {};
    for (const sub of g.groups) {
      const s: Record<string, unknown> = {};
      for (const t of sub.tokens) {
        const type = isColor(t.value) ? "color" : /px$|^[\d.]+$/.test(t.value) ? "dimension" : "other";
        s[t.name.replace(/^--/, "")] = { $type: type, $value: t.value, ...(t.dark ? { $extensions: { "gcat.dark": t.dark } } : {}), $description: t.use };
      }
      gg[sub.id] = s;
    }
    tree[g.id] = gg;
  }
  return JSON.stringify(tree, null, 2) + "\n";
}

if (process.argv[1]?.endsWith("tokeny.ts")) {
  writeFileSync("src/design/tokens.css", renderCss());
  writeFileSync("docs/tokeny.md", render());
  writeFileSync("docs/tokeny.json", figmaJson());
  mkdirSync("docs/tokeny", { recursive: true });
  for (const f of readdirSync("docs/tokeny")) rmSync(`docs/tokeny/${f}`);
  const cols = new Set<string>();
  for (const t of allTokens) for (const v of [t.value, t.dark]) if (v && isColor(v)) cols.add(v.toUpperCase());
  for (const d of simulatorDuplicates) { const v = d.value.startsWith("0x") ? "#" + d.value.slice(2) : d.value; if (isColor(v)) cols.add(v.toUpperCase()); }
  for (const c of cols) writeFileSync(`docs/${sw(c)}`, `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect x="0.5" y="0.5" width="15" height="15" rx="3" fill="${c}" stroke="#94A3B8"/></svg>\n`);
  console.log(`tokens.css, tokeny.md, tokeny.json, ${cols.size} próbek kolorów`);
}
