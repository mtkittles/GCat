import { parseProgram, playLength, segmentLength } from "@/lib/parser";
import { latheProfile } from "@/components/simulator/latheStock";
import { defaultSetup } from "@/components/simulator/setup";
import { carve, millMeta } from "@/components/simulator/heightmap";
import { stockBoxes, type PieceBox } from "@/components/simulator/pieces";
import { palettePng } from "@/lib/png";
import { applyCompensation } from "@/components/simulator/compensation";
import { simTools, type LibProgram } from "@/lib/programLibrary";
import { isMultiAxis, toPartFrame } from "@/components/simulator/multiaxis";
import { voxCarve, voxInit, voxMeta, voxSample } from "@/components/simulator/voxel";
import { carveCyl, cylInit, cylMeta, cylSdf, isCyl } from "@/components/simulator/cylinder";
import { isoRender, type Box3 } from "@/components/simulator/isoRender";
import { detectKin } from "@/lib/parser";
import { FigDefs, figCtx, type Ctx } from "@/components/fig";
import { contourPath, isoSegments, joinSegments } from "@/lib/contour";

/*
  Podgląd gotowego detalu jako rysunek SVG, liczony przy budowie strony — w stylu rysunków kursu (fig.tsx):
  ciemne pole, stal w ciemnym tonie, krawędzie obróbki w kolorze akcentu, wymiary i punkt W.
  Tokarka: przekrój wałka po obróbce (profil zewnętrzny i otwór), średnica na lewym końcu i długość obróbki.
  Frezarka: widok z góry obrobionego detalu (mapa wysokości z cieniowaniem), wymiary półfabrykatu, W w X0 Y0.
  Wymiary biorą się z geometrii (półfabrykat z zadania/programu, profil po symulacji) — nic nie jest wpisane ręcznie.
*/

const W = 400, H = 200;
/** marginesy na wymiary: lewy (W, średnica), prawy (wymiar pionowy), górny, dolny (wymiar poziomy) */
const ML = 34, MR = 50, MT = 20, MB = 36;

/** Liczba po polsku: przecinek dziesiętny, bez zbędnego „,0”. */
export const fmtMm = (v: number) => (Math.round(v * 10) / 10).toString().replace(".", ",");

export default function ProgramPreview({ p, id }: { p: LibProgram; id: string }) {
  const lathe = p.mode === "lathe";
  const prog = parseProgram(p.src, { diameterX: lathe });
  const setup = { ...defaultSetup(p.mode), tools: simTools(p), stock: { ...defaultSetup(p.mode).stock, ...(p.stock ?? {}), auto: !p.stock } };
  if (lathe) return <Lathe prog={prog} setup={setup} id={id} stockKnown={!!p.stock} />;
  // 4. oś (walec) i 4/5 osi na prostopadłościanie — rzut aksonometryczny, bo obróbka idzie też z boków
  if (isCyl(setup, "mill") || isMultiAxis(prog)) return <Iso prog={prog} setup={setup} src={p.src} />;
  // wymiary tylko dla półfabrykatu podanego w programie/zadaniu — przy samoczynnym (z zasięgu toru) byłyby zmyślone
  return <Mill prog={prog} setup={setup} id={id} dims={!!p.stock} />;
}

type Prog = ReturnType<typeof parseProgram>;
type SetupT = ReturnType<typeof defaultSetup>;

