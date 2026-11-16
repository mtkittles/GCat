import {
  FONT_SIZES, H_MAX, H_MIN, MEASURE, newId, parseItem, q, RYS_W, translate, type Arrow, type Fill, type Font, type Item, type LineKind, type P2, type PtColor, type TextItem, type Width,
} from "@/lib/rys/model";

/*
  Import rysunku ze strony serwisu do rysownika (paczka RA).
  Wejście: <svg> rysunku (Fig) wstawiony do dokumentu — potrzebny układ strony, żeby odczytać transformacje (getScreenCTM)
  i obliczone style. Wyjście: elementy rysownika w układzie 360 × h.
  • rysunki z rysownika (data-ri) wracają dokładnie,
  • wymiar, punkt i krok z fig.tsx (data-dim, data-pt, data-step) → wymiar, punkt i krok,
  • linie, prostokąty, okręgi, wielokąty, ścieżki (z łukami) i teksty → odpowiednie elementy; rodzaj linii z klasy CSS.
  Krzywe Béziera zamieniają się w polilinie, a obrócony tekst traci obrót — liczba takich przybliżeń wraca w `approx`.
*/

type Spec = { k: LineKind; sw?: Width; fill?: Fill };
const CLASS_SPEC: [string, Spec][] = [
  ["p-fill-acc", { k: "none", fill: "acc" }], ["p-fill-cut", { k: "cut", sw: "xs", fill: "cut" }], ["p-fill-bad", { k: "bad", sw: "s", fill: "bad" }],
  ["cut-zone", { k: "none", fill: "cut" }], ["hole-top", { k: "con", fill: "hole" }], ["tool", { k: "tool", fill: "cut" }],
  ["p-con", { k: "con" }], ["p-cons", { k: "cons" }], ["p-dim", { k: "dim" }], ["p-ext", { k: "dim", sw: "xs" }], ["axis-c", { k: "axis" }],
  ["p-cut", { k: "cut" }], ["p-rap", { k: "rap" }], ["p-arc", { k: "arc" }], ["p-alt", { k: "arc" }], ["p-acc", { k: "acc" }], ["p-bad", { k: "bad" }],
  ["stock-out", { k: "stock" }], ["gr-min", { k: "faint", sw: "xs" }], ["gr-maj", { k: "faint" }],
];
const SKIP_TAGS = new Set(["defs", "pattern", "marker", "title", "desc", "clippath", "mask", "style", "script", "foreignobject", "lineargradient", "radialgradient", "symbol"]);
const TEXT_COLOR: [string, TextItem["color"]][] = [["t-acc", "acc"], ["t-cut", "cut"], ["t-rap", "rap"], ["t-arc", "arc"], ["t-bad", "bad"], ["t-mut", "mut"]];
const PT_COLOR: [string, PtColor][] = [["pt-cut", "cut"], ["pt-rap", "rap"], ["pt-arc", "arc"]];

export interface ImportResult { items: Item[]; h: number; k: number; approx: number }

