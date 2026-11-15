"use client";
import { useEffect, useRef, type ReactNode } from "react";
import {
  ANCHORS, ARROWS, ARROW_LABEL, FILLS, FILL_LABEL, H_MAX, H_MIN, ITEM_LABEL, KIND_LABEL, LINE_KINDS, POSITIONS, PT_COLORS, SIZES, TEXT_COLORS,
  TEXT_COLOR_LABEL, type Arrow, type Fill, type Item, type LineKind, type RysDoc, type Size, type TextColor,
} from "@/lib/rys/model";
import { icons } from "./icons";
import { LINE_CLASS } from "./render";

/* Panel właściwości rysownika: styl z zamkniętych list, dokładne współrzędne, kolejność i lista elementów. */

export interface Style { k: LineKind; thick: boolean; arrow: Arrow; fill: Fill; size: Size; bold: boolean; mono: boolean; color: TextColor }
export const DEFAULT_STYLE: Style = { k: "con", thick: false, arrow: "none", fill: "none", size: "md", bold: false, mono: false, color: "ink" };
export type PanelAction = "dup" | "del" | "up" | "down" | "top" | "bottom" | "flip" | "left" | "cx" | "right" | "atop" | "cy" | "abottom";

interface Props {
  doc: RysDoc; sel: string[]; drawing: boolean; style: Style; focusKey: number;
  /** zmiana zaznaczonych: "set" = od razu z wpisem do historii, "live" = w trakcie pisania (historia przy settle) */
  edit: (fn: (it: Item) => Item, mode?: "set" | "live") => void;
  settle: () => void;
  onStyle: (p: Partial<Style>) => void;
  onHeight: (h: number) => void;
  onSelect: (ids: string[]) => void;
  onAction: (a: PanelAction) => void;
}

const SIZE_LABEL: Record<Size, string> = { sm: "S", md: "M", lg: "L" };
const ANCHOR_LABEL = { start: "od lewej", middle: "środek", end: "do prawej" } as const;
const POS_LABEL = { n: "↑", ne: "↗", e: "→", se: "↘", s: "↓", sw: "↙", w: "←", nw: "↖" } as const;
const PT_LABEL = { ink: "Biały", cut: "G01", rap: "G00", arc: "G02/G03" } as const;

function Group({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rys-group"><h3>{title}</h3>{children}</section>;
}
function Row({ label, children }: { label: string; children: ReactNode }) {
  return <label className="rys-row"><span>{label}</span>{children}</label>;
}

/** Liczba: podgląd w trakcie pisania, wpis do historii po wyjściu z pola. */
function Num({ label, value, onLive, settle, step = 5, min, max }: { label: string; value: number; onLive: (v: number) => void; settle: () => void; step?: number; min?: number; max?: number }) {
  return (
    <label className="rys-num"><span>{label}</span>
      <input type="number" value={value} step={step} min={min} max={max} onBlur={settle}
        onChange={(e) => { const v = e.target.valueAsNumber; if (Number.isFinite(v)) onLive(Math.min(max ?? 800, Math.max(min ?? -200, Math.round(v * 2) / 2))); }} />
    </label>
  );
}

function KindPicker({ value, onPick }: { value: LineKind | null; onPick: (k: LineKind) => void }) {
  return (
    <div className="rys-kinds" role="radiogroup" aria-label="Rodzaj linii">
      {LINE_KINDS.map((k) => (
        <button key={k} type="button" role="radio" aria-checked={value === k} className="rys-kind" onClick={() => onPick(k)}>
          <span className="fig rys-sw"><svg viewBox="0 0 30 10" aria-hidden><line x1="2" y1="5" x2="28" y2="5" className={LINE_CLASS[k]} /></svg></span>
          {KIND_LABEL[k]}
        </button>
      ))}
    </div>
  );
}

function Seg<T extends string>({ label, options, value, onPick, text }: { label: string; options: readonly T[]; value: T | null; onPick: (v: T) => void; text: (v: T) => string }) {
  return (
    <div className="rys-seg" role="radiogroup" aria-label={label}>
      {options.map((o) => <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => onPick(o)}>{text(o)}</button>)}
    </div>
  );
}

/** wspólna wartość pola wśród elementów, które je mają; null = różne albo brak */
function common<K extends string>(items: Item[], key: K): unknown {
  const vals = items.filter((it) => key in it).map((it) => (it as unknown as Record<string, unknown>)[key]);
  return vals.length && vals.every((v) => v === vals[0]) ? vals[0] : null;
}
const has = (items: Item[], key: string) => items.some((it) => key in it);
const set = (key: string, v: unknown) => (it: Item): Item => (key in it ? ({ ...it, [key]: v } as Item) : it);

