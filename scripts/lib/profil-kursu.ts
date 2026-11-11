/*
  Profil zapisu programów w kartach kodów (paczka U, audyt sekcji Kody G i M, §3.2 i zał. A).
  Wzór: lekcje F1.5 (frezarka) i T1.3 (tokarka). Funkcja zwraca listę uwag dla jednego programu.

  Frezarka (program z ruchem):
    G21 G90 G94 G17        ← jednostki, wymiary, posuw, płaszczyzna (karta może zmienić kod swojej grupy)
    G40 G49 G80
    G54                    ← albo inny układ G54–G59 / G54.1 Pn
    T1 M06
    G00 G43 H1 Z50.        ← pierwszy ruch po wymianie: G43 przed obrotami
    S… M03
    G00 X… Y…              ← dojazd XY bez Z
    G00 Z…
    …
    M05
    M30
  Tokarka:
    G18 G21 G40 G80 G99
    G54
    T0101
    G50 S…  + G96 S… M03   albo   G97 S… M03
    G00 X… Z…
    …
    M05
    M30

  Wszędzie: współrzędne z kropką (zapis Fanuc), komentarz w nawiasach (w Fanucu `;` nie jest komentarzem),
  linia kodu najwyżej 42 znaki (blok kodu na telefonie 390 px), łącznik zamiast minusa typograficznego.
*/

export type Mode = "mill" | "lathe";
export type Kind = "program" | "fragment";
export interface ProfilInput { src: string; mode: Mode; dialect?: "fanuc" | "sinumerik"; kind: Kind }

export const LINE_MAX = 42;

const strip = (l: string) => l.replace(/\([^)]*\)/g, "").replace(/;.*$/, "").trim().toUpperCase();
const words = (l: string) => strip(l).match(/[A-Z][-+]?[\d.]+/g) ?? [];
const has = (l: string, re: RegExp) => re.test(strip(l));

/** Tryb tokarki wykryty z treści (jak w zał. A audytu). */
export function looksLathe(src: string): boolean {
  const L = src.split("\n");
  if (L.some((l) => has(l, /(^|\s)T\d{4}\b|(^|\s)G96\b|(^|\s)G50\s+S/))) return true;
  // G99 na frezarce to powrót do płaszczyzny R w cyklu — tokarka tylko z G18 i bez wymiany M06
  return L.some((l) => has(l, /(^|\s)G18(\s|$)/)) && L.some((l) => has(l, /(^|\s)G99(\s|$)/)) && !L.some((l) => has(l, /(^|\s)M0?6(\s|$)/));
}

const SINU = /SINUMERIK|Sinumerik|CYCLE\d|\b[A-Z_]+\s*=\s*\S|^\s*G[0-4]\s|\bSUPA\b|\bA?TRANS\b|\bA?ROT\b|\bG500\b|\bMCALL\b|\bLIMS\b|\bRTLIO|\bCR=/;
/** Linia tekstu albo obliczenia (słowo z małych liter poza komentarzem), a nie bloku NC. */
export const textLine = (l: string) => /[a-ząćęłńóśźż]{3,}|\d,\d|\s=\s|→/.test(l.replace(/\([^)]*\)/g, "").replace(/;.*$/, ""));