function Lathe({ prog, setup, id, stockKnown }: { prog: Prog; setup: SetupT; id: string; stockKnown: boolean }) {
  const lens = prog.segments.map(segmentLength);
  const pr = latheProfile(prog, prog.segments, lens, lens.reduce((a, b) => a + b, 0), setup);
  if (!pr) return <svg viewBox={`0 0 ${W} ${H}`} className="pp" />;
  // pokazujemy tylko obrabianą część pręta (od czoła do ostatniej zmiany + zapas)
  const n = pr.rout.length - 1;
  let kMin = n;
  for (let k = 0; k <= n; k++) if (pr.rout[k] < pr.R0 - 1e-3 || pr.rin[k] > 1e-3) { kMin = k; break; }
  const zFrom = Math.max(pr.z0, pr.z0 + kMin * pr.dz - 8), zTo = pr.z1;
  // tokarka: średnica z lewej (opis „⌀50” obok linii), z prawej tylko W na czole
  const L0 = 64, R0m = 24, bw = W - L0 - R0m, bh = H - MT - MB;
  const s = Math.min(bw / (zTo - zFrom), bh / (2 * pr.R0));
  const cx = L0 + bw / 2 - ((zFrom + zTo) / 2) * s, cy = MT + bh / 2;
  const X = (z: number) => cx + z * s, Y = (r: number) => cy - r * s;
  const k0 = Math.max(0, Math.floor((zFrom - pr.z0) / pr.dz));
  const every = Math.max(1, Math.floor((n - k0) / 500));
  const ks: number[] = []; for (let k = k0; k <= n; k += every) ks.push(k); if (ks[ks.length - 1] !== n) ks.push(n);
  const zk = (k: number) => pr.z0 + k * pr.dz;
  const pts = (sgn: number, r: Float32Array | number[], rev = false) => (rev ? ks.slice().reverse() : ks).map((k) => `${X(zk(k)).toFixed(1)},${Y(sgn * r[k]).toFixed(1)}`).join(" ");
  const hasHole = ks.some((k) => pr.rin[k] > 1e-3);
  const c = figCtx(id);
  // wymiary z profilu: średnica na lewym końcu widoku i długość obrobionego odcinka od czoła (po planowaniu).
  // Średnica pręta bez podanego półfabrykatu to tylko szacunek z toru — wtedy wymiar tylko dla obrobionej średnicy.
  let kFace = n; while (kFace > k0 && pr.rout[kFace] < 1e-2) kFace--;
  const zFace = zk(kFace);
  const dLeft = 2 * pr.rout[k0];
  const dShow = stockKnown || pr.rout[k0] < pr.R0 - 1e-3;
  const zCut = zk(kMin), lenCut = zFace - zCut;
  const wOn = 0 >= zFrom - 1e-6 && 0 <= zTo + 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pp" role="img"
      aria-label={`Przekrój detalu po obróbce${dShow ? `, średnica ${fmtMm(dLeft)} mm na lewym końcu` : ""}, obróbka na długości ${fmtMm(lenCut)} mm`}>
      <FigDefs id={id} />
      <defs>
        <linearGradient id={`${id}-m`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#23272E" /><stop offset=".42" stopColor="#3A404A" /><stop offset=".5" stopColor="#424955" />
          <stop offset=".58" stopColor="#3A404A" /><stop offset="1" stopColor="#23272E" />
        </linearGradient>
      </defs>
      <line x1={X(zFrom) - 10} y1={cy} x2={X(zTo) + 12} y2={cy} className="pp-axis" />
      <polygon points={`${pts(1, pr.rout)} ${pts(1, pr.rin, true)}`} fill={`url(#${id}-m)`} className="pp-part" />
      <polygon points={`${pts(-1, pr.rout)} ${pts(-1, pr.rin, true)}`} fill={`url(#${id}-m)`} className="pp-part" />
      <polyline points={pts(1, pr.rout)} className="pp-cut" />
      <polyline points={pts(-1, pr.rout)} className="pp-cut" />
      <line x1={X(zFace)} y1={Y(pr.rout[kFace])} x2={X(zFace)} y2={Y(-pr.rout[kFace])} className="pp-cut" />
      {hasHole && <polygon points={`${pts(1, pr.rin)} ${pts(-1, pr.rin, true)}`} className="pp-hole" />}
      {dShow && <VDim x={X(zFrom) - 14} xRef={X(zFrom)} y1={Y(dLeft / 2)} y2={Y(-dLeft / 2)} label={`⌀${fmtMm(dLeft)}`} side="left" c={c} />}
      {lenCut > 0.5 && <HDim x1={X(zCut)} x2={X(zFace)} y={Y(-pr.R0) + 16} yRef={Y(-pr.rout[kMin])} label={fmtMm(lenCut)} c={c} />}
      {wOn && <WMark x={X(0)} y={cy} pos="ne" />}
    </svg>
  );
}

