import { parseProgram, playLength, segmentLength } from "@/lib/parser";
import { latheProfile } from "@/components/simulator/latheStock";
import { defaultSetup } from "@/components/simulator/setup";
import { carve, millMeta } from "@/components/simulator/heightmap";
import { stockBoxes, type PieceBox } from "@/components/simulator/pieces";
import { palettePng } from "@/lib/png";
import { applyCompensation } from "@/components/simulator/compensation";
import { simTools, type LibProgram } from "@/lib/programLibrary";

/*
  Podgląd gotowego detalu jako SVG, liczony przy budowie strony.
  Tokarka: przekrój wałka po obróbce (profil zewnętrzny i otwór).
  Frezarka: widok z góry obrobionego detalu (mapa wysokości z cieniowaniem).
*/

const W = 400, H = 250, PAD = 18;

export default function ProgramPreview({ p, id }: { p: LibProgram; id: string }) {
  const lathe = p.mode === "lathe";
  const prog = parseProgram(p.src, { diameterX: lathe });
  const setup = { ...defaultSetup(p.mode), tools: simTools(p), stock: { ...defaultSetup(p.mode).stock, ...(p.stock ?? {}), auto: !p.stock } };
  return lathe ? <Lathe prog={prog} setup={setup} id={id} /> : <Mill prog={prog} setup={setup} id={id} />;
}

type Prog = ReturnType<typeof parseProgram>;
type SetupT = ReturnType<typeof defaultSetup>;

function Lathe({ prog, setup, id }: { prog: Prog; setup: SetupT; id: string }) {
  const lens = prog.segments.map(segmentLength);
  const pr = latheProfile(prog, prog.segments, lens, lens.reduce((a, b) => a + b, 0), setup);
  if (!pr) return <svg viewBox={`0 0 ${W} ${H}`} className="pp" />;
  // pokazujemy tylko obrabianą część pręta (od czoła do ostatniej zmiany + zapas)
  const n = pr.rout.length - 1;
  let kMin = n;
  for (let k = 0; k <= n; k++) if (pr.rout[k] < pr.R0 - 1e-3 || pr.rin[k] > 1e-3) { kMin = k; break; }
  const zFrom = Math.max(pr.z0, pr.z0 + kMin * pr.dz - 8), zTo = pr.z1;
  const sx = (W - 2 * PAD) / (zTo - zFrom), sy = (H - 2 * PAD) / (2 * pr.R0);
  const s = Math.min(sx, sy);
  const cx = W / 2 - ((zFrom + zTo) / 2) * s, cy = H / 2;
  const X = (z: number) => cx + z * s, Y = (r: number) => cy - r * s;
  const k0 = Math.max(0, Math.floor((zFrom - pr.z0) / pr.dz));
  const every = Math.max(1, Math.floor((n - k0) / 500));
  const ks: number[] = []; for (let k = k0; k <= n; k += every) ks.push(k); if (ks[ks.length - 1] !== n) ks.push(n);
  const zk = (k: number) => pr.z0 + k * pr.dz;
  const outer = (sgn: number) => ks.map((k) => `${X(zk(k)).toFixed(1)},${Y(sgn * pr.rout[k]).toFixed(1)}`).join(" ");
  const inner = (sgn: number) => ks.slice().reverse().map((k) => `${X(zk(k)).toFixed(1)},${Y(sgn * pr.rin[k]).toFixed(1)}`).join(" ");
  const hasHole = ks.some((k) => pr.rin[k] > 1e-3);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pp" role="img" aria-label="Przekrój detalu">
      <defs>
        <linearGradient id={`${id}-m`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b6472" /><stop offset=".35" stopColor="#c9d1dc" /><stop offset=".5" stopColor="#eef2f7" />
          <stop offset=".65" stopColor="#aab4c1" /><stop offset="1" stopColor="#4b5360" />
        </linearGradient>
      </defs>
      <line x1={PAD / 2} y1={cy} x2={W - PAD / 2} y2={cy} className="pp-axis" />
      <polygon points={`${outer(1)} ${inner(1)}`} fill={`url(#${id}-m)`} className="pp-part" />
      <polygon points={`${outer(-1)} ${inner(-1)}`} fill={`url(#${id}-m)`} className="pp-part" />
      {hasHole && <polygon points={`${ks.map((k) => `${X(zk(k)).toFixed(1)},${Y(pr.rin[k]).toFixed(1)}`).join(" ")} ${ks.slice().reverse().map((k) => `${X(zk(k)).toFixed(1)},${Y(-pr.rin[k]).toFixed(1)}`).join(" ")}`} className="pp-hole" />}
    </svg>
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
  return [mix(46, 236), mix(52, 241), mix(62, 247), 255] as [number, number, number, number];
})];

function Mill({ prog, setup }: { prog: Prog; setup: SetupT; id?: string }) {
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
  const m = millMeta(ub, 1, 150, true);
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
  let zMin = ub.top;
  for (const v of h) if (!Number.isNaN(v)) zMin = Math.min(zMin, v);
  const depth = Math.max(0.5, ub.top - zMin);
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
    const dShade = 1 - 0.45 * Math.min(1, (ub.top - v) / depth);
    const t = Math.max(0, Math.min(1, (0.25 + 0.75 * lambert) * dShade));
    px[row * nx + i] = 1 + Math.round(t * (LEVELS - 1));
  }
  const img = palettePng(nx, ny, px, PALETTE);
  const s = Math.min((W - 2 * PAD) / (ub.x1 - ub.x0), (H - 2 * PAD) / (ub.y1 - ub.y0));
  const ox = (W - (ub.x1 - ub.x0) * s) / 2, oy = (H - (ub.y1 - ub.y0) * s) / 2;
  const X = (x: number) => ox + (x - ub.x0) * s, Y = (y: number) => H - oy - (y - ub.y0) * s;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pp" role="img" aria-label="Detal z góry po obróbce">
      <image href={img} x={X(ub.x0)} y={Y(ub.y1)} width={(ub.x1 - ub.x0) * s} height={(ub.y1 - ub.y0) * s} preserveAspectRatio="none" />
      {boxes.map((b, k) => <rect key={k} x={X(b.x0)} y={Y(b.y1)} width={(b.x1 - b.x0) * s} height={(b.y1 - b.y0) * s} rx={2} className="pp-edge" />)}
    </svg>
  );
}
