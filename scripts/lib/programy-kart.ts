/* Wszystkie programy i bloki kodu z kart kodów (content/kody): przykład z frontmattera, <Sim>/<Demo>, <Code> i bloki ```.
   Dla skryptów kontrolnych (audit:programy, profil kursu). */
import { readdirSync, readFileSync } from "node:fs";
import { parse } from "yaml";
import { splitFrontmatter } from "@/lib/mdx/loader";
import type { Mode } from "./profil-kursu";

export interface KartaProgram {
  file: string; line: number; where: string; src: string; mode: Mode;
  dialect: "fanuc" | "sinumerik"; kind: "example" | "sim" | "demo" | "code"; simulate: boolean; hidden: boolean;
  /** cały program (do profilu kursu): przykład, symulacja, animacja albo blok ``` z wymianą narzędzia i M30 */
  full: boolean;
}

/** Tryb bloku ``` bez komponentu: z maszyn karty, a na kartach „frez + tok” z treści bloku. */
function codeMode(src: string, machines: string[]): Mode {
  if (!machines.includes("frezowanie")) return "lathe";
  if (!machines.includes("toczenie")) return "mill";
  return /G18\b|T0\d0\d|G9[69]\b|G7[0-6]\b|G3[23]\b|\b[UW]-?\d/.test(src) && !/M0?6\b|G8[0-9]\b/.test(src) ? "lathe" : "mill";
}

export function programyKart(dir = "content/kody"): KartaProgram[] {
  const out: KartaProgram[] = [];
  for (const f of readdirSync(dir).filter((x) => x.endsWith(".mdx")).sort()) {
    const text = readFileSync(`${dir}/${f}`, "utf8");
    const fm = splitFrontmatter(text)!;
    const d = parse(fm.yaml);
    const hasArticle = fm.body.trim() !== "";
    const machines: string[] = d.machines ?? [];
    const autoMode: Mode = d.example?.mode || (machines.includes("toczenie") && !machines.includes("frezowanie") ? "lathe" : "mill");
    const slug = f.slice(0, -4);
    if (d.example?.src) {
      const line = text.split("\n").findIndex((l) => /^example:/.test(l)) + 3;
      out.push({ file: f, line, where: `${slug} przykład${hasArticle ? " [ukryty]" : ""}`, src: d.example.src, mode: autoMode, dialect: d.example.dialect || "fanuc", kind: "example", simulate: d.example.simulate !== false, hidden: hasArticle, full: /(^|\s)M(30|0?2|99)\b/.test(d.example.src) });
    }
    // składnia z frontmattera (blok kodu na górze karty)
    for (const k of ["fanuc", "sinumerik"] as const) {
      const src = String(d.syntax?.[k] ?? "");
      if (src) out.push({ file: f, line: 1, where: `${slug} składnia ${k}`, src, mode: codeMode(src, machines), dialect: k, kind: "code", simulate: false, hidden: false, full: false });
    }
    // bloki komponentów i gołe ``` w treści
    const body = fm.body.split("\n");
    for (let i = 0; i < body.length; i++) {
      const m = body[i].match(/^( *)(`{3,})(\w*)\s*$/);
      if (!m) continue;
      const ind = m[1], fence = m[2];
      let j = i + 1;
      while (j < body.length && body[j] !== ind + fence) j++;
      const src = body.slice(i + 1, j).map((l) => (l.startsWith(ind) ? l.slice(ind.length) : l.trimStart())).join("\n");
      // komponent otwierający: najbliższa linia `<X …>` nad blokiem
      let k = i - 1; while (k >= 0 && body[k].trim() === "") k--;
      const open = k >= 0 ? body[k].match(/^<(Sim|Demo|Code)\b([^>]*)>/) : null;
      const kind = open?.[1] === "Sim" ? "sim" : open?.[1] === "Demo" ? "demo" : "code";
      const mode: Mode = open && /\bmode="lathe"/.test(open[2]) ? "lathe" : kind === "code" ? codeMode(src, machines) : "mill";
      out.push({ file: f, line: i + 2, where: `${slug} ${kind} L${i + 2}`, src, mode, dialect: /SINUMERIK|Sinumerik/.test(open?.[2] ?? "") ? "sinumerik" : "fanuc", kind, simulate: kind !== "code", hidden: false, full: kind !== "code" || (/(^|\s)M30\b/.test(src) && /(^|\s)(M0?6|T\d{4})\b/.test(src)) });
      i = j;
    }
  }
  return out;
}
