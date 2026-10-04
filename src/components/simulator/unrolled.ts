import { pointAt, type Program, type Segment, type Vec3 } from "@/lib/parser";
import { angleAt, carveCyl, contactAngle, cylIndex, cylInit, cylMeta, fixtureOf, type CylMeta } from "./cylinder";
import { cuttingRadius, toolOf, type Setup } from "./setup";

/*
  Widok 2D walca na 4. osi: płaszcz rozwinięty na płaszczyznę.
  Oś pozioma — X detalu [mm], pionowa — kąt detalu 0–360° przeskalowany na długość łuku (R·θ),
  więc proporcje są prawdziwe. Kolor pokazuje głębokość rzeczywiście zebranego materiału
  (ta sama mapa promienia co w 3D), linie — tor narzędzia w miejscu styku z płaszczem.
*/
export interface UnrollCache { segs: Segment[]; stockKey: string; h: Float32Array; meta: CylMeta; progress: number }

interface Opts {
  program: Program; segments: Segment[]; lengths: number[]; progress: number; setup: Setup;
  cache: { current: UnrollCache | null }; currentPos: Vec3; compact: boolean;
  probe: { px: number; py: number } | null;
}

const COL = { rapid: "#F59E0B", linear: "#22C55E", arc: "#38BDF8", grid: "rgba(255,255,255,0.07)", axis: "rgba(255,255,255,0.35)", text: "rgba(226,232,240,0.75)" };

