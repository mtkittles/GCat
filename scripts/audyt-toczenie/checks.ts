// Audyt Nauki toczenia (docs/audyt-toczenie-2026-11-13.md, zał. A.2): rozwiązania wzorcowe i kontrprzykłady zaliczeń. Uruchom: npx tsx scripts/audyt-toczenie/checks.ts
/* eslint-disable @typescript-eslint/no-explicit-any -- jednorazowy skrypt audytu, czyta różne typy bloków lekcji */
import { flat } from "@/lib/course";
import { runTaskChecks } from "@/lib/taskCheck";
import type { Practice } from "@/lib/lesson";

const L = Object.fromEntries(flat("toczenie").filter((l) => l.doc).map((l) => [l.id, l.doc!]));
const task = (id: string) => L[id].practice.find((p): p is Extract<Practice, { kind: "task" }> => p.kind === "task")!;
const run = (id: string, name: string, src: string) => {
  const t = task(id);
  const res = runTaskChecks(src, t.checks, "lathe").checks;
  const ok = res.every((r) => r.ok);
  console.log(`${ok ? "ZALICZONE " : "odrzucone "} ${id} — ${name}${ok ? "" : "  [" + res.filter((r) => !r.ok).map((r) => r.label + (r.detail ? ": " + r.detail : "")).join("; ") + "]"}`);
};
// wzorce
for (const id of Object.keys(L)) { const t = L[id].practice.find((p) => p.kind === "task"); if (t) run(id, "rozwiązanie wzorcowe", (t as any).solution); }
console.log("---");
const sol = (id: string) => task(id).solution;
// T1.3: nagłówek po ruchach, odjazd Z przed X
run("T1.3", "blok startowy i G54 dopisane po obróbce", sol("T1.3").replace("G18 G21 G40 G80 G99\nG54\n", "").replace("G28 U0.\n", "G18 G21 G40 G80 G99\nG54\nG28 U0.\n"));
run("T1.3", "odjazd najpierw w Z (G28 W0.), potem w X", sol("T1.3").replace("G28 U0.\nG28 W0.", "G28 W0.\nG28 U0."));
// T2.1: zmiana noża bez odjazdu, G97 zamiast G96
run("T2.1", "T0202 bez odjazdu do punktu referencyjnego", sol("T2.1").replace("G28 U0.\nG28 W0.\nT0202", "T0202"));
run("T2.1", "G97 S250 zamiast G96 S250", sol("T2.1").replace("G96 S250 M03", "G97 S250 M03"));
// T2.2: G50 po G96
run("T2.2", "G50 S3000 po G96 S200 M03", sol("T2.2").replace("G50 S3000\nG96 S200 M03", "G96 S200 M03\nG50 S3000"));
run("T2.2", "bez G96: G97 S200 + G50 S3000", sol("T2.2").replace("G96 S200 M03", "G97 S200 M03\n(G96)"));
// T3.1: wyjście ruchem szybkim
run("T3.1", "wyjście z materiału G00 X42.", sol("T3.1").replace("X42.\nG00 Z2.", "G00 X42.\nZ2."));
// T4.1: G42 na odjeździe zamiast dojazdu
run("T4.1", "G42 dopiero po konturze, przed G40", sol("T4.1").replace("G42 G00 X14. Z2.", "G00 X14. Z2.").replace("G40 G00 Z2.", "G42 G00 Z2.\nG40 G00 X44."));
run("T4.1", "G41 zamiast G42", sol("T4.1").replace("G42 G00", "G41 G00"));
// T5.1: G70 bez zmiany noża? / G71 wykonane, G70 przed zmianą noża
run("T5.1", "G70 nożem zgrubnym (przed T0202)", sol("T5.1").replace(/G28 U0\.\nG28 W0\.\nT0202[^\n]*\nG96 S250 M03\nG42 G00 X42\. Z2\.\nG70 P10 Q20/, "G42 G00 X42. Z2.\nG70 P10 Q20\nG28 U0.\nG28 W0.\nT0202 (NOZ WYKANCZAJACY VBMT R0.4)\nG96 S250 M03"));
// T6.2: wiercenie w G96
run("T6.2", "wiercenie przy G96 S200 (bez G97)", sol("T6.2").replace("G97 S1200 M03", "G50 S3000\nG96 S200 M03"));
// T7.1: gwint przy G96
run("T7.1", "gwint przy G96 (bez G97)", sol("T7.1").replace("G97 S1200 M03", "G50 S3000\nG96 S120 M03"));
// T7.2: trzecie przejście z Z3
run("T7.2", "przejście z innego Z startu (Z3.)", sol("T7.2").replace(/G00 X18\.5\nG32/, "G00 X18.5 Z3.\nG32").replace(/(G00 X18\.5 Z3\.\nG32 Z-17\. F1\.5\nG00 X22\.\n)Z5\./, "$1Z5."));
// T9.1: G50 po G96, chłodziwo
run("T9.1", "G50 po G96", sol("T9.1").replace("G50 S3000\nG96 S200 M03", "G96 S200 M03\nG50 S3000"));
run("T9.1", "G70 bez G42 (G42 w komentarzu nie liczy się) — G42 dopisane na końcu", sol("T9.1").replace("G42 G00 X52. Z2.", "G00 X52. Z2.").replace("G40 G00 X54. Z5.", "G42 G00 X54. Z5.\nG40 G00 X56."));
