"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { FigDefs, figCtx } from "@/components/fig";
import {
  ARROWS, ARROW_LABEL, FILLS, FILL_LABEL, FONTS, FONT_LABEL, FONT_SIZES, KIND_LABEL, LINE_KINDS, strokeOf, TEXT_COLORS, TEXT_COLOR_LABEL,
  WIDTHS, WIDTH_LABEL, type Item,
} from "@/lib/rys/model";
import { renderItem } from "./render";

/*
  Standard rysunków serwisu (paczka RB5a): jedna karta z próbkami wszystkiego, co daje rysownik —
  rodzaje linii (z grubością wg rodzaju), grubości, groty, wypełnienia, teksty, wymiary i znaczniki.
  Próbki rysuje ten sam kod co stronę, więc wyglądają dokładnie jak na rysunku.
*/

const ID = "rysstd", c = figCtx(ID);
const base = { k: "con" as const, sw: "auto" as const };

function Sample({ w = 120, h = 24, items }: { w?: number; h?: number; items: Item[] }) {
  return (
    <span className="fig rys-std-s">
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden>{items.map((it) => <g key={it.id}>{renderItem(it, c, 1)}</g>)}</svg>
    </span>
  );
}
function Row({ sample, name, note }: { sample: ReactNode; name: string; note?: string }) {
  return <li>{sample}<span><b>{name}</b>{note && <small>{note}</small>}</span></li>;
}

export function StandardDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  const line = (k: (typeof LINE_KINDS)[number], sw: (typeof WIDTHS)[number] = "auto", arrow: (typeof ARROWS)[number] = "none"): Item =>
    ({ id: `${k}${sw}${arrow}`, t: "line", k, sw, arrow, x1: 6, y1: 12, x2: 114, y2: 12 });
  return (
    <dialog ref={ref} className="rys-dialog rys-std" onClose={onClose} aria-labelledby="rys-std-h">
      <span className="fig" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}><svg width="0" height="0" aria-hidden><FigDefs id={ID} /></svg></span>
      <h2 id="rys-std-h">Standard rysunków serwisu</h2>
      <p className="rys-tip">Wszystko, co daje rysownik, w jednym miejscu. Kolory ruchu są te same co w symulatorze i edytorze kodu: G00 bursztynowy, G01 zielony, G02/G03 niebieski.</p>
      <div className="rys-std-grid">
        <section>
          <h3>Rodzaje linii</h3>
          <ul>{LINE_KINDS.filter((k) => k !== "none").map((k) => <Row key={k} sample={<Sample items={[line(k)]} />} name={KIND_LABEL[k]} note={`grubość wg rodzaju: ${strokeOf(k, "auto")}`} />)}</ul>
        </section>
        <section>
          <h3>Grubości</h3>
          <ul>{WIDTHS.filter((w) => w !== "auto").map((w) => <Row key={w} sample={<Sample items={[line("con", w)]} />} name={WIDTH_LABEL[w]} />)}</ul>
          <h3>Groty</h3>
          <ul>{ARROWS.filter((a) => a !== "none").map((a) => <Row key={a} sample={<Sample items={[line("cut", "auto", a)]} />} name={ARROW_LABEL[a]} />)}</ul>
          <h3>Wypełnienia</h3>
          <ul>{FILLS.filter((f) => f !== "none").map((f) => <Row key={f} sample={<Sample h={28} items={[{ id: f, t: "rect", ...base, fill: f, x: 6, y: 4, w: 108, h: 20, r: 0 }]} />} name={FILL_LABEL[f]} />)}</ul>
        </section>
        <section>
          <h3>Teksty</h3>
          <ul>
            {FONTS.map((f) => <Row key={f} sample={<Sample items={[{ id: f, t: "text", x: 6, y: 17, s: f === "mono" ? "G01 X40 F200" : "Gniazdo ⌀36", anchor: "start", size: 12.5, font: f, bold: f === "display", color: "ink" }]} />} name={FONT_LABEL[f]} />)}
            {TEXT_COLORS.map((col) => <Row key={col} sample={<Sample items={[{ id: col, t: "text", x: 6, y: 17, s: "Opis", anchor: "start", size: 12.5, font: "sans", bold: false, color: col }]} />} name={TEXT_COLOR_LABEL[col]} />)}
          </ul>
          <p className="rys-tip">Rozmiary tekstu: {FONT_SIZES.join(" · ")}.</p>
          <h3>Wymiary i znaczniki</h3>
          <ul>
            <Row sample={<Sample h={34} items={[{ id: "d1", t: "dim", o: "h", x1: 10, y1: 30, x2: 110, y2: 30, off: -12, label: "<>", side: -1, size: 10.5, font: "mono", hz: false }]} />} name="Wymiar liniowy" note="opis = zmierzona długość / skala" />
            <Row sample={<Sample h={40} items={[{ id: "c", t: "circle", ...base, fill: "none", cx: 40, cy: 20, r: 14 }, { id: "d2", t: "dimr", d: true, cx: 40, cy: 20, r: 14, a: -30, ext: 16, label: "⌀<>", size: 10.5, font: "mono" }]} />} name="Średnica / promień" />
            <Row sample={<Sample items={[{ id: "p", t: "pt", x: 20, y: 12, label: "P1", pos: "e", color: "cut" }, { id: "s", t: "step", x: 80, y: 12, n: 1 }]} />} name="Punkt i numer kroku" />
          </ul>
        </section>
      </div>
      <form method="dialog" className="rys-dialog-actions"><button className="btn ghost">Zamknij</button></form>
    </dialog>
  );
}