/** Wymiar poziomy: linie pomocnicze od krawędzi (yRef) do linii wymiarowej (y), opis pod spodem. */
function HDim({ x1, x2, y, yRef, label, c }: { x1: number; x2: number; y: number; yRef: number; label: string; c: Ctx }) {
  const g = Math.sign(y - yRef) || 1;
  return (
    <g className="pp-dim">
      <line x1={x1} y1={yRef + 2 * g} x2={x1} y2={y + 3 * g} className="p-ext" />
      <line x1={x2} y1={yRef + 2 * g} x2={x2} y2={y + 3 * g} className="p-ext" />
      <line x1={x1} y1={y} x2={x2} y2={y} className="p-dim" markerStart={c.a("dim")} markerEnd={c.a("dim")} />
      <text x={(x1 + x2) / 2} y={y + 15} textAnchor="middle">{label}</text>
    </g>
  );
}

/** Wymiar pionowy: linie pomocnicze od krawędzi (xRef), opis z boku linii wymiarowej. */
function VDim({ x, xRef, y1, y2, label, side, c }: { x: number; xRef: number; y1: number; y2: number; label: string; side: "left" | "right"; c: Ctx }) {
  const g = Math.sign(x - xRef) || 1;
  return (
    <g className="pp-dim">
      <line x1={xRef + 2 * g} y1={y1} x2={x + 3 * g} y2={y1} className="p-ext" />
      <line x1={xRef + 2 * g} y1={y2} x2={x + 3 * g} y2={y2} className="p-ext" />
      <line x1={x} y1={y1} x2={x} y2={y2} className="p-dim" markerStart={c.a("dim")} markerEnd={c.a("dim")} />
      <text x={side === "left" ? x - 6 : x + 6} y={(y1 + y2) / 2 + 4.5} textAnchor={side === "left" ? "end" : "start"}>{label}</text>
    </g>
  );
}

/** Punkt zerowy przedmiotu W (kropka w kolorze akcentu i opis z halo). */
function WMark({ x, y, pos }: { x: number; y: number; pos: "ne" | "nw" | "se" | "sw" }) {
  const dx = pos.endsWith("e") ? 7 : -7, dy = pos.startsWith("n") ? -7 : 15;
  return (
    <g className="pp-wpt">
      <circle cx={x} cy={y} r={3.6} />
      <text x={x + dx} y={y + dy} textAnchor={dx > 0 ? "start" : "end"}>W</text>
    </g>
  );
}

/*
  Frezarka: mapa wysokości po całym programie (ta sama co w 3D), z cieniowaniem światłem
  z lewej-górnej strony i przyciemnieniem z głębokością — wygląda jak obrobiony detal,
  a nie jak nałożone ślady narzędzia. Obrazek w palecie (64 odcienie), liczony przy budowie strony.
*/
const LEVELS = 64;
const PALETTE: [number, number, number, number][] = [[0, 0, 0, 0], ...Array.from({ length: LEVELS }, (_, i) => {
  const t = i / (LEVELS - 1); // 0 — cień, 1 — światło
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
  // stal w ciemnym tonie: cień #121418 → światło #323842 (powierzchnia płaska ≈ #2C3139); jasne bryły świeciły mocniej niż treść
  return [mix(18, 50), mix(20, 56), mix(24, 66), 255] as [number, number, number, number];
})];

/** Rzut aksonometryczny nie ma konturu ani wymiarów — stal jaśniejsza niż w widoku z góry, żeby bryła odcinała się od pola. */
const ISO_PALETTE: [number, number, number, number][] = [[0, 0, 0, 0], ...Array.from({ length: LEVELS }, (_, i) => {
  const t = i / (LEVELS - 1);
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
  return [mix(34, 132), mix(38, 142), mix(46, 158), 255] as [number, number, number, number];
})];

