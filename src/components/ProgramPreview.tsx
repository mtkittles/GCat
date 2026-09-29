import { parseProgram, pointAt, segmentLength, type Segment } from "@/lib/parser";
import { latheProfile } from "@/components/simulator/latheStock";
import { cuttingRadius, defaultSetup, toolOf } from "@/components/simulator/setup";
import { applyCompensation } from "@/components/simulator/compensation";
import { simTools, type LibProgram } from "@/lib/programLibrary";

/*
  Podgląd gotowego detalu jako SVG, liczony przy budowie strony.
  Tokarka: przekrój wałka po obróbce (profil zewnętrzny i otwór).
  Frezarka: widok z góry — półfabrykat i ślady narzędzi, ciemniejsze głębiej.
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

function Mill({ prog, setup, id }: { prog: Prog; setup: SetupT; id: string }) {
  // tor środka narzędzia (z korekcją G41/G42), tak jak w symulatorze
  const segs = applyCompensation(prog, setup, "mill").segments;
  const cut = segs.filter((s) => s.kind !== "rapid" && s.kind !== "dwell");
  const st = setup.stock;
  let x0: number, y0: number, x1: number, y1: number, zTop: number;
  if (!st.auto) { x0 = -st.ox; y0 = -st.oy; x1 = x0 + st.x; y1 = y0 + st.y; zTop = st.z - st.oz; }
  else {
    const b = prog.bounds; x0 = b.min.x - 5; y0 = b.min.y - 5; x1 = b.max.x + 5; y1 = b.max.y + 5; zTop = 0;
  }
  const s = Math.min((W - 2 * PAD) / (x1 - x0), (H - 2 * PAD) / (y1 - y0));
  const ox = (W - (x1 - x0) * s) / 2, oy = (H - (y1 - y0) * s) / 2;
  const X = (x: number) => ox + (x - x0) * s, Y = (y: number) => H - oy - (y - y0) * s;
  let zMin = 0;
  for (const sg of cut) zMin = Math.min(zMin, sg.from.z, sg.to.z);
  const depth = Math.max(0.5, zTop - zMin);
  // ślady: najpierw płytkie, na wierzch głębsze
  const marks = cut.map((sg) => {
    const tool = toolOf(setup, prog.lines[sg.line]?.state.tool ?? null, "mill");
    const z = Math.min(sg.from.z, sg.to.z);
    // grawer i fazownik: szerokość śladu zależy od głębokości
    const r = tool.kind === "vbit" || tool.kind === "chamfer"
      ? Math.max(0.3, Math.min(tool.d / 2, (zTop - z) * Math.tan(((tool.angle || 90) / 2) * Math.PI / 180)))
      : Math.max(0.3, cuttingRadius(tool));
    return { sg, r, z };
  }).filter((m) => m.z < zTop - 1e-3).sort((a, b) => b.z - a.z);
  const shade = (z: number) => { const t = Math.min(1, (zTop - z) / depth); const l = Math.round(78 - t * 50); return `hsl(215 12% ${l}%)`; };
  const path = (sg: Segment) => {
    const n = sg.kind === "arc" ? 36 : 1;
    const pts = Array.from({ length: n + 1 }, (_, k) => pointAt(sg, k / n));
    return pts.map((q, k) => `${k ? "L" : "M"}${X(q.x).toFixed(1)},${Y(q.y).toFixed(1)}`).join("");
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="pp" role="img" aria-label="Detal z góry">
      <defs>
        <linearGradient id={`${id}-m`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e4e9f0" /><stop offset=".55" stopColor="#bcc5d1" /><stop offset="1" stopColor="#8e98a6" />
        </linearGradient>
        <clipPath id={`${id}-c`}><rect x={X(x0)} y={Y(y1)} width={(x1 - x0) * s} height={(y1 - y0) * s} rx={3} /></clipPath>
      </defs>
      <rect x={X(x0)} y={Y(y1)} width={(x1 - x0) * s} height={(y1 - y0) * s} rx={3} fill={`url(#${id}-m)`} className="pp-part" />
      {/* ślady tylko w obrębie półfabrykatu — dojazdy i wybiegi poza nim nic nie zdejmują */}
      <g clipPath={`url(#${id}-c)`}>
      {marks.map((m, k) => {
        const isHole = m.sg.kind === "linear" && Math.hypot(m.sg.to.x - m.sg.from.x, m.sg.to.y - m.sg.from.y) < 1e-6;
        return isHole
          ? <circle key={k} cx={X(m.sg.from.x)} cy={Y(m.sg.from.y)} r={m.r * s} fill={shade(m.z)} />
          : <path key={k} d={path(m.sg)} stroke={shade(m.z)} strokeWidth={Math.max(0.8, 2 * m.r * s)} strokeLinecap="round" strokeLinejoin="round" fill="none" />;
      })}
      </g>
    </svg>
  );
}
