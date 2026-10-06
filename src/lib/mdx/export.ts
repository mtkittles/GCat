import { stringify } from "yaml";
import type { Block } from "@/lib/article";
import type { GCode } from "@/lib/gcodes";
import type { Kod } from "./schema";

/*
  Eksport treści ze starych źródeł (gcodes.json + articles*.ts) do MDX — deterministyczny:
  ten sam wejściowy stan = ten sam plik. Markery [[…]] przechodzą dosłownie; kotwice nagłówków
  zapisywane jawnie ({#id} = dzisiejszy id albo slugify(tekst)). Test pilot.test.ts sprawdza,
  że plik w content/kody = eksport (brak ręcznych rozjazdów) i że HTML = Article.tsx.
*/

/** Jak slugify w Article.tsx — kotwica nagłówka liczona dziś z tekstu. */
export const slugify = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");

/** GCode (gcodes.json) → frontmatter karty; star z CURATED. */
export function gcodeToKod(g: GCode, star: boolean): Kod {
  return {
    code: g.code, slug: g.slug, name: g.name, group: g.group, level: g.level, modal: g.modal,
    machines: [...(g.milling ? ["frezowanie" as const] : []), ...(g.turning ? ["toczenie" as const] : [])],
    star, related: g.related ?? [], variesBy: g.variesBy ?? null,
    short: g.short, desc: g.desc, syntax: g.syntax, sinumerik: g.sinumerik, params: g.params, pitfalls: g.pitfalls,
    example: {
      src: g.example, simulate: g.simulate ?? true,
      ...(g.exampleMode ? { mode: g.exampleMode } : {}),
      ...(g.exampleDialect ? { dialect: g.exampleDialect } : {}),
      stock: g.exampleStock ?? null,
    },
  };
}

/** Frontmatter karty → GCode, jakiego dziś używa strona (odwrotność gcodeToKod; test: równe gcodes.json). */
export function kodToGcode(k: Kod): GCode {
  return {
    code: k.code, slug: k.slug, name: k.name, group: k.group, modal: k.modal,
    milling: k.machines.includes("frezowanie"), turning: k.machines.includes("toczenie"), level: k.level,
    short: k.short, desc: k.desc, syntax: k.syntax, params: k.params, example: k.example.src,
    sinumerik: k.sinumerik, pitfalls: k.pitfalls,
    ...(k.related.length ? { related: k.related } : {}),
    ...(k.variesBy !== null ? { variesBy: k.variesBy } : {}),
    ...(k.example.simulate === false ? { simulate: false } : {}),
    ...(k.example.mode ? { exampleMode: k.example.mode } : {}),
    ...(k.example.stock ? { exampleStock: k.example.stock } : {}),
    ...(k.example.dialect ? { exampleDialect: k.example.dialect } : {}),
  };
}

const INLINE = /\*\*([^*]+)\*\*|`([^`]+)`|\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;

/** Zwykły tekst (bez znaczników rich()) → Markdown/MDX, który wyświetli się tak samo. */
function escPlain(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/[{}<*~`]/g, (c) => `\\${c}`)
    .replace(/&(?=#?\w+;)/g, "\\&");
}

/** Tekst z rich() (**, `, [[…]]) → Markdown; znaczniki zostają dosłownie. */
export function inline(s: string): string {
  if (s.includes("\n")) throw new Error(`eksport: tekst wieloliniowy w bloku inline: ${s.slice(0, 60)}`);
  let out = "", last = 0;
  for (const m of s.matchAll(INLINE)) {
    out += escPlain(s.slice(last, m.index));
    // **…**: wnętrze bez ucieczek dla ` (zatwierdzony wyjątek: `kod` w pogrubieniu renderuje się jako kod)
    out += m[1] !== undefined ? `**${m[1].replace(/[{}<~]/g, (c) => `\\${c}`)}**` : m[0];
    last = m.index + m[0].length;
  }
  out += escPlain(s.slice(last));
  // znaki, które na początku linii zmieniłyby blok (nagłówek, cytat, lista)
  return out.replace(/^(#|>|[-+] |\d+[.)] )/, (c) => (/^\d/.test(c) ? c.replace(/([.)])/, "\\$1") : `\\${c}`));
}

/** Atrybut JSX: tekst w cudzysłowie (bez ucieczek — JSX ich nie obsługuje). */
function q(s: string): string {
  if (!s.includes('"')) return `"${s}"`;
  if (!s.includes("'")) return `'${s}'`;
  throw new Error(`eksport: atrybut z " i ': ${s}`);
}
const attrs = (o: Record<string, string | undefined>) => Object.entries(o).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => ` ${k}=${q(v!)}`).join("");
function fence(src: string): string {
  let f = "```";
  while (src.includes(f)) f += "`";
  return `${f}\n${src}\n${f}`;
}
const cell = (s: string) => inline(s).replace(/\|/g, (_, i: number, all: string) => {
  // | wewnątrz markera [[a|b]] zostaje (plugin obsługuje go w tabeli); poza markerem → \|
  const before = all.slice(0, i);
  return before.lastIndexOf("[[") > before.lastIndexOf("]]") ? "|" : "\\|";
});

export function blocksToMdx(blocks: Block[]): string {
  return blocks.map((b): string => {
    switch (b.t) {
      case "h": return `## ${inline(b.x)} {#${b.id ?? slugify(b.x)}}`;
      case "p": return inline(b.x);
      case "ul": return b.items.map((x) => `- ${inline(x)}`).join("\n");
      case "ol": return b.items.map((x, i) => `${i + 1}. ${inline(x)}`).join("\n");
      case "note": return `<Note kind="${b.kind}">${inline(b.x)}</Note>`;
      case "code": return `<Code${attrs({ caption: b.caption })}>\n${fence(b.x)}\n</Code>`;
      case "sim": return `<Sim${attrs({ mode: b.mode, caption: b.caption })}>\n${fence(b.src)}\n</Sim>`;
      case "demo": return `<Demo${attrs({ mode: b.mode, title: b.title, caption: b.caption })}>\n${fence(b.src)}\n</Demo>`;
      case "table": {
        const t = [`| ${b.head.map(cell).join(" | ")} |`, `|${b.head.map(() => "---").join("|")}|`, ...b.rows.map((r) => `| ${r.map(cell).join(" | ")} |`)].join("\n");
        return b.caption ? `<Table${attrs({ caption: b.caption })}>\n\n${t}\n\n</Table>` : t;
      }
      case "diagram": return `<Diagram id="${b.id}" />`;
      case "widget": return `<Widget id="${b.id}" />`;
    }
  }).join("\n\n") + "\n";
}

/** Cały plik content/kody/<slug>.mdx. */
export function exportKod(g: GCode, star: boolean, blocks: Block[] | undefined): string {
  const fm = stringify(gcodeToKod(g, star), { lineWidth: 0, blockQuote: "literal" });
  return `---\n${fm}---\n\n${blocks ? blocksToMdx(blocks) : ""}`;
}
