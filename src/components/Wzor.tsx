import katex from "katex";

/*
  <Wzor> — wzór w ramce pod tekstem (standard treści 2026-11-22, poprawka po pilotażu).
  Zapis wzoru (`f`) i symboli legendy — LaTeX w składni KaTeX (prawdziwy skład matematyczny):
   • ułamek \frac{licznik}{mianownik}, pierwiastek \sqrt{x}, indeks V_c / D_{cap}, potęga D^4 / x^{2n},
   • znaki \cdot \approx \propto \le \ge \pm \pi \Delta \kappa_r …, tekst \text{obr/min},
   • kilka wzorów w ramce: rozdzielone \\ (jeden pod drugim, z odstępem); podpis „Obroty; Posuw” — opis nad każdym,
     z & bez opisów wierszy — wyrównane do znaku (np. n &= …),
   • kind="obliczenie" — rachunek z liczbami pod wzorem (ułamki jak we wzorze), bez ramki i legendy.
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

/**
 * Wiersze zapisu: podział na \\ na najwyższym poziomie (poza klamrami i środowiskami, np. \begin{cases}),
 * bez otoczki gathered. Opcjonalny odstęp \\[…] pomijany — odstęp między wierszami daje ramka.
 */
export function splitRows(src: string): string[] {
  const m = LINES.exec(src);
  const f = m && m[1] === "gathered" ? m[2] : src;
  const rows: string[] = [];
  let cur = "", depth = 0, env = 0;
  for (let i = 0; i < f.length; i++) {
    const c = f[i];
    if (c === "\\") {
      if (f[i + 1] === "\\" && depth === 0 && env === 0) {
        rows.push(cur); cur = ""; i++;
        const opt = /^\s*\[[^\]]*\]/.exec(f.slice(i + 1));
        if (opt) i += opt[0].length;
        continue;
      }
      const b = /^\\(begin|end)\{/.exec(f.slice(i));
      if (b) env += b[1] === "begin" ? 1 : -1;
      cur += c + (f[i + 1] ?? ""); i++;
      continue;
    }
    if (c === "{") depth++; else if (c === "}") depth--;
    cur += c;
  }
  rows.push(cur);
  return rows.map((r) => r.trim()).filter(Boolean);
}

/** Wyrównanie do znaku (&) w kilku wierszach: aligned z odstępem między wierszami. Pojedynczy wiersz z & → aligned. */
export function wrapLines(f: string): string {
  const t = topLevel(f);
  if (LINES.test(f) || !/\\\\|&/.test(t)) return f;
  if (!t.includes("&")) return `\\begin{gathered}${splitRows(f).join(" \\\\[0.6em] ")}\\end{gathered}`;
  return `\\begin{aligned}${splitRows(f).join(" \\\\[0.6em] ")}\\end{aligned}`;
}

export interface WzorRow { label?: string; tex: string }
/**
 * Układ ramki: wiersze wzoru, każdy osobno (odstęp między wzorami), i opisy.
 * Podpis „A; B” przy dwóch wierszach = opis nad każdym wzorem; jeden podpis = nad całą ramką.
 * Wiersze wyrównane do znaku (&) bez opisów wierszy zostają razem (aligned).
 */
export function layout(f: string, caption?: string): { title?: string; rows: WzorRow[] } {
  const parts = (caption ?? "").split(/\s*;\s*/).map((p) => p.trim()).filter(Boolean);
  const rows = splitRows(f);
  const labels = parts.length > 1 && parts.length === rows.length ? parts : null;
  if (!labels && rows.length > 1 && rows.some((r) => topLevel(r).includes("&"))) return { title: caption || undefined, rows: [{ tex: f }] };
  return { title: labels ? undefined : caption || undefined, rows: rows.map((r, i) => ({ label: labels?.[i], tex: r })) };
}

/** Podpis z opisami wierszy (A; B) musi mieć tyle opisów, ile wzór ma wierszy. */
export function captionError(f: string, caption?: string): string | null {
  const parts = (caption ?? "").split(/\s*;\s*/).filter((p) => p.trim());
  const n = splitRows(f).length;
  const pl = (k: number, one: string, few: string, many: string) => `${k} ${k === 1 ? one : k % 10 >= 2 && k % 10 <= 4 && (k % 100 < 12 || k % 100 > 14) ? few : many}`;
  return parts.length > 1 && parts.length !== n ? `podpis ma ${pl(parts.length, "opis", "opisy", "opisów")} rozdzielone średnikiem, a wzór ${pl(n, "wiersz", "wiersze", "wierszy")} — po jednym opisie na wiersz` : null;
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

/** Rodzaj bloku: brak — ramka z legendą; „obliczenie” — rachunek z liczbami pod wzorem, bez ramki i legendy. */
export const WZOR_KINDS = ["obliczenie"] as const;

export default function Wzor({ f, legend, caption, kind }: { f: string; legend?: string; caption?: string; kind?: string }) {
  const { title, rows } = layout(f, caption);
  const body = (
    <div className="wzor-rows">
      {rows.map((r, i) => (
        <div key={i} className="wzor-row">
          {r.label && <div className="wzor-lab">{r.label}</div>}
          <div className="wzor-f" dangerouslySetInnerHTML={{ __html: tex(r.tex, true) }} />
        </div>
      ))}
    </div>
  );
  if (kind === "obliczenie") return (
    <div className="wzor-obl">
      {title && <div className="wzor-lab">{title}</div>}
      {body}
    </div>
  );
  const items = legend ? parseLegend(legend) : [];
  return (
    <figure className="wzor">
      {title && <figcaption className="wzor-cap">{title}</figcaption>}
      {body}
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