/** Detal po obróbce w rzucie aksonometrycznym (pole odległości: walec albo siatka objętościowa). */
function Iso({ prog, setup, src }: { prog: Prog; setup: SetupT; src: string }) {
  const IW = 240, IH = 150;
  let sdf: (x: number, y: number, z: number) => number, box: Box3, step: number;
  if (isCyl(setup, "mill")) {
    const m = cylMeta(setup, 160);
    const h = cylInit(m), lens = prog.segments.map(playLength);
    carveCyl(h, m, prog, lens, setup, 0, lens.reduce((a, b) => a + b, 0) + 1);
    sdf = cylSdf(h, m);
    box = { x0: m.x0, x1: m.x1, y0: -m.R, y1: m.R, z0: m.axisZ - m.R, z1: m.axisZ + m.R };
    step = Math.max(0.3, m.R / 60);
  } else {
    const segs = toPartFrame(prog.segments, detectKin(src));
    const program = { ...prog, segments: segs };
    const boxes = stockBoxes(program, segs, setup);
    if (!boxes.length) return <svg viewBox={`0 0 ${W} ${H}`} className="pp" />;
    const ub: PieceBox = {
      x0: Math.min(...boxes.map((b) => b.x0)), x1: Math.max(...boxes.map((b) => b.x1)),
      y0: Math.min(...boxes.map((b) => b.y0)), y1: Math.max(...boxes.map((b) => b.y1)),
      top: Math.max(...boxes.map((b) => b.top)), bottom: Math.min(...boxes.map((b) => b.bottom)), origin: { x: 0, y: 0, z: 0 },
    };
    const m = voxMeta(ub, 160_000), f = voxInit(m, ub), lens = segs.map(playLength);
    voxCarve(f, m, segs, lens, program, setup, 0, lens.reduce((a, b) => a + b, 0) + 1, new Set());
    sdf = (x, y, z) => voxSample(f, m, x, y, z);
    box = { x0: ub.x0 - 1, x1: ub.x1 + 1, y0: ub.y0 - 1, y1: ub.y1 + 1, z0: ub.bottom - 1, z1: ub.top + 1 };
    step = m.h * 0.6;
  }
  const img = palettePng(IW, IH, isoRender(sdf, box, IW, IH, step, LEVELS), ISO_PALETTE);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pp" role="img" aria-label="Detal po obróbce w rzucie aksonometrycznym">
      <image href={img} x={0} y={0} width={W} height={H} preserveAspectRatio="xMidYMid meet" />
    </svg>
  );
}

