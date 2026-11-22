import type { ReactNode } from "react";

/*
  <Wzor> — wzór w ramce pod tekstem (standard treści, pilotaż 2026-11-22).
  Zapis wzoru (atrybut `f`): zwykły tekst z dwiema umowami:
   • `_` — indeks dolny: V_c, f_z, a_p, h_ex, r_ε, D_{cap} (wiele znaków w klamrach albo do końca słowa),
   • `^` — wykładnik: ae^2, D^{4} (albo gotowe ² ³),
   • `√(…)` — pierwiastek z kreską nad wyrażeniem w nawiasie,
   • kilka wzorów w jednej ramce — rozdzielone średnikiem `;`.
  Zmienne (litery) kursywą, indeksy i liczby prosto, π i nazwy funkcji (sin, cos, tg…) prosto — jak w ISO 80000-2.
  Legenda (`legend`): wpisy rozdzielone średnikiem, „symbol — znaczenie [jednostka]”.
  Krój ten sam co treść (Inter), rozmiar --fs-h3; ramka = karta ze standardu UI.
*/

const FUNCS = new Set(["sin", "cos", "tg", "tan", "ctg", "cot", "ln", "log", "min", "max", "exp"]);
const UPRIGHT = new Set(["π", "e"]);
const LETTER = /\p{L}/u;

/** Indeks lub wykładnik po `_`/`^`: `{…}` albo ciąg liter i cyfr. Zwraca treść i nową pozycję. */
function script(s: string, i: number): [string, number] {
  if (s[i] === "{") { const j = s.indexOf("}", i); return j < 0 ? [s.slice(i + 1), s.length] : [s.slice(i + 1, j), j + 1]; }
  let j = i;
  while (j < s.length && /[\p{L}\d.,]/u.test(s[j])) j++;
  return [s.slice(i, j), j];
}

/** Zapis wzoru → elementy React (kursywa zmiennych, indeksy, pierwiastek). */
export function formula(s: string, key = "f"): ReactNode[] {
  const out: ReactNode[] = [];
  let buf = "";
  const flush = () => { if (buf) { out.push(buf); buf = ""; } };
  let i = 0, k = 0;
  while (i < s.length) {
    const ch = s[i];
    if (ch === "√" && s[i + 1] === "(") {
      let depth = 0, j = i + 1;
      for (; j < s.length; j++) { if (s[j] === "(") depth++; else if (s[j] === ")" && --depth === 0) break; }
      flush();
      out.push(<span key={`${key}${k++}`} className="wz-sqrt">√<span className="wz-rad">{formula(s.slice(i + 2, j), `${key}${k}r`)}</span></span>);
      i = j + 1;
      continue;
    }
    if (ch === "_" || ch === "^") {
      const [t, j] = script(s, i + 1);
      flush();
      out.push(ch === "_" ? <sub key={`${key}${k++}`}>{t}</sub> : <sup key={`${key}${k++}`}>{t}</sup>);
      i = j;
      continue;
    }
    if (LETTER.test(ch)) {
      let j = i;
      while (j < s.length && LETTER.test(s[j])) j++;
      const w = s.slice(i, j);
      flush();
      if (FUNCS.has(w) || UPRIGHT.has(w)) out.push(<span key={`${key}${k++}`} className="wz-fn">{w}</span>);
      else out.push(<i key={`${key}${k++}`}>{w}</i>);
      i = j;
      continue;
    }
    buf += ch;
    i++;
  }
  flush();
  return out;
}

/** Tekst wzoru do czytnika ekranu: bez znaków `_`, `^` i klamer. */
export const formulaText = (s: string) => s.replace(/[_{}]/g, "").replace(/\^/g, " do potęgi ");

export interface LegendItem { sym: string; desc: string; unit?: string }
/** „V_c — prędkość skrawania [m/min]; D — średnica [mm]” → wpisy legendy. */
export function parseLegend(legend: string): LegendItem[] {
  return legend.split(";").map((e) => e.trim()).filter(Boolean).map((e) => {
    const m = e.match(/^(.+?)\s+[—–-]\s+(.+)$/);
    const sym = (m ? m[1] : e).trim();
    let desc = (m ? m[2] : "").trim(), unit: string | undefined;
    const u = desc.match(/\s*\[([^\]]+)\]$/);
    if (u) { unit = u[1]; desc = desc.slice(0, u.index).trim(); }
    return { sym, desc, unit };
  });
}

export default function Wzor({ f, legend, caption }: { f: string; legend?: string; caption?: string }) {
  const lines = f.split(";").map((x) => x.trim()).filter(Boolean);
  const items = legend ? parseLegend(legend) : [];
  return (
    <figure className="wzor">
      {caption && <figcaption className="wzor-cap">{caption}</figcaption>}
      <div className="wzor-f">
        {lines.map((l, n) => <div key={n} role="math" aria-label={formulaText(l)} className="wzor-line">{formula(l, `l${n}`)}</div>)}
      </div>
      {items.length > 0 && (
        <dl className="wzor-leg">
          {items.map((it, n) => [
            <dt key={`t${n}`}>{formula(it.sym, `s${n}`)}</dt>,
            <dd key={`d${n}`}>{it.desc}{it.unit && <span className="wzor-unit">{it.unit}</span>}</dd>,
          ])}
        </dl>
      )}
    </figure>
  );
}
