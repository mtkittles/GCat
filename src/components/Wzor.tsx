import katex from "katex";

/*
  <Wzor> — wzór w ramce pod tekstem (standard treści 2026-11-22, poprawka po pilotażu).
  Zapis wzoru (`f`) i symboli legendy — LaTeX w składni KaTeX (prawdziwy skład matematyczny):
   • ułamek \frac{licznik}{mianownik}, pierwiastek \sqrt{x}, indeks V_c / D_{cap}, potęga D^4 / x^{2n},
   • znaki \cdot \approx \propto \le \ge \pm \pi \Delta \kappa_r …, tekst \text{obr/min},
   • kilka wzorów w ramce: rozdzielone \\ (jeden pod drugim), z & — wyrównane do znaku (np. n &= …).
  Przecinek dziesiętny piszemy zwyczajnie (0,05) — zamieniany na {,}, żeby LaTeX nie dodawał odstępu.
  Legenda (`legend`): wpisy rozdzielone średnikiem, „symbol — znaczenie [jednostka]”, symbol też w LaTeX.
  Wynik: HTML KaTeX (krój matematyczny KaTeX tylko w ramce wzoru) + MathML dla czytników ekranu.
*/

/** Makra zapisu z edytora wzorów (MathLive): wiersze, puste pole, stałe, różniczka — KaTeX ich nie zna. */
const MACROS = { "\\displaylines": "\\begin{gathered}#1\\end{gathered}", "\\placeholder": "\\square", "\\differentialD": "\\mathrm{d}", "\\exponentialE": "\\mathrm{e}", "\\imaginaryI": "\\mathrm{i}", "\\degree": "^{\\circ}" };
const OPTS = { throwOnError: true, strict: "ignore" as const, trust: false, output: "htmlAndMathml" as const, macros: MACROS };

/** Polski przecinek dziesiętny: 0,05 → 0{,}05 (bez odstępu po przecinku). */
const decimals = (s: string) => s.replace(/(\d),(\d)/g, "$1{,}$2");

const LINES = /^\s*\\begin\{(gathered|aligned)\}([\s\S]*)\\end\{\1\}\s*$/;
/** Zapis bez zagnieżdżonych środowisk (\begin{cases}…) — do sprawdzenia \\ i & na najwyższym poziomie. */
const topLevel = (f: string) => f.replace(/\\begin\{(\w+)\}[\s\S]*?\\end\{\1\}/g, " ");

/** Kilka wzorów w jednej ramce: \\ → gathered (jeden pod drugim), z & → aligned (wyrównanie do znaku). */
export function wrapLines(f: string): string {
  const t = topLevel(f);
  if (LINES.test(f) || !/\\\\|&/.test(t)) return f;
  return t.includes("&") ? `\\begin{aligned}${f}\\end{aligned}` : `\\begin{gathered}${f}\\end{gathered}`;
}

/** Do pola edytora (MathLive): kilka wierszy → \displaylines (jak MathLive przy Ctrl+Enter), z & → aligned. */
export function toField(src: string): string {
  const f = decimals(src);
  const t = topLevel(f);
  if (LINES.test(f)) return f;
  if (t.includes("&")) return `\\begin{aligned}${f}\\end{aligned}`;
  return /\\\\/.test(t) ? `\\displaylines{${f}}` : f;
}

/** Z pola edytora do zapisu: bez otoczki (w MDX zostaje krótkie „a \\ b”), puste wiersze usunięte, 0{,}05 → 0,05. */
export function fromField(src: string): string {
  const f = src.replace(/(\d)\{,\}(\d)/g, "$1,$2").trim();
  const m = /^\\displaylines\{([\s\S]*)\}$/.exec(f) ?? LINES.exec(f);
  if (!m) return f;
  const inner = m[m.length - 1];
  if (/\\begin\{/.test(inner)) return inner.trim();
  return inner.split(/\\\\/).map((r) => r.trim()).filter(Boolean).join(" \\\\ ");
}

/** LaTeX → HTML KaTeX. Błąd zapisu → komunikat zamiast wzoru (kontrola przy buildzie: texError). */
export function tex(src: string, display: boolean): string {
  try {
    return katex.renderToString(decimals(display ? wrapLines(src) : src), { ...OPTS, displayMode: display });
  } catch (e) {
    return `<span class="wzor-err">Błąd zapisu wzoru: ${plError(String((e as Error).message)).replace(/[<>&]/g, "")}</span>`;
  }
}

/** Komunikat KaTeX po polsku (najczęstsze przypadki), reszta w oryginale. */
function plError(msg: string): string {
  const m = msg.replace(/^KaTeX parse error:\s*/, "");
  const u = m.match(/Undefined control sequence: (\\\S+)/);
  if (u) return `nieznane polecenie ${u[1]}`;
  if (/Unexpected end of input|Expected '\}'/.test(m)) return "niedomknięta klamra { } albo brak argumentu (np. \\frac wymaga {licznik}{mianownik})";
  if (/Expected '\\right'/.test(m)) return "\\left bez pary \\right";
  if (/Double (subscript|superscript)/.test(m)) return "dwa indeksy przy jednej literze — ujmij w klamry, np. V_{c1}";
  return m;
}

/** Komunikat błędu zapisu wzoru albo null (remark i panel edytora). */
export function texError(src: string): string | null {
  if (/\\placeholder|□/.test(src)) return "wzór ma puste pole □ — uzupełnij je albo usuń";
  try { katex.renderToString(decimals(wrapLines(src)), { ...OPTS, displayMode: true }); return null; }
  catch (e) { return plError(String((e as Error).message)); }
}

export interface LegendItem { sym: string; desc: string; unit?: string }
/** „V_c — prędkość skrawania [m/min]; D — średnica [mm]” → wpisy legendy. */
export function parseLegend(legend: string): LegendItem[] {
  return legend.split(/;\s+|;$/).map((e) => e.trim()).filter(Boolean).map((e) => {
    const m = e.match(/^(.+?)\s+[—–-]\s+(.+)$/);
    const sym = (m ? m[1] : e).trim();
    let desc = (m ? m[2] : "").trim(), unit: string | undefined;
    const u = desc.match(/\s*\[([^\]]+)\]$/);
    if (u) { unit = u[1]; desc = desc.slice(0, u.index).trim(); }
    return { sym, desc, unit };
  });
}

/** Tekst wzoru do wyszukiwarki: bez poleceń LaTeX i klamer. */
export const texPlain = (s: string) => s.replace(/\\[a-zA-Z]+/g, " ").replace(/[_^{}\\&]/g, " ").replace(/\s+/g, " ").trim();

export default function Wzor({ f, legend, caption }: { f: string; legend?: string; caption?: string }) {
  const items = legend ? parseLegend(legend) : [];
  return (
    <figure className="wzor">
      {caption && <figcaption className="wzor-cap">{caption}</figcaption>}
      <div className="wzor-f" dangerouslySetInnerHTML={{ __html: tex(f, true) }} />
      {items.length > 0 && (
        <dl className="wzor-leg">
          {items.map((it, n) => [
            <dt key={`t${n}`} dangerouslySetInnerHTML={{ __html: tex(it.sym, false) }} />,
            <dd key={`d${n}`}>{it.desc}{it.unit && <span className="wzor-unit">{it.unit}</span>}</dd>,
          ])}
        </dl>
      )}
    </figure>
  );
}