function describe(it: Item): string {
  if (it.t === "text") return `„${it.s}”`;
  if (it.t === "dim" || it.t === "pt") return it.label ? `„${it.label}”` : "";
  if (it.t === "step") return String(it.n);
  if ("k" in it) return KIND_LABEL[it.k].toLowerCase();
  return "";
}

export default function PropsPanel({ doc, sel, drawing, style, focusKey, edit, settle, onStyle, onHeight, onSelect, onAction }: Props) {
  const items = doc.items.filter((it) => sel.includes(it.id));
  const one = items.length === 1 ? items[0] : null;
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => { if (focusKey) { first.current?.focus(); first.current?.select(); } }, [focusKey]);

  const live = (key: string) => (v: number) => edit(set(key, v), "live");
  const num = (label: string, key: string, o: { step?: number; min?: number; max?: number } = {}) =>
    one && key in one ? <Num key={key} label={label} value={(one as unknown as Record<string, number>)[key]} onLive={live(key)} settle={settle} {...o} /> : null;

  const styled = items.length > 0;
  // bez zaznaczenia panel ustawia styl następnego rysowanego elementu
  const lineish = styled ? has(items, "k") : drawing;
  // wybrany styl staje się też stylem następnego elementu („ostatnio użyty”)
  const pick = <K extends keyof Style>(key: K, v: Style[K]) => { if (styled) edit(set(key, v)); onStyle({ [key]: v } as Partial<Style>); };
  const val = <K extends keyof Style>(key: K): Style[K] | null => (styled ? (common(items, key) as Style[K] | null) : style[key]);

  return (
    <aside className="rys-panel" aria-label="Właściwości">
      <Group title={styled ? (one ? ITEM_LABEL[one.t] : `Zaznaczono: ${items.length}`) : drawing ? "Styl nowego elementu" : "Rysunek"}>
        {!styled && !drawing && (
          <>
            <div className="rys-nums"><Num label="Wysokość" value={doc.h} step={10} min={H_MIN} max={H_MAX} onLive={onHeight} settle={settle} /></div>
            <p className="rys-tip">Szerokość rysunku jest stała: 360 jednostek, jak wszystkie rysunki serwisu. Wybierz narzędzie z paska i rysuj. Kolory i grubości linii pochodzą z listy rodzajów.</p>
          </>
        )}
        {one?.t === "text" && (
          <>
            <Row label="Treść"><input ref={first} type="text" value={one.s} maxLength={80} onBlur={settle} onChange={(e) => edit(set("s", e.target.value || " "), "live")} /></Row>
            <Seg label="Rozmiar" options={SIZES} value={one.size} onPick={(v) => edit(set("size", v))} text={(v) => SIZE_LABEL[v]} />
            <div className="rys-checks">
              <label><input type="checkbox" checked={one.bold} onChange={(e) => edit(set("bold", e.target.checked))} /> Pogrubiony</label>
              <label><input type="checkbox" checked={one.mono} onChange={(e) => edit(set("mono", e.target.checked))} /> Kod (mono)</label>
            </div>
            <Row label="Kolor"><select value={one.color} onChange={(e) => edit(set("color", e.target.value))}>{TEXT_COLORS.map((c) => <option key={c} value={c}>{TEXT_COLOR_LABEL[c]}</option>)}</select></Row>
            <Seg label="Wyrównanie" options={ANCHORS} value={one.anchor} onPick={(v) => edit(set("anchor", v))} text={(v) => ANCHOR_LABEL[v]} />
          </>
        )}
        {one?.t === "dim" && (
          <>
            <Row label="Opis"><input ref={first} type="text" value={one.label} maxLength={40} placeholder="np. 80 albo ⌀30" onBlur={settle} onChange={(e) => edit(set("label", e.target.value), "live")} /></Row>
            <button type="button" className="rys-btn" onClick={() => edit((it) => (it.t === "dim" ? { ...it, side: it.side === 1 ? -1 : 1 } : it))}>{icons.flip} Opis po drugiej stronie linii</button>
          </>
        )}
        {one?.t === "pt" && (
          <>
            <Row label="Opis"><input ref={first} type="text" value={one.label} maxLength={40} placeholder="np. W albo P1" onBlur={settle} onChange={(e) => edit(set("label", e.target.value), "live")} /></Row>
            <Seg label="Położenie opisu" options={POSITIONS} value={one.pos} onPick={(v) => edit(set("pos", v))} text={(v) => POS_LABEL[v]} />
            <Seg label="Kolor punktu" options={PT_COLORS} value={one.color} onPick={(v) => edit(set("color", v))} text={(v) => PT_LABEL[v]} />
          </>
        )}
        {lineish && (
          <>
            <KindPicker value={val("k")} onPick={(k) => pick("k", k)} />
            <div className="rys-checks">
              <label><input type="checkbox" checked={val("thick") === true} onChange={(e) => pick("thick", e.target.checked)} /> Gruba linia</label>
              {one?.t === "poly" && <label><input type="checkbox" checked={one.closed} onChange={(e) => edit(set("closed", e.target.checked))} /> Zamknięta</label>}
            </div>
            {(!styled || has(items, "arrow")) && <Row label="Groty"><select value={val("arrow") ?? ""} onChange={(e) => pick("arrow", e.target.value as Arrow)}>{val("arrow") === null && <option value="">—</option>}{ARROWS.map((a) => <option key={a} value={a}>{ARROW_LABEL[a]}</option>)}</select></Row>}
            {(!styled || has(items, "fill")) && <Row label="Wypełnienie"><select value={val("fill") ?? ""} onChange={(e) => pick("fill", e.target.value as Fill)}>{val("fill") === null && <option value="">—</option>}{FILLS.map((f) => <option key={f} value={f}>{FILL_LABEL[f]}</option>)}</select></Row>}
          </>
        )}
      </Group>

      {one && one.t !== "poly" && (
        <Group title="Położenie i wymiary">
          <div className="rys-nums">
            {num("X1", "x1")}{num("Y1", "y1")}{num("X2", "x2")}{num("Y2", "y2")}
            {num("X", "x")}{num("Y", "y")}{num("X śr.", "cx")}{num("Y śr.", "cy")}
            {one.t !== "grid" && one.t !== "rect" ? null : <>{num("Szer.", "w", { min: 0.5 })}{num("Wys.", "h", { min: 0.5 })}</>}
            {one.t === "rect" && num("Naroże R", "r", { step: 1, min: 0, max: 100 })}
            {(one.t === "circle" || one.t === "arc") && num("Promień", "r", { min: 0.5 })}
            {num("Kąt od", "a0", { step: 15, min: -360, max: 360 })}{num("Kąt do", "a1", { step: 15, min: -360, max: 360 })}
            {num("Odsunięcie", "off", { min: -200, max: 200 })}
            {num("Numer", "n", { step: 1, min: 1, max: 99 })}
            {num("Drobna", "minor", { step: 2.5, min: 2.5, max: 50 })}{num("Gruba", "major", { step: 5, min: 5, max: 100 })}
          </div>
        </Group>
      )}

      {styled && (
        <Group title="Działania">
          <div className="rys-acts">
            <button type="button" className="rys-btn" onClick={() => onAction("dup")} title="Duplikuj (Ctrl+D)">{icons.copy} Duplikuj</button>
            <button type="button" className="rys-btn" onClick={() => onAction("del")} title="Usuń (Delete)">{icons.trash} Usuń</button>
            <button type="button" className="rys-btn" onClick={() => onAction("up")} title="Wyżej ( ] )">{icons.up} Wyżej</button>
            <button type="button" className="rys-btn" onClick={() => onAction("down")} title="Niżej ( [ )">{icons.down} Niżej</button>
            {one && (one.t === "line" || one.t === "arc") && <button type="button" className="rys-btn" onClick={() => onAction("flip")}>{icons.flip} Odwróć kierunek</button>}
          </div>
          {items.length > 1 && (
            <div className="rys-seg" aria-label="Wyrównaj zaznaczone">
              {([["left", "⇤"], ["cx", "↔"], ["right", "⇥"], ["atop", "⤒"], ["cy", "↕"], ["abottom", "⤓"]] as const).map(([a, t]) => (
                <button key={a} type="button" onClick={() => onAction(a)} title={{ left: "Wyrównaj do lewej", cx: "Wyśrodkuj w poziomie", right: "Wyrównaj do prawej", atop: "Wyrównaj do góry", cy: "Wyśrodkuj w pionie", abottom: "Wyrównaj do dołu" }[a]}>{t}</button>
              ))}
            </div>
          )}
        </Group>
      )}

      <Group title={`Elementy (${doc.items.length})`}>
        {doc.items.length === 0 ? <p className="rys-tip">Pusty rysunek. Zacznij od konturu: narzędzie Prostokąt albo Polilinia.</p> : (
          <ol className="rys-layers">
            {[...doc.items].reverse().map((it) => (
              <li key={it.id}>
                <button type="button" aria-pressed={sel.includes(it.id)} onClick={(e) => onSelect(e.shiftKey ? (sel.includes(it.id) ? sel.filter((s) => s !== it.id) : [...sel, it.id]) : [it.id])}>
                  <b>{ITEM_LABEL[it.t]}</b> <span>{describe(it)}</span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </Group>
    </aside>
  );
}
