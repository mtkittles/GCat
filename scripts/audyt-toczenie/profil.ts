// Audyt Nauki toczenia (zał. A.1): profil kursu i walidator na programach lekcji T0–T9. Uruchom: npx tsx scripts/audyt-toczenie/profil.ts
/* eslint-disable @typescript-eslint/no-explicit-any -- jednorazowy skrypt audytu, czyta różne typy bloków lekcji */
import { flat } from "@/lib/course";
import { flatBlocks } from "@/lib/article";
import { profil } from "../lib/profil-kursu";
import { parseProgram } from "@/lib/parser";
import { validate } from "@/lib/parser/validate";

const ls = flat("toczenie").filter((l) => l.doc && /^T\d/.test(l.id));
let n = 0, nIss = 0;
const endings = new Map<string, string[]>();
for (const l of ls) {
  const d = l.doc!;
  const progs: [string, string][] = [];
  flatBlocks(d.theory).forEach((b: any, i) => { if ((b.t === "demo" || b.t === "sim") && b.src) progs.push([`teoria ${b.t} ${i}`, b.src]); if (b.t === "code" && /G0|G7|M30|T0/.test(b.x) && !/[ąęłśćżź=]/.test(b.x.replace(/\([^)]*\)/g, ""))) progs.push([`teoria code ${i}`, b.x]); });
  d.practice.forEach((p: any, i) => { if (p.kind === "task") { progs.push([`zadanie ${i} rozwiązanie`, p.solution]); } });
  for (const [where, src] of progs) {
    n++;
    const kind = /M30|M99/.test(src) ? "program" : "fragment";
    const iss = profil({ src, mode: "lathe", kind });
    const pr = parseProgram(src, { diameterX: true });
    const v = validate(pr).map((x) => `${x.level} L${x.line + 1}: ${x.msg}`);
    if (iss.length || v.length) { nIss++; console.log(`${l.id} ${where} (${kind}):\n   ` + [...iss, ...v].join("\n   ")); }
    if (kind === "program") { const code = src.split("\n").map((x) => x.replace(/\([^)]*\)/g, "").trim()).filter(Boolean); const end = code.slice(-6).join(" | "); endings.set(end, [...(endings.get(end) ?? []), `${l.id} ${where}`]); }
  }
}
console.log(`\n${n} programów, z uwagami: ${nIss}`);
console.log("\nZakończenia programów:"); for (const [e, w] of endings) console.log(`  ${e}\n     ← ${w.join(", ")}`);
