"use client";
import { useEffect, useRef, useState } from "react";
import type { MathfieldElement } from "mathlive";
import { fromField, tex, texError, toField } from "@/components/Wzor";
import { useTheme } from "@/lib/ui/prefs";

/*
  Pole wzoru w panelu edytora (blok <Wzor>) — edycja jak w edytorze równań Worda (MathLive):
  wzór widać od razu złożony, a szablony wstawiają pola do uzupełnienia (kwadraciki): ułamek = licznik nad
  mianownikiem, indeks = mniejsze pole przy literze, pierwiastek, nawiasy, suma, całka… Tab przechodzi do
  kolejnego pola. Zaznaczony fragment trafia do szablonu (zaznacz „1000”, kliknij ułamek → 1000 w liczniku).
  Kilka wzorów jeden pod drugim: „Nowy wiersz” / Ctrl+Enter. Paleta (przyciski pokazują złożony element)
  + klawiatura ekranowa MathLive („Więcej znaków”). Wynik zapisuje się jako LaTeX (atrybut f),
  zapis widać i można poprawić w „Zapis LaTeX”. Fonty: KaTeX z katex.min.css (te same rodziny co MathLive).
*/

interface El { t: string; title: string; label?: string }
// [wstawiany zapis, opis, (opcjonalnie) zapis etykiety przycisku — domyślnie wstawiany zapis z □ w polach]
const els = (rows: string[][]): El[] => rows.map(([t, title, label]) => ({ t, title, label }));
// składnia wstawiania MathLive: #@ — zaznaczenie albo poprzedni element, #0 — zaznaczenie albo pole, #? — puste pole
const GRUPY: { name: string; items: El[] }[] = [
  { name: "Układ", items: els([
    ["\\frac{#@}{#?}", "Ułamek: licznik nad mianownikiem"],
    ["#@_{#?}", "Indeks dolny (V_c)"],
    ["#@^{#?}", "Potęga / indeks górny"],
    ["#@_{#?}^{#?}", "Indeks dolny i górny"],
    ["\\sqrt{#0}", "Pierwiastek kwadratowy"],
    ["\\sqrt[#?]{#0}", "Pierwiastek n-tego stopnia"],
    ["\\left(#0\\right)", "Nawiasy dopasowane do wysokości"],
    ["\\left[#0\\right]", "Nawiasy kwadratowe"],
    ["\\left|#0\\right|", "Wartość bezwzględna"],
    ["\\overline{#0}", "Kreska nad (wartość średnia)"],
    ["\\vec{#0}", "Wektor"],
    ["\\sum_{#?}^{#?}#0", "Suma z granicami"],
    ["\\int_{#?}^{#?}#0\\,\\mathrm{d}#?", "Całka oznaczona"],
    ["\\lim_{#?\\to#?}#0", "Granica"],
    ["\\begin{cases}#? & #? \\\\ #? & #?\\end{cases}", "Przypadki (klamra)"],
    ["\\text{#0}", "Zwykły tekst we wzorze (np. obr/min)", "\\text{Aa}"],
  ]) },
  { name: "Działania", items: els([
    ["\\cdot", "Mnożenie"], ["\\times", "Razy (wymiary)"], ["\\div", "Dzielenie"], ["\\pm", "Plus minus"], ["\\mp", "Minus plus"],
    ["\\approx", "W przybliżeniu"], ["\\propto", "Proporcjonalne do"], ["\\ne", "Różne"], ["\\equiv", "Tożsame"],
    ["\\le", "Mniejsze lub równe"], ["\\ge", "Większe lub równe"], ["\\ll", "Dużo mniejsze"], ["\\gg", "Dużo większe"],
    ["\\infty", "Nieskończoność"], ["\\partial", "Pochodna cząstkowa"], ["\\nabla", "Nabla"], ["\\%", "Procent"],
  ]) },
  { name: "Strzałki i geometria", items: els([
    ["\\to", "Dąży do / przechodzi w"], ["\\Rightarrow", "Wynika"], ["\\Leftrightarrow", "Równoważne"], ["\\uparrow", "Rośnie"], ["\\downarrow", "Maleje"],
    ["^{\\circ}", "Stopnie"], ["\\angle", "Kąt"], ["\\perp", "Prostopadłe"], ["\\parallel", "Równoległe"], ["\\triangle", "Trójkąt"], ["\\varnothing", "Średnica (znak ⌀)"],
    ["\\in", "Należy do"], ["\\notin", "Nie należy do"], ["\\subset", "Zawiera się"], ["\\cup", "Suma zbiorów"], ["\\cap", "Część wspólna"], ["\\forall", "Dla każdego"], ["\\exists", "Istnieje"],
  ]) },
  { name: "Greckie", items: els(
    "alpha beta gamma delta varepsilon zeta eta theta kappa lambda mu nu xi pi rho sigma tau varphi chi psi omega Gamma Delta Theta Lambda Pi Sigma Phi Psi Omega"
      .split(" ").map((n) => [`\\${n}`, n]),
  ) },
  { name: "Funkcje", items: els(
    ["sin", "cos", "tg", "ctg", "arcsin", "arccos", "arctg", "log", "ln", "exp", "max", "min"]
      .map((n) => [["tg", "ctg", "arctg"].includes(n) ? `\\operatorname{${n}}` : `\\${n}`, `Funkcja ${n}`]),
  ) },
];

