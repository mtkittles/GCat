"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ANCHORS, ARROWS, ARROW_LABEL, isDim, measure, DIM_ORIENT, DIM_ORIENT_LABEL, FILLS, FILL_LABEL, fmt, FONTS, FONT_LABEL, FONT_SIZES, H_MAX, H_MIN, ITEM_LABEL, KIND_LABEL, LINE_KINDS,
  MEASURE, POSITIONS, PT_COLORS, strokeOf, TEXT_COLORS, TEXT_COLOR_LABEL, WIDTHS, WIDTH_LABEL,
  type Arrow, type Fill, type Font, type Item, type LineKind, type RysDoc, type TextColor, type Width,
} from "@/lib/rys/model";
import { icons } from "./icons";
import { LINE_CLASS } from "./render";

/* Panel właściwości rysownika: styl z zamkniętych list, dokładne współrzędne, kolejność i lista elementów. */

export interface Style { k: LineKind; sw: Width; arrow: Arrow; fill: Fill; size: number; font: Font; bold: boolean; color: TextColor; dimSize: number; dimFont: Font }
export const DEFAULT_STYLE: Style = { k: "con", sw: "auto", arrow: "none", fill: "none", size: 11, font: "sans", bold: false, color: "ink", dimSize: 10.5, dimFont: "mono" };
export type PanelAction = "dup" | "del" | "up" | "down" | "top" | "bottom" | "flip" | "left" | "cx" | "right" | "atop" | "cy" | "abottom";
export type PanelTool = "select" | "line" | "poly" | "rect" | "circle" | "arc" | "arcc" | "text" | "dim" | "pt" | "step" | "grid";

interface Props {
  doc: RysDoc; sel: string[]; tool: PanelTool; style: Style; focusKey: number;
  /** zmiana zaznaczonych: "set" = od razu z wpisem do historii, "live" = w trakcie pisania (historia przy settle) */
  edit: (fn: (it: Item) => Item, mode?: "set" | "live") => void;
  settle: () => void;
  onStyle: (p: Partial<Style>) => void;
  onDoc: (p: Partial<Pick<RysDoc, "h" | "k">>) => void;
  onSelect: (ids: string[]) => void;
  onAction: (a: PanelAction) => void;
  /** obrót o kąt (stopnie, + przeciwnie do zegara jak w CAD) albo skala względem punktu obrotu zaznaczenia */
  onTransform: (kind: "rot" | "scale", v: number) => void;
}

const ANCHOR_LABEL = { start: "od lewej", middle: "środek", end: "do prawej" } as const;
const POS_LABEL = { n: "↑", ne: "↗", e: "→", se: "↘", s: "↓", sw: "↙", w: "←", nw: "↖" } as const;
const PT_LABEL = { ink: "Biały", cut: "G01", rap: "G00", arc: "G02/G03" } as const;
const LINE_TOOLS = new Set<PanelTool>(["line", "poly", "rect", "circle", "arc", "arcc"]);
const ARROW_TOOLS = new Set<PanelTool>(["line", "poly", "arc", "arcc"]);
const FILL_TOOLS = new Set<PanelTool>(["poly", "rect", "circle"]);

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
        onChange={(e) => { const v = e.target.valueAsNumber; if (Number.isFinite(v)) onLive(Math.min(max ?? 1000, Math.max(min ?? -400, Math.round(v * 100) / 100))); }} />
    </label>
  );
}

function KindPicker({ value, onPick }: { value: LineKind | null; onPick: (k: LineKind) => void }) {
  return (
    <div className="rys-kinds" role="radiogroup" aria-label="Rodzaj linii">
      {LINE_KINDS.map((k) => (
        <button key={k} type="button" role="radio" aria-checked={value === k} className="rys-kind" onClick={() => onPick(k)}>
          <span className="fig rys-sw"><svg viewBox="0 0 30 10" aria-hidden>{k === "none" ? <rect x="2" y="2" width="26" height="6" className="rys-sw-fill" /> : <line x1="2" y1="5" x2="28" y2="5" className={LINE_CLASS[k]} />}</svg></span>
          {KIND_LABEL[k]}
        </button>
      ))}
    </div>
  );
}