export function drawUnrolled(ctx: CanvasRenderingContext2D, W: number, H: number, o: Opts) {
  const { program, segments, lengths, progress, setup } = o;
  const f = fixtureOf(setup), R = f.R, circ = 2 * Math.PI * R;

  // mapa promienia — liczona przyrostowo, jak w 3D
  const stockKey = JSON.stringify([setup.stock, Object.entries(setup.tools).map(([n, t]) => [n, t.kind, t.d, t.corner, t.angle])]);
  let c = o.cache.current;
  if (!c || c.segs !== segments || c.stockKey !== stockKey || progress < c.progress) {
    const meta = cylMeta(setup, 300);
    c = { segs: segments, stockKey, h: cylInit(meta), meta, progress: 0 };
  }
  if (progress > c.progress) { carveCyl(c.h, c.meta, { ...program, segments }, lengths, setup, c.progress, progress); c.progress = progress; }
  o.cache.current = c;
  const m = c.meta;

  // skala: te same mm na piksel w obu osiach
  const padL = o.compact ? 8 : 40, padR = 12, padT = o.compact ? 8 : 26, padB = o.compact ? 8 : 22;
  const xa = Math.min(f.x0 - 6, f.x0), xb = f.x1 + (f.tail ? 10 : 6);
  const scale = Math.min((W - padL - padR) / (xb - xa), (H - padT - padB) / circ);
  const ox = padL + ((W - padL - padR) - (xb - xa) * scale) / 2 - xa * scale;
  const oy = padT + ((H - padT - padB) + circ * scale) / 2; // θ=0 na dole
  const P = (x: number, th: number) => [ox + x * scale, oy - (th * Math.PI / 180) * R * scale] as const;
  const inv = (px: number, py: number): [number, number] => [(px - ox) / scale, ((oy - py) / (R * scale)) * 180 / Math.PI];

  ctx.clearRect(0, 0, W, H);

  // mapa głębokości
  let maxD = 0.3;
  for (let k = 0; k < c.h.length; k++) maxD = Math.max(maxD, R - c.h[k]);
  const off = document.createElement("canvas");
  off.width = m.nx + 1; off.height = m.nt;
  const ictx = off.getContext("2d");
  if (ictx) {
    const img = ictx.createImageData(off.width, off.height);
    for (let i = 0; i < m.nt; i++) for (let j = 0; j <= m.nx; j++) {
      const d = R - c.h[cylIndex(m, j, i)], p = ((m.nt - 1 - i) * off.width + j) * 4;
      if (d < 0.02) { img.data[p] = 71; img.data[p + 1] = 82; img.data[p + 2] = 99; img.data[p + 3] = 255; continue; }
      const t = Math.min(1, d / maxD);
      img.data[p] = 120 + 129 * t; img.data[p + 1] = 70 + 45 * (1 - t); img.data[p + 2] = 22; img.data[p + 3] = 255;
    }
    ictx.putImageData(img, 0, 0);
    const [ax0, ay0] = P(m.x0, 360), [ax1, ay1] = P(m.x1, 0);
    ctx.save(); ctx.imageSmoothingEnabled = true; ctx.drawImage(off, ax0, ay0, ax1 - ax0, ay1 - ay0); ctx.restore();
    ctx.strokeStyle = COL.axis; ctx.lineWidth = 1; ctx.strokeRect(ax0, ay0, ax1 - ax0, ay1 - ay0);
  }

  // siatka: X co „ładny” krok, kąt co 45°
  ctx.save(); ctx.font = "10px ui-monospace, monospace"; ctx.fillStyle = COL.text; ctx.strokeStyle = COL.grid; ctx.lineWidth = 1;
  const span = f.x1 - f.x0, raw = span / 8, p10 = 10 ** Math.floor(Math.log10(raw)), stepX = [1, 2, 5, 10].map((k) => k * p10).find((v) => v >= raw) ?? 10 * p10;
  for (let x = Math.ceil(f.x0 / stepX) * stepX; x <= f.x1 + 1e-6; x += stepX) {
    const [px, top] = P(x, 360), [, bot] = P(x, 0);
    ctx.beginPath(); ctx.moveTo(px, top); ctx.lineTo(px, bot); ctx.stroke();
    if (!o.compact) ctx.fillText(String(Math.round(x * 100) / 100), px + 2, bot + 13);
  }
  for (let th = 0; th <= 360; th += 45) {
    const [l, py] = P(f.x0, th), [r] = P(f.x1, th);
    ctx.beginPath(); ctx.moveTo(l, py); ctx.lineTo(r, py); ctx.stroke();
    if (!o.compact) ctx.fillText(`${th}°`, 4, py + 3);
  }
  ctx.restore();

  // szczęki uchwytu i kieł konika
  ctx.save();
  if (f.grip > 0) {
    const [gx0, gy0] = P(f.x0, 360), [gx1, gy1] = P(f.x0 + f.grip, 0);
    ctx.fillStyle = "rgba(239,68,68,0.16)"; ctx.fillRect(gx0, gy0, gx1 - gx0, gy1 - gy0);
    ctx.strokeStyle = "rgba(239,68,68,0.55)"; ctx.setLineDash([4, 3]); ctx.strokeRect(gx0, gy0, gx1 - gx0, gy1 - gy0);
    if (!o.compact) { ctx.setLineDash([]); ctx.fillStyle = "rgba(252,165,165,0.9)"; ctx.font = "10px ui-monospace, monospace"; ctx.fillText("szczęki", gx0 + 2, gy0 - 4); }
  }
  if (f.tail && !o.compact) { const [tx, ty] = P(f.x1, 360); ctx.fillStyle = "rgba(252,165,165,0.9)"; ctx.font = "10px ui-monospace, monospace"; ctx.fillText("konik →", tx - 46, ty - 4); }
  ctx.restore();

  // tor narzędzia w miejscu styku z płaszczem
  let acc = 0;
  segments.forEach((sg, idx) => {
    const len = lengths[idx];
    const done = Math.min(1, Math.max(0, (progress - acc) / (len || 1)));
    acc += len;
    if (sg.kind === "dwell") return;
    const a0 = sg.a?.from ?? program.lines[sg.line]?.state.rotary?.a ?? 0, a1 = sg.a?.to ?? a0;
    const n = Math.max(2, Math.min(240, Math.ceil(len / 0.5)));
    const draw = (t0: number, t1: number, alpha: number, width: number) => {
      if (t1 <= t0) return;
      ctx.save(); ctx.globalAlpha = alpha; ctx.lineWidth = width; ctx.strokeStyle = COL[sg.kind]; if (sg.kind === "rapid") ctx.setLineDash([5, 4]);
      ctx.beginPath();
      let prevTh: number | null = null;
      const k0 = Math.floor(t0 * n), k1 = Math.ceil(t1 * n);
      for (let k = k0; k <= k1; k++) {
        const t = Math.min(t1, Math.max(t0, k / n));
        const p = pointAt(sg, t), th = contactAngle(p.y, a0 + (a1 - a0) * t, R);
        const [px, py] = P(p.x, th);
        if (prevTh === null || Math.abs(th - prevTh) > 180) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        prevTh = th;
      }
      ctx.stroke(); ctx.restore();
    };
    // ruchy nad materiałem (wysoko) są mało czytelne w rozwinięciu — szybkie tylko blado
    draw(0, done, sg.kind === "rapid" ? 0.35 : 1, sg.kind === "rapid" ? 1 : 2);
    draw(done, 1, sg.kind === "rapid" ? 0.12 : 0.28, 1);
  });

  // narzędzie
  const aNow = angleAt({ ...program, segments }, lengths, progress);
  const toolNo = (() => { let a2 = 0, no: number | null = null; segments.forEach((sg, i) => { if (progress >= a2) no = program.lines[sg.line]?.state.tool ?? no; a2 += lengths[i]; }); return no; })();
  const rt = cuttingRadius(toolOf(setup, toolNo, "mill"));
  const [tx, ty] = P(o.currentPos.x, contactAngle(o.currentPos.y, aNow, R));
  ctx.save(); ctx.strokeStyle = "#FFFFFF"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(tx, ty, Math.max(3, rt * scale), 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tx - 8, ty); ctx.lineTo(tx + 8, ty); ctx.moveTo(tx, ty - 8); ctx.lineTo(tx, ty + 8); ctx.stroke();
  ctx.restore();

  if (!o.compact) {
    ctx.save(); ctx.font = "11px ui-monospace, monospace"; ctx.fillStyle = COL.text;
    ctx.fillText(`Rozwinięcie walca ⌀${Math.round(R * 2 * 100) / 100} · A ${Math.round(aNow * 10) / 10}° · głębokość do ${maxD.toFixed(2)} mm`, padL, 14);
    ctx.restore();
  }

  // sonda pod palcem
  if (o.probe && !o.compact) {
    const [hx, th] = inv(o.probe.px, o.probe.py);
    const j = Math.round((hx - m.x0) / m.cx), i = Math.round((((th % 360) + 360) % 360) * Math.PI / 180 / m.ct);
    const depth = j >= 0 && j <= m.nx && th >= 0 && th <= 360 ? R - c.h[cylIndex(m, j, i)] : null;
    ctx.save(); ctx.strokeStyle = "rgba(90,169,240,0.9)"; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(o.probe.px, 0); ctx.lineTo(o.probe.px, H); ctx.moveTo(0, o.probe.py); ctx.lineTo(W, o.probe.py); ctx.stroke();
    const label = `X ${hx.toFixed(2)} · ${th.toFixed(1)}°${depth !== null ? ` · głęb. ${depth.toFixed(2)}` : ""}`;
    ctx.setLineDash([]); ctx.font = "11px ui-monospace, monospace";
    const w = ctx.measureText(label).width + 12, bx = Math.min(W - w - 4, o.probe.px + 10), by = Math.max(16, o.probe.py - 10);
    ctx.fillStyle = "rgba(5,7,10,0.85)"; ctx.fillRect(bx, by - 13, w, 18); ctx.fillStyle = "#5AA9F0"; ctx.fillText(label, bx + 6, by);
    ctx.restore();
  }
  return { inv };
}