type Kbd = { visible: boolean; show: () => void; hide: () => void };

export default function WzorPole({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const host = useRef<HTMLDivElement>(null);
  const mf = useRef<MathfieldElement | null>(null);
  const last = useRef(value);
  const change = useRef(onChange);
  useEffect(() => { change.current = onChange; }, [onChange]);
  const [tab, setTab] = useState(0);
  const [ready, setReady] = useState(false);
  const err = value.trim() ? texError(value) : null;

  // pole MathLive tworzone w przeglądarce (biblioteka tylko w edytorze — dynamiczny import)
  useEffect(() => {
    let alive = true;
    void import("mathlive").then(({ MathfieldElement: MF }) => {
      if (!alive || !host.current) return;
      MF.fontsDirectory = null;   // fonty KaTeX z katex.min.css
      MF.soundsDirectory = null;
      MF.locale = "pl";
      MF.decimalSeparator = ",";
      const el = new MF();
      el.mathVirtualKeyboardPolicy = "manual";
      el.smartFence = true;
      el.value = toField(last.current);
      el.setAttribute("aria-label", "Wzór — edycja");
      el.addEventListener("input", () => { const v = fromField(el.value); last.current = v; change.current(v); });
      host.current.replaceChildren(el);
      mf.current = el;
      setReady(true);
    });
    return () => { alive = false; };
  }, []);

  // klawiatura ekranowa MathLive bierze motyw z atrybutu theme przodka (dołączana do <body>)
  const theme = useTheme();
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("theme", theme);
    return () => html.removeAttribute("theme");
  }, [theme]);

  // zmiana z zewnątrz (zapis LaTeX, wybór innego bloku) → pole
  useEffect(() => {
    if (mf.current && value !== last.current) { mf.current.value = toField(value); last.current = value; }
  }, [value]);

  const run = (cmd: Parameters<MathfieldElement["executeCommand"]>[0]) => {
    const el = mf.current;
    if (!el) return;
    el.focus();
    el.executeCommand(cmd);
    const v = fromField(el.value);
    last.current = v;
    onChange(v);
  };
  const insert = (t: string) => run(["insert", t, { insertionMode: "replaceSelection", selectionMode: "placeholder", format: "latex" }]);
  const keyboard = () => {
    mf.current?.focus();
    const k = (window as unknown as { mathVirtualKeyboard?: Kbd }).mathVirtualKeyboard;
    if (k) { if (k.visible) k.hide(); else k.show(); }
  };

  return (
    <div className="ed-field ed-wzor-pole">
      <span>Wzór</span>
      <div className="ed-wzor-tabs" role="tablist" aria-label="Elementy wzoru">
        {GRUPY.map((g, i) => <button key={g.name} type="button" role="tab" aria-selected={tab === i} onClick={() => setTab(i)}>{g.name}</button>)}
      </div>
      <div className="ed-wzor-pal" role="group" aria-label={GRUPY[tab].name}>
        {GRUPY[tab].items.map((it) => (
          <button key={it.t} type="button" title={it.title} aria-label={it.title} disabled={!ready} onMouseDown={(e) => e.preventDefault()} onClick={() => insert(it.t)}
            dangerouslySetInnerHTML={{ __html: tex(it.label ?? it.t.replace(/#[@0?]/g, "\\square "), false) }} />
        ))}
      </div>
      <div ref={host} className="ed-wzor-mf" />
      <div className="ed-wzor-acts">
        <button type="button" className="rys-btn" disabled={!ready} title="Nowy wiersz wzoru pod spodem (Ctrl+Enter)" onMouseDown={(e) => e.preventDefault()} onClick={() => run(["addRowAfter"])}>↵ Nowy wiersz</button>
        <button type="button" className="rys-btn" disabled={!ready} onMouseDown={(e) => e.preventDefault()} onClick={keyboard}>Więcej znaków (klawiatura)</button>
      </div>
      {err ? <small className="ed-wzor-err">Błąd zapisu: {err}</small>
        : <small>Kliknij szablon — pojawią się pola do uzupełnienia (□). Tab: następne pole, strzałka →: wyjście z indeksu lub ułamka. Zaznaczony fragment trafia do szablonu. Przecinek dziesiętny: 0,05.</small>}
      <details className="ed-wzor-latex">
        <summary>Zapis LaTeX</summary>
        <textarea className="is-mono" rows={3} value={value} spellCheck={false} aria-label="Zapis wzoru (LaTeX)" onChange={(e) => onChange(e.target.value)} />
      </details>
    </div>
  );
}