function Mill({ prog, setup, id, dims }: { prog: Prog; setup: SetupT; id: string; dims: boolean }) {
  // tor środka narzędzia (z korekcją G41/G42), tak jak w symulatorze
  const segs = applyCompensation(prog, setup, "mill").segments;
  const program = { ...prog, segments: segs };
  const boxes = stockBoxes(program, segs, setup);
  if (!boxes.length) return <svg viewBox={`0 0 ${W} ${H}`} className="pp" />;
  const ub: PieceBox = {
    x0: Math.min(...boxes.map((b) => b.x0)), x1: Math.max(...boxes.map((b) => b.x1)),
    y0: Math.min(...boxes.map((b) => b.y0)), y1: Math.max(...boxes.map((b) => b.y1)),
    top: Math.max(...boxes.map((b) => b.top)), bottom: Math.min(...boxes.map((b) => b.bottom)), origin: { x: 0, y: 0, z: 0 },
  };
  const m = millMeta(ub, 1, 170, true);
  const nx = m.nx + 1, ny = m.ny + 1;
  // komórki poza półfabrykatami: NaN (przezroczyste); w środku — wierzch swojego detalu
  const h = new Float32Array(nx * ny).fill(NaN);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const x = m.minX + i * m.cx, y = m.minY + j * m.cy;
    const b = boxes.find((q) => x >= q.x0 - 1e-6 && x <= q.x1 + 1e-6 && y >= q.y0 - 1e-6 && y <= q.y1 + 1e-6);
    if (b) h[j * nx + i] = b.top;
  }
  const lengths = segs.map(playLength);
  carve(h, m, program, lengths, setup, "mill", 0, lengths.reduce((a, b) => a + b, 0) + 1);
  let zMin = Infinity, zTop = -Infinity;
  for (const v of h) if (!Number.isNaN(v)) { zMin = Math.min(zMin, v); zTop = Math.max(zTop, v); }
  const depth = Math.max(0.5, zTop - zMin);
  // cieniowanie: normalna z różnic sąsiadów, światło z lewej-górnej strony pod 45°
  const L = { x: -0.5, y: 0.5, z: 0.707 };
  const px = new Uint8Array(nx * ny);
  const at = (i: number, j: number, fb: number) => { const v = h[Math.min(ny - 1, Math.max(0, j)) * nx + Math.min(nx - 1, Math.max(0, i))]; return Number.isNaN(v) ? fb : v; };
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const v = h[j * nx + i];
    const row = ny - 1 - j; // obraz: Y w górę
    if (Number.isNaN(v)) { px[row * nx + i] = 0; continue; }
    const dzx = (at(i + 1, j, v) - at(i - 1, j, v)) / (2 * m.cx), dzy = (at(i, j + 1, v) - at(i, j - 1, v)) / (2 * m.cy);
    const nlen = Math.hypot(dzx, dzy, 1);
    const lambert = Math.max(0, (-dzx * L.x - dzy * L.y + L.z) / nlen);
    const dShade = 1 - 0.45 * Math.min(1, (zTop - v) / depth);
    const t = Math.max(0, Math.min(1, (0.35 + 0.65 * lambert) * dShade));
    px[row * nx + i] = 1 + Math.round(t * (LEVELS - 1));
  }
  const img = palettePng(nx, ny, px, PALETTE);
  // rysunek: detal w polu bez marginesów na wymiary, środek pola
  const bw = W - ML - MR, bh = H - MT - MB;
  const s = Math.min(bw / (ub.x1 - ub.x0), bh / (ub.y1 - ub.y0));
  const ox = ML + (bw - (ub.x1 - ub.x0) * s) / 2, oy = MT + (bh - (ub.y1 - ub.y0) * s) / 2;
  const X = (x: number) => ox + (x - ub.x0) * s, Y = (y: number) => H - MB - (oy - MT) - (y - ub.y0) * s;
  // krawędzie obróbki: izolinia głębokości 0,05 mm pod najwyższą powierzchnią (po planowaniu — pod nową)
  const g = new Float32Array(nx * ny);
  for (let k = 0; k < g.length; k++) g[k] = Number.isNaN(h[k]) ? NaN : zTop - h[k];
  const cut = contourPath(joinSegments(isoSegments(g, nx, ny, 0.05)), ([i, j]) => [X(m.minX + i * m.cx), Y(m.minY + j * m.cy)], 0.45);
  const c = figCtx(id);
  const one = dims && boxes.length === 1;
  const wx = X(0), wy = Y(0);
  const wIn = 0 >= ub.x0 - 3 && 0 <= ub.x1 + 3 && 0 >= ub.y0 - 3 && 0 <= ub.y1 + 3;
  const wPos = `${0 <= (ub.y0 + ub.y1) / 2 ? "s" : "n"}${0 <= (ub.x0 + ub.x1) / 2 ? "w" : "e"}` as "ne" | "nw" | "se" | "sw";
  const sx = fmtMm(ub.x1 - ub.x0), sy = fmtMm(ub.y1 - ub.y0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pp" role="img" aria-label={one ? `Detal z góry po obróbce, półfabrykat ${sx} × ${sy} mm` : "Detal z góry po obróbce"}>
      <FigDefs id={id} />
      <image href={img} x={X(ub.x0)} y={Y(ub.y1)} width={(ub.x1 - ub.x0) * s} height={(ub.y1 - ub.y0) * s} preserveAspectRatio="none" />
      {boxes.map((b, k) => <rect key={k} x={X(b.x0)} y={Y(b.y1)} width={(b.x1 - b.x0) * s} height={(b.y1 - b.y0) * s} className="pp-edge" />)}
      {cut && <path d={cut} className="pp-cut" />}
      {one && <text x={X(ub.x0)} y={Y(ub.y1) - 5} className="pp-note">półfabrykat</text>}
      {one && <HDim x1={X(ub.x0)} x2={X(ub.x1)} y={Y(ub.y0) + 14} yRef={Y(ub.y0)} label={sx} c={c} />}
      {one && <VDim x={X(ub.x1) + 14} xRef={X(ub.x1)} y1={Y(ub.y1)} y2={Y(ub.y0)} label={sy} side="right" c={c} />}
      {wIn && <WMark x={wx} y={wy} pos={wPos} />}
    </svg>
  );
}