export function svgToDoc(svg: SVGSVGElement): ImportResult {
  const vb = svg.viewBox.baseVal;
  const vbW = vb && vb.width ? vb.width : svg.width.baseVal.value || RYS_W, vbH = vb && vb.height ? vb.height : svg.height.baseVal.value || 240;
  const ox = vb ? vb.x : 0, oy = vb ? vb.y : 0;
  let f = RYS_W / vbW;
  if (vbH * f > H_MAX) f = H_MAX / vbH; // za wysoki: zmniejsz całość
  const rootInv = svg.getScreenCTM()?.inverse();
  const items: Item[] = [];
  let approx = 0, k = 1;

  const M = (el: Element): DOMMatrix => {
    const m = (el as SVGGraphicsElement).getScreenCTM?.();
    return rootInv && m ? rootInv.multiply(m) : new DOMMatrix();
  };
  const P = (m: DOMMatrix, x: number, y: number): P2 => { const p = new DOMPoint(x, y).matrixTransform(m); return [q((p.x - ox) * f), q((p.y - oy) * f)]; };
  const scaleOf = (m: DOMMatrix) => Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) * f;
  const rotated = (m: DOMMatrix) => Math.abs(m.b) > 1e-6 || Math.abs(m.c) > 1e-6;
  const uniform = (m: DOMMatrix) => Math.abs(Math.hypot(m.a, m.b) - Math.hypot(m.c, m.d)) < 1e-6;

  function specOf(el: Element): Spec | null {
    const cl = el.classList;
    for (const [c, s] of CLASS_SPEC) if (cl.contains(c)) return { ...s, sw: s.sw ?? (cl.contains("thick") ? "l" : undefined) };
    const cs = getComputedStyle(el);
    const fill = el.getAttribute("fill") ?? cs.fill, stroke = cs.stroke;
    const hasStroke = stroke && stroke !== "none" && !/rgba?\([^)]*,\s*0\)/.test(stroke) && parseFloat(cs.strokeWidth) > 0;
    const hatch = /url\(/.test(fill ?? "") || /url\(/.test((el as SVGElement).style?.fill ?? "");
    const hasFill = hatch || (fill && fill !== "none" && !/rgba?\([^)]*,\s*0\)/.test(fill) && fill !== "transparent");
    if (!hasStroke && !hasFill) return null;
    approx++; // klasa spoza rysunków serwisu: rodzaj linii zgadnięty
    return { k: hasStroke ? "con" : "none", fill: hatch ? "hatch" : hasFill ? "hole" : "none" };
  }
  const fillOf = (el: Element, s: Spec): Fill => {
    if (s.fill) return s.fill;
    const f1 = el.getAttribute("fill") ?? "", f2 = (el as SVGElement).style?.fill ?? "";
    return /url\(/.test(f1) || /url\(/.test(f2) ? "hatch" : "none";
  };
  const arrowOf = (el: Element): Arrow => {
    const s = !!el.getAttribute("marker-start"), e = !!el.getAttribute("marker-end");
    return s && e ? "both" : s ? "start" : e ? "end" : "none";
  };
  const stroke = (s: Spec) => ({ k: s.k, sw: s.sw ?? ("auto" as Width) });

  function text(el: SVGTextElement) {
    const s = (el.textContent ?? "").replace(/\s+/g, " ").trim();
    if (!s) return;
    const m = M(el), cs = getComputedStyle(el);
    if (rotated(m)) approx++;
    const x = el.x.baseVal.length ? el.x.baseVal.getItem(0).value : 0, y = el.y.baseVal.length ? el.y.baseVal.getItem(0).value : 0;
    const [px, py] = P(m, x, y);
    const fs = (parseFloat(cs.fontSize) || 11) * scaleOf(m);
    const size = FONT_SIZES.reduce((a, b) => (Math.abs(b - fs) < Math.abs(a - fs) ? b : a), 11 as number);
    const fam = cs.fontFamily.toLowerCase();
    const font: Font = el.classList.contains("t-mono") || /mono/.test(fam) ? "mono" : /sora|display/.test(fam) ? "display" : "sans";
    const anchor = (el.getAttribute("text-anchor") ?? cs.textAnchor) as TextItem["anchor"];
    const color = TEXT_COLOR.find(([c]) => el.classList.contains(c))?.[1] ?? "ink";
    items.push({ id: newId(), t: "text", x: px, y: py, s: s.slice(0, 80), anchor: anchor === "middle" || anchor === "end" ? anchor : "start", size, font, bold: (parseInt(cs.fontWeight) || 400) >= 600, color });
  }

  /** ścieżka SVG → polilinie i łuki (łuk zostaje łukiem, krzywe Béziera → polilinia) */
  function path(el: SVGPathElement, s: Spec) {
    const m = M(el), fill = fillOf(el, s), arrow = arrowOf(el);
    const tokens = (el.getAttribute("d") ?? "").match(/[MmLlHhVvCcSsQqTtAaZz]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) ?? [];
    type Seg = { t: "L"; p: P2 } | { t: "A"; r: number; rot: number; large: number; sweep: number; p: P2 };
    const subs: { start: P2; segs: Seg[]; closed: boolean }[] = [];
    let i = 0, cmd = "", cur: P2 = [0, 0], start: P2 = [0, 0], ctrl: P2 | null = null, sub: (typeof subs)[number] | null = null;
    const n = () => +tokens[i++];
    const flat = (pts: P2[]) => { for (const p of pts) sub!.segs.push({ t: "L", p }); approx++; };
    while (i < tokens.length) {
      if (/[a-z]/i.test(tokens[i])) cmd = tokens[i++];
      const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
      const pt = (): P2 => { const x = n(), y = n(); return rel ? [cur[0] + x, cur[1] + y] : [x, y]; };
      if (C === "M") { cur = pt(); start = cur; sub = { start: cur, segs: [], closed: false }; subs.push(sub); cmd = rel ? "l" : "L"; ctrl = null; continue; }
      if (!sub) { sub = { start: cur, segs: [], closed: false }; subs.push(sub); }
      if (C === "Z") { sub.closed = true; cur = start; ctrl = null; continue; }
      if (C === "L") { cur = pt(); sub.segs.push({ t: "L", p: cur }); }
      else if (C === "H") { const x = n(); cur = [rel ? cur[0] + x : x, cur[1]]; sub.segs.push({ t: "L", p: cur }); }
      else if (C === "V") { const y = n(); cur = [cur[0], rel ? cur[1] + y : y]; sub.segs.push({ t: "L", p: cur }); }
      else if (C === "A") {
        const rx = n(), ry = n(), rot = n(), large = n(), sweep = n(), p = pt();
        if (Math.abs(rx - ry) < 1e-6 && rx > 0) sub.segs.push({ t: "A", r: rx, rot, large, sweep, p });
        else { sub.segs.push({ t: "L", p }); approx++; }
        cur = p;
      } else if (C === "C" || C === "S" || C === "Q" || C === "T") {
        const p0 = cur;
        let c1: P2, c2: P2, p: P2;
        if (C === "C") { c1 = pt(); c2 = pt(); p = pt(); }
        else if (C === "S") { c1 = ctrl ? [2 * cur[0] - ctrl[0], 2 * cur[1] - ctrl[1]] : cur; c2 = pt(); p = pt(); }
        else if (C === "Q") { const c = pt(); p = pt(); c1 = [p0[0] + (2 / 3) * (c[0] - p0[0]), p0[1] + (2 / 3) * (c[1] - p0[1])]; c2 = [p[0] + (2 / 3) * (c[0] - p[0]), p[1] + (2 / 3) * (c[1] - p[1])]; ctrl = c; }
        else { const c: P2 = ctrl ? [2 * cur[0] - ctrl[0], 2 * cur[1] - ctrl[1]] : cur; p = pt(); c1 = [p0[0] + (2 / 3) * (c[0] - p0[0]), p0[1] + (2 / 3) * (c[1] - p0[1])]; c2 = [p[0] + (2 / 3) * (c[0] - p[0]), p[1] + (2 / 3) * (c[1] - p[1])]; ctrl = c; }
        const pts: P2[] = [];
        for (let k2 = 1; k2 <= 10; k2++) { const t = k2 / 10, u = 1 - t; pts.push([u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p[0], u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p[1]]); }
        flat(pts);
        if (C === "C" || C === "S") ctrl = c2;
        cur = p;
        continue;
      } else { i++; continue; }
      ctrl = null;
    }
    const out: Item[] = [];
    const ok = uniform(m);
    for (const sp of subs) {
      // wypełniony kształt z łukami albo transformacja nierównomierna: łuki spłaszczone, kształt zostaje zamknięty
      const flatten = (fill !== "none" && sp.segs.some((g) => g.t === "A")) || !ok;
      let pts: P2[] = [P(m, ...sp.start)], prev = sp.start;
      const flush = (closed: boolean) => { if (pts.length >= 2) out.push({ id: newId(), t: "poly", ...stroke(s), arrow: "none", fill: closed ? fill : "none", closed, pts }); };
      for (const g of sp.segs) {
        if (g.t === "L") { pts.push(P(m, ...g.p)); prev = g.p; continue; }
        const c = arcCenter(prev, g.p, g.r, g.large, g.sweep);
        if (!c) { pts.push(P(m, ...g.p)); prev = g.p; continue; }
        if (flatten) {
          const a0 = Math.atan2(prev[1] - c.cy, prev[0] - c.cx), a1 = Math.atan2(g.p[1] - c.cy, g.p[0] - c.cx);
          let d = a1 - a0; if (g.sweep && d < 0) d += 2 * Math.PI; if (!g.sweep && d > 0) d -= 2 * Math.PI;
          const N = Math.max(4, Math.ceil(Math.abs(d) / 0.2));
          for (let j = 1; j <= N; j++) { const a = a0 + (d * j) / N; pts.push(P(m, c.cx + c.r * Math.cos(a), c.cy + c.r * Math.sin(a))); }
          approx++;
        } else {
          flush(false);
          const C2 = P(m, c.cx, c.cy), S2 = P(m, ...prev), E2 = P(m, ...g.p);
          const as = (Math.atan2(S2[1] - C2[1], S2[0] - C2[0]) * 180) / Math.PI, ae = (Math.atan2(E2[1] - C2[1], E2[0] - C2[0]) * 180) / Math.PI;
          const cw = (g.sweep === 1) !== (m.a * m.d - m.b * m.c < 0); // odbicie lustrzane odwraca kierunek
          out.push({ id: newId(), t: "arc", ...stroke(s), arrow: "none", cx: C2[0], cy: C2[1], r: q(c.r * scaleOf(m)), a0: Math.round((cw ? as : ae) * 1000) / 1000, a1: Math.round((cw ? ae : as) * 1000) / 1000 });
          pts = [E2];
        }
        prev = g.p;
      }
      if (sp.closed && !flatten && sp.segs.some((g) => g.t === "A")) { pts.push(P(m, ...sp.start)); flush(false); }
      else flush(sp.closed);
    }
    // groty: na pierwszym i ostatnim elemencie ścieżki
    if (arrow !== "none" && out.length) {
      const first = out[0], last = out[out.length - 1];
      if ((arrow === "start" || arrow === "both") && (first.t === "poly" || first.t === "arc")) first.arrow = first === last ? arrow : "start";
      if ((arrow === "end" || arrow === "both") && (last.t === "poly" || last.t === "arc")) last.arrow = first === last ? arrow : "end";
    }
    items.push(...out);
  }

  function shape(el: Element) {
    const tag = el.tagName.toLowerCase();
    if (tag === "text") return text(el as SVGTextElement);
    const s = specOf(el);
    if (!s) return;
    const m = M(el);
    if (tag === "line") {
      const l = el as SVGLineElement;
      const [x1, y1] = P(m, l.x1.baseVal.value, l.y1.baseVal.value), [x2, y2] = P(m, l.x2.baseVal.value, l.y2.baseVal.value);
      items.push({ id: newId(), t: "line", ...stroke(s), arrow: arrowOf(el), x1, y1, x2, y2 });
    } else if (tag === "rect") {
      const r = el as SVGRectElement, x = r.x.baseVal.value, y = r.y.baseVal.value, w = r.width.baseVal.value, h = r.height.baseVal.value;
      if (w <= 0 || h <= 0) return;
      const corners: P2[] = [P(m, x, y), P(m, x + w, y), P(m, x + w, y + h), P(m, x, y + h)];
      if (rotated(m)) { items.push({ id: newId(), t: "poly", ...stroke(s), arrow: "none", fill: fillOf(el, s), closed: true, pts: corners }); return; }
      const xs = corners.map((c) => c[0]), ys = corners.map((c) => c[1]);
      items.push({ id: newId(), t: "rect", ...stroke(s), fill: fillOf(el, s), x: Math.min(...xs), y: Math.min(...ys), w: q(Math.max(...xs) - Math.min(...xs)), h: q(Math.max(...ys) - Math.min(...ys)), r: q(Math.min(100, r.rx.baseVal.value * scaleOf(m))) });
    } else if (tag === "circle" || tag === "ellipse") {
      const c = el as SVGCircleElement & SVGEllipseElement;
      const rx = tag === "circle" ? c.r.baseVal.value : c.rx.baseVal.value, ry = tag === "circle" ? rx : c.ry.baseVal.value;
      const [cx, cy] = P(m, c.cx.baseVal.value, c.cy.baseVal.value);
      if (Math.abs(rx - ry) < 1e-6 && uniform(m)) items.push({ id: newId(), t: "circle", ...stroke(s), fill: fillOf(el, s), cx, cy, r: q(rx * scaleOf(m)) });
      else { approx++; const pts: P2[] = []; for (let j = 0; j < 36; j++) { const a = (j / 36) * 2 * Math.PI; pts.push(P(m, c.cx.baseVal.value + rx * Math.cos(a), c.cy.baseVal.value + ry * Math.sin(a))); } items.push({ id: newId(), t: "poly", ...stroke(s), arrow: "none", fill: fillOf(el, s), closed: true, pts }); }
    } else if (tag === "polyline" || tag === "polygon") {
      const pl = el as SVGPolylineElement, pts: P2[] = [];
      for (let j = 0; j < pl.points.numberOfItems; j++) { const p = pl.points.getItem(j); pts.push(P(m, p.x, p.y)); }
      if (pts.length >= 2) items.push({ id: newId(), t: "poly", ...stroke(s), arrow: tag === "polyline" ? arrowOf(el) : "none", fill: fillOf(el, s), closed: tag === "polygon", pts });
    } else if (tag === "path") path(el as SVGPathElement, s);
  }

  /**
    Siatka z osiami z fig.tsx (Grid: linie gr-min/gr-maj, dwie osie .ax, opisy t-ax i t-tick) → jeden element „Siatka”
    i jeden „Układ współrzędnych” w jednej grupie, zamiast setek osobnych linii i tekstów.
  */
  function figGrid(g: Element): boolean {
    const kids = Array.from(g.children);
    const lines = (cls: string[]) => kids.filter((c) => c.tagName.toLowerCase() === "line" && cls.some((x) => c.classList.contains(x))) as SVGLineElement[];
    const ax = lines(["ax"]), gr = lines(["gr-min", "gr-maj"]);
    if (ax.length !== 2) return false;
    const L = (l: SVGLineElement): [P2, P2] => { const m = M(l); return [P(m, l.x1.baseVal.value, l.y1.baseVal.value), P(m, l.x2.baseVal.value, l.y2.baseVal.value)]; };
    const hz = ax.map(L).find(([a, b]) => Math.abs(a[1] - b[1]) < 0.05), vt = ax.map(L).find(([a, b]) => Math.abs(a[0] - b[0]) < 0.05);
    if (!hz || !vt) return false;
    const grp = newId(), ox = vt[0][0], oy = hz[0][1];
    const uniq = (v: number[]) => [...new Set(v.map((x) => q(x)))].sort((a, b) => a - b);
    const step = (v: number[]) => { let m = Infinity; for (let i = 1; i < v.length; i++) if (v[i] - v[i - 1] > 0.05) m = Math.min(m, v[i] - v[i - 1]); return Number.isFinite(m) ? q(m) : 0; };
    if (gr.length >= 2) {
      const segs = gr.map((l) => ({ l, s: L(l) }));
      const vx = uniq(segs.filter(({ s: [a, b] }) => Math.abs(a[0] - b[0]) < 0.05).map(({ s }) => s[0][0]));
      const hy = uniq(segs.filter(({ s: [a, b] }) => Math.abs(a[1] - b[1]) < 0.05).map(({ s }) => s[0][1]));
      const majX = uniq(segs.filter(({ l, s: [a, b] }) => l.classList.contains("gr-maj") && Math.abs(a[0] - b[0]) < 0.05).map(({ s }) => s[0][0]));
      if (vx.length >= 2 && hy.length >= 2) {
        const minor = step([...vx]) || step(hy), major = step(majX) || minor * 2;
        items.push({ id: newId(), g: grp, t: "grid", x: vx[0], y: hy[0], w: q(vx[vx.length - 1] - vx[0]), h: q(hy[hy.length - 1] - hy[0]), minor: Math.min(50, Math.max(2.5, minor)), major: Math.min(100, Math.max(5, major)) });
      }
    }
    const texts = kids.filter((c) => c.tagName.toLowerCase() === "text") as SVGTextElement[];
    const at = (t: SVGTextElement): P2 => { const x = t.x.baseVal.length ? t.x.baseVal.getItem(0).value : 0, y = t.y.baseVal.length ? t.y.baseVal.getItem(0).value : 0; return P(M(t), x, y); };
    const labels = texts.filter((t) => t.classList.contains("t-ax")).map((t) => (t.textContent ?? "").trim());
    const ticks = texts.filter((t) => t.classList.contains("t-tick")).map((t) => ({ p: at(t), v: Number((t.textContent ?? "").trim().replace(",", ".").replace("−", "-")) })).filter((t) => Number.isFinite(t.v));
    const xt = ticks.filter((t) => Math.abs(t.p[1] - oy) < 20 && t.p[1] > oy).sort((a, b) => a.p[0] - b.p[0]);
    let ts = 0, tv = 10;
    if (xt.length >= 2) { ts = q(xt[1].p[0] - xt[0].p[0]); tv = q(xt[1].v - xt[0].v); }
    else if (xt.length === 1 && Math.abs(xt[0].p[0] - ox) > 1) { ts = q(Math.abs(xt[0].p[0] - ox)); tv = q(Math.abs(xt[0].v)); }
    const xs = [hz[0][0], hz[1][0]], ys = [vt[0][1], vt[1][1]];
    items.push({
      id: newId(), g: grp, t: "axes", x: ox, y: oy, xn: q(Math.max(0, ox - Math.min(...xs))), xp: q(Math.max(5, Math.max(...xs) - ox)), yn: q(Math.max(0, Math.max(...ys) - oy)), yp: q(Math.max(5, oy - Math.min(...ys))),
      xl: (labels[0] || "X").slice(0, 8), yl: (labels[1] || "Y").slice(0, 8), ts: Math.min(200, ts), tv,
    });
    return true;
  }

  function walk(node: Element) {
    for (const el of Array.from(node.children)) {
      const tag = el.tagName.toLowerCase();
      if (SKIP_TAGS.has(tag)) continue;
      const rk = el.getAttribute("data-rk");
      if (rk) k = +rk || 1;
      const ri = el.getAttribute("data-ri");
      if (ri) {
        try {
          const it = parseItem(JSON.parse(ri));
          if (it) { const [dx, dy] = P(M(el), 0, 0); items.push(dx || dy ? shift(it, dx, dy) : it); }
        } catch { /* uszkodzony zapis: pomiń */ }
        continue;
      }
      const dd = el.getAttribute("data-dim");
      if (dd) {
        const [x1, y1, x2, y2, off, side] = dd.split(",").map(Number), m = M(el);
        const a = P(m, x1, y1), b = P(m, x2, y2);
        const label = (el.querySelector("text")?.textContent ?? "").trim();
        items.push({ id: newId(), t: "dim", o: "a", x1: a[0], y1: a[1], x2: b[0], y2: b[1], off: q(off * scaleOf(m) * (m.a * m.d - m.b * m.c < 0 ? -1 : 1)), label: label || MEASURE, side: side === 1 ? 1 : -1, size: 10.5, font: "mono", hz: true });
        continue;
      }
      const dp = el.getAttribute("data-pt");
      if (dp !== null) {
        const c = el.querySelector("circle"), m = M(c ?? el);
        if (c) {
          const [x, y] = P(m, (c as SVGCircleElement).cx.baseVal.value, (c as SVGCircleElement).cy.baseVal.value);
          const color = PT_COLOR.find(([cl]) => c.classList.contains(cl))?.[1] ?? "ink";
          items.push({ id: newId(), t: "pt", x, y, label: (el.querySelector("text")?.textContent ?? "").trim().slice(0, 40), pos: (["n", "ne", "e", "se", "s", "sw", "w", "nw"].includes(dp) ? dp : "ne") as Extract<Item, { t: "pt" }>["pos"], color });
        }
        continue;
      }
      const ds = el.getAttribute("data-step");
      if (ds) {
        const c = el.querySelector("circle");
        if (c) { const [x, y] = P(M(c), (c as SVGCircleElement).cx.baseVal.value, (c as SVGCircleElement).cy.baseVal.value); items.push({ id: newId(), t: "step", x, y, n: Math.max(1, Math.min(99, +ds || 1)) }); }
        continue;
      }
      if (tag === "g" && figGrid(el)) continue;
      if (tag === "g" || tag === "a" || tag === "svg") { walk(el); continue; }
      if (tag === "use" || tag === "image") { approx++; continue; }
      shape(el);
    }
  }
  walk(svg);
  const h = Math.round(Math.min(H_MAX, Math.max(H_MIN, vbH * f)));
  return { items: items.slice(0, 1500), h, k, approx };
}

const shift = (it: Item, dx: number, dy: number): Item => translate(it, dx, dy);

/** Środek łuku SVG o promieniu r z punktu a do b (SVG 1.1, F.6.5, rx = ry, bez obrotu). */
export function arcCenter(a: P2, b: P2, r: number, large: number, sweep: number): { cx: number; cy: number; r: number } | null {
  const dx = (a[0] - b[0]) / 2, dy = (a[1] - b[1]) / 2, d2 = dx * dx + dy * dy;
  if (d2 < 1e-12) return null;
  if (r * r < d2) r = Math.sqrt(d2); // promień za mały — SVG go powiększa
  const k = Math.sqrt(Math.max(0, (r * r - d2) / d2)) * (large === sweep ? -1 : 1);
  const cxp = k * dy, cyp = -k * dx;
  return { cx: cxp + (a[0] + b[0]) / 2, cy: cyp + (a[1] + b[1]) / 2, r };
}

/** Usuwa z obcego SVG skrypty, obiekty HTML i atrybuty zdarzeń (import z tej samej strony, ale ostrożnie). */
export function sanitizeSvg(svg: Element) {
  svg.querySelectorAll("script, foreignObject, iframe, object, embed").forEach((n) => n.remove());
  for (const el of [svg, ...Array.from(svg.querySelectorAll("*"))]) for (const a of Array.from(el.attributes)) if (/^on/i.test(a.name) || /javascript:/i.test(a.value)) el.removeAttribute(a.name);
}