/** Grubość: próbka linii o rzeczywistej grubości (dla „wg rodzaju” — grubość rodzaju). */
function WidthPicker({ value, kind, onPick }: { value: Width | null; kind: LineKind; onPick: (w: Width) => void }) {
  return (
    <div className="rys-widths" role="radiogroup" aria-label="Grubość linii">
      {WIDTHS.map((w) => (
        <button key={w} type="button" role="radio" aria-checked={value === w} title={w === "auto" ? "Grubość wg rodzaju linii" : `Grubość ${WIDTH_LABEL[w]}`} onClick={() => onPick(w)}>
          <svg viewBox="0 0 30 12" aria-hidden><line x1="3" y1="6" x2="27" y2="6" style={{ strokeWidth: strokeOf(kind === "none" ? "con" : kind, w) * 1.4 }} /></svg>
          <span>{WIDTH_LABEL[w]}</span>
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

function SizeSelect({ value, onPick }: { value: number | null; onPick: (v: number) => void }) {
  return (
    <Row label="Rozmiar">
      <select value={value ?? ""} onChange={(e) => onPick(+e.target.value)}>
        {value === null && <option value="">—</option>}
        {FONT_SIZES.map((s) => <option key={s} value={s}>{fmt(s)}</option>)}
      </select>
    </Row>
  );
}

/** wspólna wartość pola wśród elementów, które je mają; null = różne albo brak */
function common(items: Item[], key: string): unknown {
  const vals = items.filter((it) => key in it).map((it) => (it as unknown as Record<string, unknown>)[key]);
  return vals.length && vals.every((v) => v === vals[0]) ? vals[0] : null;
}
const has = (items: Item[], key: string) => items.some((it) => key in it);
const set = (key: string, v: unknown) => (it: Item): Item => (key in it ? ({ ...it, [key]: v } as Item) : it);

function describe(it: Item): string {
  if (it.t === "text") return `„${it.s}”`;
  if (isDim(it)) return it.label.replace(MEASURE, "").replace(/^[⌀R]?°?$/, "") ? `„${it.label}”` : "";
  if (it.t === "pt") return it.label ? `„${it.label}”` : "";
  if (it.t === "step") return String(it.n);
  if ("k" in it) return KIND_LABEL[it.k].toLowerCase();
  return "";
}

/** Obrót o kąt i skala z klawiatury (jak ROTATE / SCALE w CAD). */
function TransformRow({ onTransform }: { onTransform: Props["onTransform"] }) {
  const [rot, setRot] = useState("90"), [sc, setSc] = useState("2");
  const go = (kind: "rot" | "scale", v: string) => { const n = Number(v.replace(",", ".")); if (Number.isFinite(n) && (kind === "rot" ? n !== 0 : n > 0)) onTransform(kind, n); };
  return (
    <div className="rys-xform">
      <label>Obróć o <input type="text" inputMode="decimal" value={rot} onChange={(e) => setRot(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") go("rot", rot); }} />°</label>
      <button type="button" className="rys-btn" onClick={() => go("rot", rot)} title="Obrót wokół punktu obrotu zaznaczenia, + przeciwnie do ruchu wskazówek zegara">Obróć</button>
      <label>Skala × <input type="text" inputMode="decimal" value={sc} onChange={(e) => setSc(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") go("scale", sc); }} /></label>
      <button type="button" className="rys-btn" onClick={() => go("scale", sc)} title="Skala względem punktu obrotu zaznaczenia">Skaluj</button>
    </div>
  );
}

export default function PropsPanel({ doc, sel, tool, style, focusKey, edit, settle, onStyle, onDoc, onSelect, onAction, onTransform }: Props) {
  const items = doc.items.filter((it) => sel.includes(it.id));
  const one = items.length === 1 ? items[0] : null;
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => { if (focusKey) { first.current?.focus(); first.current?.select(); } }, [focusKey]);

  const live = (key: string) => (v: number) => edit(set(key, v), "live");
  const num = (label: string, key: string, o: { step?: number; min?: number; max?: number } = {}) =>
    one && key in one ? <Num key={key} label={label} value={(one as unknown as Record<string, number>)[key]} onLive={live(key)} settle={settle} {...o} /> : null;

  const styled = items.length > 0;
  // bez zaznaczenia panel ustawia styl następnego elementu; wybrany styl zostaje też dla następnych („ostatnio użyty”)
  const pick = <K extends keyof Style>(key: K, v: Style[K], itemKey: string = key) => { if (styled) edit(set(itemKey, v)); onStyle({ [key]: v } as Partial<Style>); };
  const val = <K extends keyof Style>(key: K, itemKey: string = key): Style[K] | null => (styled ? (common(items, itemKey) as Style[K] | null) : style[key]);
  const lineish = styled ? has(items, "k") : LINE_TOOLS.has(tool);
  const arrowish = styled ? has(items, "arrow") : ARROW_TOOLS.has(tool);
  const fillish = styled ? has(items, "fill") : FILL_TOOLS.has(tool);
  const texty = styled ? items.every((it) => it.t === "text") : tool === "text";
  const dimmy = styled ? items.every(isDim) : tool === "dim";

  const title = styled ? (one ? ITEM_LABEL[one.t] : `Zaznaczono: ${items.length}`) : tool === "dim" ? "Nowy wymiar" : tool === "text" ? "Nowy tekst" : LINE_TOOLS.has(tool) ? "Styl nowego elementu" : "Rysunek";
  const measured = one && isDim(one) ? fmt(measure(one, doc.k || 1)) + (one.t === "dima" ? "°" : "") : "";

  return (
    <aside className="rys-panel" aria-label="Właściwości">
      <Group title={title}>
        {!styled && !lineish && !texty && !dimmy && (
          <>
            <div className="rys-nums">
              <Num label="Wysokość" value={doc.h} step={10} min={H_MIN} max={H_MAX} onLive={(h) => onDoc({ h })} settle={settle} />
              <Num label="1 mm = jedn." value={doc.k} step={0.5} min={0.05} max={50} onLive={(k) => onDoc({ k })} settle={settle} />
            </div>
            <p className="rys-tip">Szerokość rysunku jest stała: 360 jednostek. Skala mówi, ile jednostek rysunku to 1 mm. Z niej wymiar z opisem „{MEASURE}” liczy wartość.</p>
          </>
        )}

        {one?.t === "text" && <Row label="Treść"><input ref={first} type="text" value={one.s} maxLength={80} onBlur={settle} onChange={(e) => edit(set("s", e.target.value || " "), "live")} /></Row>}
        {texty && (
          <>
            <Seg label="Czcionka" options={FONTS} value={val("font")} onPick={(v) => pick("font", v)} text={(v) => FONT_LABEL[v]} />
            <SizeSelect value={val("size")} onPick={(v) => pick("size", v)} />
            <div className="rys-checks"><label><input type="checkbox" checked={val("bold") === true} onChange={(e) => pick("bold", e.target.checked)} /> Pogrubiony</label></div>
            <Row label="Kolor"><select value={val("color") ?? ""} onChange={(e) => pick("color", e.target.value as TextColor)}>{val("color") === null && <option value="">—</option>}{TEXT_COLORS.map((c) => <option key={c} value={c}>{TEXT_COLOR_LABEL[c]}</option>)}</select></Row>
            {styled && <Seg label="Wyrównanie" options={ANCHORS} value={common(items, "anchor") as (typeof ANCHORS)[number] | null} onPick={(v) => edit(set("anchor", v))} text={(v) => ANCHOR_LABEL[v]} />}
          </>
        )}

        {one && isDim(one) && (
          <>
            <Row label="Opis"><input ref={first} type="text" value={one.label} maxLength={40} placeholder={MEASURE} onBlur={settle} onChange={(e) => edit(set("label", e.target.value), "live")} /></Row>
            <p className="rys-tip">Zmierzono: <b className="rys-mono">{measured}</b>. W opisie <code>{MEASURE}</code> to ta wartość, np. <code>⌀{MEASURE}</code>, <code>R{MEASURE}</code>, <code>{MEASURE} h7</code>.</p>
            {one.t === "dim" && <Seg label="Kierunek wymiaru" options={DIM_ORIENT} value={one.o} onPick={(v) => edit(set("o", v))} text={(v) => DIM_ORIENT_LABEL[v]} />}
            {one.t === "dimr" && <Seg label="Rodzaj" options={["d", "r"] as const} value={one.d ? "d" : "r"} onPick={(v) => edit((it) => (it.t === "dimr" ? { ...it, d: v === "d", label: it.label.replace(/^[⌀R]/, v === "d" ? "⌀" : "R") } : it))} text={(v) => (v === "d" ? "Średnica ⌀" : "Promień R")} />}
            {one.t === "dimr" && <p className="rys-tip">Przeciągnij uchwyt na końcu linii, żeby zmienić kierunek i położenie opisu (do środka albo na zewnątrz).</p>}
            {one.t === "dima" && <p className="rys-tip">Uchwyt na łuku zmienia promień łuku wymiarowego i ćwiartkę mierzonego kąta.</p>}
          </>
        )}
        {dimmy && (
          <>
            <Seg label="Czcionka opisu" options={FONTS} value={val("dimFont", "font")} onPick={(v) => pick("dimFont", v, "font")} text={(v) => FONT_LABEL[v]} />
            <SizeSelect value={val("dimSize", "size")} onPick={(v) => pick("dimSize", v, "size")} />
            {styled && items.every((it) => it.t === "dim") && (
              <div className="rys-checks">
                <label><input type="checkbox" checked={common(items, "hz") === true} onChange={(e) => edit(set("hz", e.target.checked))} /> Opis zawsze poziomo</label>
                <button type="button" className="rys-btn" onClick={() => edit((it) => (it.t === "dim" ? { ...it, side: it.side === 1 ? -1 : 1 } : it))}>{icons.flip} Opis na drugą stronę</button>
              </div>
            )}
            {!styled && <p className="rys-tip">Rodzaj wymiaru wybierasz na pasku nad rysunkiem. W trybie „Auto” kliknięcie w okrąg daje średnicę, w łuk — promień, a dwa punkty — wymiar poziomy albo pionowy zależnie od położenia kursora, jak w CAD.</p>}
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
            <div className="rys-sub-h">Grubość</div>
            <WidthPicker value={val("sw")} kind={(val("k") as LineKind | null) ?? "con"} onPick={(w) => pick("sw", w)} />
            {arrowish && <Row label="Groty"><select value={val("arrow") ?? ""} onChange={(e) => pick("arrow", e.target.value as Arrow)}>{val("arrow") === null && <option value="">—</option>}{ARROWS.map((a) => <option key={a} value={a}>{ARROW_LABEL[a]}</option>)}</select></Row>}
            {fillish && <Row label="Wypełnienie"><select value={val("fill") ?? ""} onChange={(e) => pick("fill", e.target.value as Fill)}>{val("fill") === null && <option value="">—</option>}{FILLS.map((f) => <option key={f} value={f}>{FILL_LABEL[f]}</option>)}</select></Row>}
            {one?.t === "poly" && <div className="rys-checks"><label><input type="checkbox" checked={one.closed} onChange={(e) => edit(set("closed", e.target.checked))} /> Zamknięta</label></div>}
          </>
        )}
      </Group>

      {one && one.t !== "poly" && (
        <Group title="Położenie i wymiary">
          <div className="rys-nums">
            {num("X1", "x1")}{num("Y1", "y1")}{num("X2", "x2")}{num("Y2", "y2")}
            {num("X", "x")}{num("Y", "y")}{num("X śr.", "cx")}{num("Y śr.", "cy")}
            {(one.t === "grid" || one.t === "rect") && <>{num("Szer.", "w", { min: 0.01 })}{num("Wys.", "h", { min: 0.01 })}</>}
            {one.t === "rect" && num("Naroże R", "r", { step: 1, min: 0, max: 100 })}
            {(one.t === "circle" || one.t === "arc") && num("Promień", "r", { min: 0.01 })}
            {one.t === "arc" && <>{num("Kąt od", "a0", { step: 15, min: -720, max: 720 })}{num("Kąt do", "a1", { step: 15, min: -720, max: 720 })}</>}
            {one.t === "dimr" && <>{num("Promień", "r", { min: 0.01 })}{num("Kierunek °", "a", { step: 15, min: -720, max: 720 })}{num("Wysięg opisu", "ext", { min: -800, max: 400 })}</>}
            {one.t === "dima" && <>{num("Kąt od", "a1", { step: 15, min: -720, max: 720 })}{num("Kąt do", "a2", { step: 15, min: -720, max: 720 })}{num("Promień łuku", "r", { min: 1, max: 800 })}</>}
            {num("Odsunięcie", "off", { min: -400, max: 400 })}
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
          <TransformRow onTransform={onTransform} />
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
        {doc.items.length === 0 ? <p className="rys-tip">Pusty rysunek. Zacznij od konturu (Prostokąt albo Polilinia) albo zaimportuj rysunek ze strony.</p> : (
          <ol className="rys-layers">
            {[...doc.items].reverse().slice(0, 300).map((it) => (
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