export function profil({ src, mode, dialect = "fanuc", kind }: ProfilInput): string[] {
  const out: string[] = [];
  const lines = src.split("\n");
  const fanuc = dialect === "fanuc";
  // dialekt per sekcja (sekcje rozdzielone pustą linią) — fragment może zestawiać Fanuc i Sinumerik
  const dial: boolean[] = [];
  for (let i = 0, start = 0; i <= lines.length; i++) {
    if (i === lines.length || lines[i].trim() === "") {
      const sec = lines.slice(start, i);
      const sinu = !fanuc || (kind === "fragment" && sec.some((l) => SINU.test(l)));
      for (let k = start; k < i; k++) dial[k] = !sinu;
      dial[i] = fanuc; start = i + 1;
    }
  }

  lines.forEach((l, i) => {
    // limit dotyczy linii z komentarzem, komentarza i tekstu; sam blok NC (np. wywołanie cyklu) bywa dłuższy i nie da się go złamać
    const comment = dial[i] ? /\(|;/.test(l) : /;/.test(l);
    if (l.length > LINE_MAX && (comment || textLine(l))) out.push(`L${i + 1}: ${l.length} znaków (limit ${LINE_MAX})`);
    if (dial[i] && /;/.test(l.replace(/\([^)]*\)/g, ""))) out.push(`L${i + 1}: komentarz „;” w zapisie Fanuc — nawiasy ( )`);
    if (textLine(l)) return;
    if (l.includes("−")) out.push(`L${i + 1}: minus typograficzny w kodzie`);
  });
  {
    // współrzędne z kropką — także we fragmentach (karta G00 ostrzega przed brakiem kropki); na frezarce także Q
    // w cyklach (F5.2: Q4 bez kropki to 0,004 mm). Na tokarce P i Q cykli są w mikrometrach albo numerami bloków — bez kropki.
    const bad = lines.map((l, i) => [i, dial[i] && !textLine(l) ? words(l).filter((w) => (mode === "mill" ? /^[XYZIJKRUWQ]-?\d+$/ : /^[XYZIJKRUW]-?\d+$/).test(w)) : []] as const).filter(([, w]) => w.length);
    if (bad.length) out.push(`współrzędne bez kropki: ${bad.slice(0, 4).map(([i, w]) => `L${i + 1} ${w.join(" ")}`).join(", ")}${bad.length > 4 ? " …" : ""}`);
  }
  if (kind === "fragment" || !fanuc) return out;

  const code = lines.map(strip).filter((l) => l && !/^O\d+$/.test(l) && !/^%$/.test(l));
  const lathe = looksLathe(src);
  if (lathe !== (mode === "lathe")) out.push(`tryb ${mode}, a program wygląda na ${lathe ? "tokarski" : "frezarski"}`);
  // Program bez wymiany narzędzia i ruchu to zapis do przeczytania (np. G10, M-kody) — nagłówka nie wymagamy.
  if (!code.some((l) => /(^|\s)G0?[0-3](\s|$)|(^|\s)G[78]\d(\.\d)?(\s|$)|(^|\s)G7[0-6]/.test(l))) return out;

  if (mode === "mill") {
    if (!/^G2[01] G9[01] G9[45] G1[789]$/.test(code[0] ?? "")) out.push(`blok startowy: „${code[0]}” zamiast G21 G90 G94 G17`);
    else if (!/G94/.test(code[0]) && !code.some((l) => /G94/.test(l))) out.push("brak G94");
    if (code[1] !== "G40 G49 G80") out.push(`linia 2: „${code[1]}” zamiast G40 G49 G80`);
    if (!/^G5[4-9](\.1 P\d+)?$/.test(code[2] ?? "")) out.push(`linia 3: „${code[2]}” zamiast G54`);
    // każda wymiana: T M06 → G00 G43 H Z → S M03, potem XY bez Z, potem Z.
    // Programy 5-osiowe (G43.4, G68.2) mają kolejność opisaną na swojej karcie — tu sprawdzamy tylko nagłówek.
    const fiveAxis = code.some((l) => /G43\.4|G68\.2/.test(l));
    if (!fiveAxis) code.forEach((l, i) => {
      if (!/(^|\s)M0?6(\s|$)/.test(l)) return;
      const nx = code[i + 1] ?? "", sp = code[i + 2] ?? "", ap = code[i + 3] ?? "";
      if (!/^G00 G43 H\d+ Z[\d.]+$/.test(nx)) out.push(`po „${l}”: „${nx}” zamiast G00 G43 H_ Z50.`);
      if (!/^S\d+ M0[34]$/.test(sp)) out.push(`po G43: „${sp}” zamiast S_ M03`);
      if (/X|Y/.test(ap) && /Z/.test(ap)) out.push(`pierwszy dojazd łączy XY i Z: „${ap}”`);
    });
    if (!code.some((l) => /(^|\s)M0?6(\s|$)/.test(l))) out.push("brak T_ M06");
  } else {
    if (!/^G18 G2[01] G40 G80 G99$/.test(code[0] ?? "")) out.push(`blok startowy: „${code[0]}” zamiast G18 G21 G40 G80 G99`);
    if (!/^G5[4-9]$/.test(code[1] ?? "")) out.push(`linia 2: „${code[1]}” zamiast G54`);
    if (!/^T\d{4}$/.test(code[2] ?? "")) out.push(`linia 3: „${code[2]}” zamiast T0101`);
    const g96 = code.findIndex((l) => /G96/.test(l)), g50 = code.findIndex((l) => /^G50 S\d+$/.test(l));
    if (g96 >= 0 && (g50 < 0 || g50 > g96)) out.push("G96 bez wcześniejszego G50 S_");
    if (code.some((l) => /G95|G98/.test(l))) out.push("tokarka: G95/G98 zamiast G99");
  }
  const last = code.at(-1) ?? "", prev = code.at(-2) ?? "";
  if (!/^M(30|99)$/.test(last)) out.push(`koniec: „${last}” zamiast M30`);
  else if (last === "M30" && !/(^|\s)M0?5(\s|$)/.test(prev) && !code.some((l, i) => i >= code.length - 4 && /(^|\s)M0?5(\s|$)/.test(l))) out.push("brak M05 przed M30");
  return out;
}
