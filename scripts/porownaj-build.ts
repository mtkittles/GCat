/* Porównanie dwóch buildów strona po stronie (np. main vs gałąź migracji).
   Użycie: npm run porownaj -- <kopia .next/server/app z A> <kopia z B> [--bez-css] [--zatwierdzone]
   --bez-css: pomija też nazwy plików CSS (gdy zmiana CSS jest zamierzona i sprawdzona osobno hashem).
   --zatwierdzone: w HTML z A nanosi zmiany z listy ZATWIERDZONE (tests/zatwierdzone.ts) przed porównaniem;
     wtedy różnica w HTML = zmiana spoza listy. Dane RSC tych stron różnią się z tych samych powodów (wypisane osobno).
   Normalizuje: ID builda, nazwy plików JS (/_next/static/chunks/*.js), id z useId() (aria-controls).
   Wypisuje pliki HTML/RSC, które się różnią, i dla HTML — zmienione fragmenty widocznej treści. */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { applyApproved } from "../tests/zatwierdzone";

const args = process.argv.slice(2);
const bezCss = args.includes("--bez-css");
const zatw = args.includes("--zatwierdzone");
const [a, b] = args.filter((x) => !x.startsWith("--"));
if (!a || !b) { console.error("użycie: npm run porownaj -- <katalog A> <katalog B>"); process.exit(2); }

const files = (root: string, d = ""): string[] => readdirSync(path.join(root, d)).flatMap((f) => {
  const p = path.join(d, f);
  return statSync(path.join(root, p)).isDirectory() ? files(root, p) : /\.(html|rsc)$/.test(f) ? [p] : [];
});
/** ID builda z danych RSC strony (\"b\":\"…\") — zamieniany wszędzie na BID. */
function buildId(root: string, list: string[]): string {
  for (const f of list) {
    const m = readFileSync(path.join(root, f), "utf8").match(/\\?"b\\?":\\?"([\w-]{8,})\\?"/);
    if (m) return m[1];
  }
  return "\u0000";
}
let bid = "";
const norm = (s: string) => s
  .split(bid).join("BID")
  .replace(/\/_next\/static\/chunks\/[\w~.-]+\.js/g, "CHUNK.js")
  .replace(bezCss ? /\/_next\/static\/chunks\/[\w~.-]+\.css/g : /$^/g, "CHUNK.css")
  .replace(/ aria-controls="[^"]*"/g, "")
  .replace(/_R_[0-9a-z]+_/g, "_R_");
const visible = (s: string) => norm(s).replace(/<script>self\.__next_f[\s\S]*$/, "").split(/(?=<)/);

const fa = files(a).sort(), fb = new Set(files(b));
const bidA = buildId(a, fa), bidB = buildId(b, [...fb]);
const nA = (s: string) => { bid = bidA; return norm(s); }, nB = (s: string) => { bid = bidB; return norm(s); };
let diff = 0, payloadOnly = 0;
const approvedPages = new Map<string, string[]>();
const pendingPages = new Map<string, string[]>();
for (const f of fa) {
  if (!fb.has(f)) { console.log(`tylko w A: ${f}`); diff++; continue; }
  let x = readFileSync(path.join(a, f), "utf8");
  const y = readFileSync(path.join(b, f), "utf8");
  if (zatw && f.endsWith(".html")) {
    const r = applyApproved(x.replace(/ aria-controls="[^"]*"/g, ""));
    if (r.used.length) approvedPages.set(f, r.used);
    if (r.pending.length) pendingPages.set(f, r.pending);
    x = r.html;
  }
  if (nA(x) === nB(y)) continue;
  // HTML: widoczna treść identyczna, różnią się tylko dane RSC w <script> (np. klucze React, pola danych)
  if (f.endsWith(".html")) {
    bid = bidA; const va = visible(x).join(""); bid = bidB; const vb = visible(y).join("");
    if (va === vb) { payloadOnly++; continue; }
  }
  if (f.endsWith(".rsc")) { payloadOnly++; continue; }
  diff++;
  console.log(`RÓŻNI SIĘ: ${f}`);
  if (f.endsWith(".html")) {
    bid = bidA; const vx = visible(x); bid = bidB; const vy = visible(y);
    const sy = new Set(vy), sx = new Set(vx);
    for (const t of vx) if (!sy.has(t)) console.log(`  - ${t.slice(0, 160)}`);
    for (const t of vy) if (!sx.has(t)) console.log(`  + ${t.slice(0, 160)}`);
  }
}
for (const f of fb) if (!fa.includes(f)) { console.log(`tylko w B: ${f}`); diff++; }
if (zatw) {
  console.log(`zatwierdzone zmiany naniesione na ${approvedPages.size} stron(y):`);
  for (const [f, u] of approvedPages) console.log(`  ${f}: ${u.join("; ")}`);
  console.log(`DO ZATWIERDZENIA (DO_ZATWIERDZENIA, czeka na decyzję) — ${pendingPages.size} stron(y):`);
  for (const [f, u] of pendingPages) console.log(`  ${f}: ${u.join("; ")}`);
}
console.log(`tylko dane RSC (widoczny HTML identyczny; pliki .rsc i <script> w .html): ${payloadOnly}`);
console.log(`plików: ${fa.length}, z różnicą widocznej treści${zatw ? " poza zatwierdzonymi" : ""}: ${diff}`);
