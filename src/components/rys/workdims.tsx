"use client";
import { useEffect, useRef, useState } from "react";
import { arcSweep, fmt, frameAngle, frameOf, framePt, q, stretchItem, type Item, type P2 } from "@/lib/rys/model";

/*
  Wymiary robocze (paczka RB5a): pomoc przy rysowaniu, jak w szkicowniku CAD — widać je tylko w edytorze,
  nie trafiają do pliku ani na stronę. Liczba w mm (wg skali rysunku); kliknięcie liczby pozwala wpisać nową wartość,
  a kształt się dopasowuje (`apply` zwraca zmienione elementy).
*/

export interface WDim { key: string; a: P2; b: P2; n: P2; off: number; val: number; pre?: string; apply?: (mm: number) => Item[] | null }

const unitN = (a: P2, b: P2): [P2, P2] => {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, u: P2 = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
  return [u, [u[1], -u[0]]]; // normalna „w lewo” (na ekranie nad poziomą linią)
};

/** Wymiary robocze zaznaczenia: linia, prostokąt, okrąg, łuk, polilinia (odcinki) albo ramka grupy. */
export function workDims(items: Item[], k: number, u: number): WDim[] {
  const kk = k || 1, off = 12 * u, out: WDim[] = [];
  if (items.length === 1) {
    const it = items[0];
    if (it.t === "line") {
      const a: P2 = [it.x1, it.y1], b: P2 = [it.x2, it.y2], [d, n] = unitN(a, b), L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      out.push({ key: "len", a, b, n, off, val: L / kk, apply: (mm) => (mm > 0 ? [{ ...it, x2: q(a[0] + d[0] * mm * kk), y2: q(a[1] + d[1] * mm * kk) }] : null) });
      return out;
    }
    if (it.t === "rect") {
      out.push({ key: "w", a: [it.x, it.y], b: [it.x + it.w, it.y], n: [0, -1], off, val: it.w / kk, apply: (mm) => (mm > 0 ? [{ ...it, w: q(mm * kk) }] : null) });
      out.push({ key: "h", a: [it.x + it.w, it.y], b: [it.x + it.w, it.y + it.h], n: [1, 0], off, val: it.h / kk, apply: (mm) => (mm > 0 ? [{ ...it, h: q(mm * kk) }] : null) });
      return out;
    }
    if (it.t === "circle") {
      out.push({ key: "d", a: [it.cx - it.r, it.cy], b: [it.cx + it.r, it.cy], n: [0, -1], off: 0, val: (2 * it.r) / kk, pre: "⌀", apply: (mm) => (mm > 0 ? [{ ...it, r: q((mm * kk) / 2) }] : null) });
      return out;
    }
    if (it.t === "arc") {
      const am = ((it.a0 + arcSweep(it.a0, it.a1) / 2) * Math.PI) / 180, b: P2 = [it.cx + it.r * Math.cos(am), it.cy + it.r * Math.sin(am)];
      out.push({ key: "r", a: [it.cx, it.cy], b, n: [0, 0], off: 0, val: it.r / kk, pre: "R", apply: (mm) => (mm > 0 ? [{ ...it, r: q(mm * kk) }] : null) });
      return out;
    }
    if (it.t === "poly") {
      // odcinki proste; w otwartej polilinii zmiana długości przesuwa dalszą część bez zmiany jej kształtu
      const n = it.pts.length, segs = it.closed ? n : n - 1;
      if (segs > 16) return out;
      for (let i = 0; i < segs; i++) {
        if (it.b?.[i]) continue;
        const a = it.pts[i], b = it.pts[(i + 1) % n], [d, nn] = unitN(a, b), L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (L < 4 * u) continue;
        out.push({
          key: `s${i}`, a, b, n: nn, off: off * 0.8, val: L / kk,
          apply: it.closed ? undefined : (mm) => {
            if (!(mm > 0)) return null;
            const dx = d[0] * mm * kk - (b[0] - a[0]), dy = d[1] * mm * kk - (b[1] - a[1]);
            return [{ ...it, pts: it.pts.map((p, j): P2 => (j > i ? [q(p[0] + dx), q(p[1] + dy)] : p)) }];
          },
        });
      }
      return out;
    }
    return out;
  }
  // grupa: szerokość i wysokość ramki (obróconej razem z figurami); zmiana rozciąga całość od lewego górnego narożnika ramki
  const a = frameAngle(items), f = frameOf(items, a);
  if (!f || f.hw < 1e-6 || f.hh < 1e-6) return out;
  const c00 = framePt(f, -1, -1), c10 = framePt(f, 1, -1), c11 = framePt(f, 1, 1);
  const stretch = (kx: number, ky: number) => items.map((it) => stretchItem(it, c00, a, kx, ky));
  out.push({ key: "gw", a: c00, b: c10, n: unitN(c00, c10)[1], off, val: (2 * f.hw) / kk, apply: (mm) => (mm > 0 ? stretch((mm * kk) / (2 * f.hw), 1) : null) });
  out.push({ key: "gh", a: c10, b: c11, n: [-unitN(c10, c11)[1][0], -unitN(c10, c11)[1][1]], off, val: (2 * f.hh) / kk, apply: (mm) => (mm > 0 ? stretch(1, (mm * kk) / (2 * f.hh)) : null) });
  return out;
}

/** Rysunek wymiarów roboczych; kliknięcie liczby wywołuje `onEdit`. */
export function WorkDims({ dims, u, onEdit }: { dims: WDim[]; u: number; onEdit?: (d: WDim, at: [number, number]) => void }) {
  return (
    <g className="rys-wdim">
      {dims.map((d) => {
        const A: P2 = [d.a[0] + d.n[0] * d.off, d.a[1] + d.n[1] * d.off], B: P2 = [d.b[0] + d.n[0] * d.off, d.b[1] + d.n[1] * d.off];
        const m: P2 = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], txt = `${d.pre ?? ""}${fmt(Math.round(d.val * 100) / 100)}`;
        const w = (txt.length * 6.4 + 8) * u, h = 13 * u, edit = !!(d.apply && onEdit);
        return (
          <g key={d.key}>
            {d.off !== 0 && <path d={`M ${d.a[0]} ${d.a[1]} L ${A[0] + d.n[0] * 3 * u} ${A[1] + d.n[1] * 3 * u} M ${d.b[0]} ${d.b[1]} L ${B[0] + d.n[0] * 3 * u} ${B[1] + d.n[1] * 3 * u}`} className="rys-wdim-ext" />}
            <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} className="rys-wdim-l" />
            <circle cx={A[0]} cy={A[1]} r={1.6 * u} className="rys-wdim-dot" /><circle cx={B[0]} cy={B[1]} r={1.6 * u} className="rys-wdim-dot" />
            <g className={edit ? "rys-wdim-t is-edit" : "rys-wdim-t"} pointerEvents={edit ? "all" : "none"}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); if (edit) onEdit!(d, [e.clientX, e.clientY]); }}>
              {edit && <title>Kliknij i wpisz wartość w mm</title>}
              <rect x={m[0] - w / 2} y={m[1] - h / 2} width={w} height={h} rx={3 * u} />
              <text x={m[0]} y={m[1]} style={{ fontSize: 10.5 * u }} dominantBaseline="central" textAnchor="middle">{txt}</text>
            </g>
          </g>
        );
      })}
    </g>
  );
}

/** Pole wartości wymiaru roboczego przy kursorze (Enter — zastosuj, Esc — anuluj). */
export function WDimInput({ at, value, onApply, onClose }: { at: [number, number]; value: string; onApply: (v: string) => void; onClose: () => void }) {
  const [v, setV] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); ref.current?.select(); }, []);
  return (
    <div className="rys-dyn" style={{ left: at[0] + 12, top: at[1] + 12 }} role="group" aria-label="Wymiar roboczy">
      <label>Wymiar<input ref={ref} inputMode="decimal" value={v} onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") { e.preventDefault(); onApply(v); } else if (e.key === "Escape") { e.preventDefault(); onClose(); } }}
        onBlur={onClose} /><span>mm</span></label>
      <small>Enter — zmień kształt, Esc — anuluj</small>
    </div>
  );
}
