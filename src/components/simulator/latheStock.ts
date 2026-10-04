import { pointAt, segmentLength, type Program, type Segment } from "@/lib/parser";
import { noseOf } from "./compensation";
import { latheOutline } from "./latheInsert";
import { toolOf, type Setup } from "./setup";

/*
  Przekrój pręta na tokarce w trakcie obróbki — połowa nad osią, jako profil
  promienia zewnętrznego (rout) i wewnętrznego (rin) w funkcji Z.
  Każde narzędzie zdejmuje materiał swoim kształtem:
  – nóż z narożem: okrąg rε wokół środka naroża (punkt P przesunięty wg kierunku ostrza),
  – nóż do rowków: prostokąt szerokości płytki, od lewego naroża w stronę czoła,
  – nóż do gwintów: zarys V 60° powtarzany co skok (posuw F),
  – wiertło w osi: otwór o średnicy wiertła ze stożkiem na dnie.
*/

export interface LatheProfile { z0: number; z1: number; dz: number; R0: number; rout: Float32Array; rin: Float32Array }

/** Surówka z komentarza, np. `(SUROWKA: PRET FI40, WYSIEG 70)`. */
function stockFromComments(program: Program): { d?: number; len?: number } {
  for (const l of program.lines) {
    const c = l.comment?.toUpperCase();
    if (!c || !/SUROW|PRET|PRĘT|STOCK|BAR/.test(c)) continue;
    const d = c.match(/(?:FI|Ø|⌀)\s*(\d+(?:[.,]\d+)?)/);
    const len = c.match(/(?:WYSIEG|DL|LEN)\w*\s*(\d+(?:[.,]\d+)?)/);
    return { d: d ? Number(d[1].replace(",", ".")) : undefined, len: len ? Number(len[1].replace(",", ".")) : undefined };
  }
  return {};
}

/**
 * Obwiednia płytki w kolumnach Z (co dz), względem punktu P: dla noża zewnętrznego
 * najniższy punkt płytki w danej kolumnie, dla wytaczaka — najwyższy.
 * Materiał zdejmuje cała płytka, a nie tylko naroże.
 */
function insertEnvelope(poly: [number, number][], dz: number, lower: boolean): { k0: number; v: Float32Array } | null {
  if (poly.length < 3) return null;
  const zs = poly.map((p) => p[0]);
  const k0 = Math.floor(Math.min(...zs) / dz), k1 = Math.ceil(Math.max(...zs) / dz);
  const v = new Float32Array(k1 - k0 + 1).fill(NaN);
  for (let k = k0; k <= k1; k++) {
    const z = k * dz;
    let best = NaN;
    for (let i = 0; i < poly.length; i++) {
      const [z1, x1] = poly[i], [z2, x2] = poly[(i + 1) % poly.length];
      if ((z < Math.min(z1, z2)) || (z > Math.max(z1, z2)) || z1 === z2) continue;
      const x = x1 + ((z - z1) / (z2 - z1)) * (x2 - x1);
      if (Number.isNaN(best) || (lower ? x < best : x > best)) best = x;
    }
    v[k - k0] = best;
  }
  return { k0, v };
}

/** Pusty profil: pręt przed obróbką. */
export function initLatheProfile(program: Program, segments: Segment[], setup: Setup): LatheProfile | null {
  const cut = segments.filter((s) => s.kind !== "rapid" && s.kind !== "dwell");
  if (!cut.length) return null;
  let minZ = Infinity, maxR = 0;
  for (const s of cut) for (let t = 0; t <= 1; t += 0.1) { const p = pointAt(s, t); minZ = Math.min(minZ, p.z); maxR = Math.max(maxR, p.x); }
  const st = setup.stock;
  const fromNote = st.auto ? stockFromComments(program) : {};
  const R0 = st.auto ? (fromNote.d ? fromNote.d / 2 : maxR) : st.d / 2;
  const z1 = st.auto ? 0.5 : 0;
  const z0 = st.auto ? (fromNote.len ? -fromNote.len : Math.min(minZ - 8, -10)) : -st.len;
  const n = Math.min(4000, Math.max(200, Math.ceil((z1 - z0) / 0.05)));
  return { z0, z1, dz: (z1 - z0) / n, R0, rout: new Float32Array(n + 1).fill(R0), rin: new Float32Array(n + 1).fill(0) };
}

/**
 * Zdejmuje materiał odcinkami toru od drogi `from` do `to` (mm po torze).
 * Odcinek zaczęty wcześniej jest liczony od początku — operacje są idempotentne,
 * więc można dokładać kolejne klatki animacji bez liczenia całości.
 */
export function carveLathe(pr: LatheProfile, program: Program, segments: Segment[], lengths: number[], from: number, to: number, setup: Setup) {
  const { z0, dz, rout, rin } = pr;
  const n = rout.length - 1;
  const col = (z: number) => Math.round((z - z0) / dz);
  const cutOut = (k: number, y: number) => { if (k < 0 || k > n) return; if (y < rout[k]) rout[k] = Math.max(rin[k], y); };
  const cutIn = (k: number, y: number) => { if (k < 0 || k > n) return; if (y > rin[k]) rin[k] = Math.min(rout[k], y); };

  let acc = 0;
  segments.forEach((sg, i) => {
    const len = lengths[i] ?? segmentLength(sg);
    const start = acc;
    acc += len;
    if (acc <= from || start >= to) return;
    const done = Math.min(1, Math.max(0, (to - start) / (len || 1)));
    if (done <= 0 || sg.kind === "rapid" || sg.kind === "dwell") return;
    const ln = program.lines[sg.line];
    const tool = toolOf(setup, ln?.state.tool ?? null, "lathe");

    if (tool.kind === "drill") {
      const end = pointAt(sg, done);
      const tip = Math.min(sg.from.z, end.z), r = tool.d / 2, tan = Math.tan(((tool.angle || 118) / 2) * Math.PI / 180);
      for (let k = Math.max(0, col(tip)); k <= n; k++) cutIn(k, Math.min(r, (z0 + k * dz - tip) * tan));
      return;
    }

    if (tool.kind === "threading" && sg.kind === "linear" && Math.abs(sg.to.x - sg.from.x) < 1e-6) {
      // zarys V: głębokość maleje z odległością od środka bruzdy (kąt 60° → √3)
      const pitch = ln?.state.feed || 1.5;
      const end = pointAt(sg, done);
      const za = Math.min(sg.from.z, end.z), zb = Math.max(sg.from.z, end.z);
      const flank = 1 / Math.tan(((tool.angle || 60) / 2) * Math.PI / 180);
      const km = Math.max(0, Math.min(n, col((za + zb) / 2)));
      // gwint wewnętrzny: przejście bliżej otworu niż powierzchni zewnętrznej
      const inner = Math.abs(sg.from.x - rin[km]) < Math.abs(rout[km] - sg.from.x);
      for (let k = Math.max(0, col(za)); k <= Math.min(n, col(zb)); k++) {
        const ph = (((sg.from.z - (z0 + k * dz)) % pitch) + pitch) % pitch;
        const d = Math.min(ph, pitch - ph) * flank;
        if (inner) cutIn(k, sg.from.x - d); else cutOut(k, sg.from.x + d);
      }
      return;
    }

    const step = Math.max(dz, 0.15);
    const steps = Math.max(1, Math.ceil((len * done) / step));
    if (tool.kind === "grooving") {
      const w = tool.d > 0 ? tool.d : 3;
      for (let j = 0; j <= steps; j++) {
        const p = pointAt(sg, (j / steps) * done);
        for (let k = Math.max(0, col(p.z)); k <= Math.min(n, col(p.z + w)); k++) cutOut(k, p.x);
      }
      return;
    }

    const inside = tool.kind === "boring";
    const env = (tool.kind === "turning" || tool.kind === "boring") ? insertEnvelope(latheOutline(tool).insert, dz, !inside) : null;
    if (env) {
      for (let j = 0; j <= steps; j++) {
        const p = pointAt(sg, (j / steps) * done);
        const kp = col(p.z);
        for (let m = 0; m < env.v.length; m++) {
          const y = env.v[m];
          if (Number.isNaN(y)) continue;
          const k = kp + env.k0 + m;
          if (inside) cutIn(k, p.x + y); else cutOut(k, p.x + y);
        }
      }
      return;
    }
    // narzędzie bez obrysu: okrąg naroża
    const nose = noseOf(tool);
    const r = nose?.r ?? 0.2, tz = nose?.tz ?? 0, tx = nose?.tx ?? 0;
    for (let j = 0; j <= steps; j++) {
      const p = pointAt(sg, (j / steps) * done);
      const cz = p.z - tz, cx = p.x - tx;
      for (let k = Math.max(0, col(cz - r)); k <= Math.min(n, col(cz + r)); k++) {
        const d = z0 + k * dz - cz;
        const h = Math.sqrt(Math.max(0, r * r - d * d));
        if (inside) cutIn(k, cx + h); else cutOut(k, cx - h);
      }
    }
  });
}

/** Cały profil od zera do `progress`. */
export function latheProfile(program: Program, segments: Segment[], lengths: number[], progress: number, setup: Setup): LatheProfile | null {
  const pr = initLatheProfile(program, segments, setup);
  if (pr) carveLathe(pr, program, segments, lengths, 0, progress, setup);
  return pr;
}

/** Bufor dla animacji: przy ruchu do przodu dokłada tylko nowe odcinki. */
export interface LatheCache { segs: Segment[]; setup: Setup; progress: number; pr: LatheProfile | null }
export function latheProfileCached(cache: { current: LatheCache | null }, program: Program, segments: Segment[], lengths: number[], progress: number, setup: Setup): LatheProfile | null {
  const c = cache.current;
  if (!c || c.segs !== segments || c.setup !== setup || progress < c.progress) {
    const pr = latheProfile(program, segments, lengths, progress, setup);
    cache.current = { segs: segments, setup, progress, pr };
    return pr;
  }
  if (progress > c.progress && c.pr) carveLathe(c.pr, program, segments, lengths, c.progress, progress, setup);
  c.progress = progress;
  return c.pr;
}

/* ---------- Uchwyt tokarski ---------- */

/**
 * Uchwyt trójszczękowy: pręt wystaje z uchwytu na długość wysięgu, więc czoła szczęk leżą
 * w Z = z0 (koniec wysięgu), a szczęki sięgają 12 mm ponad pręt. Korpus uchwytu za szczękami.
 */
export interface LatheChuck { zFace: number; R0: number; jawR: number; jawLen: number; bodyR: number; bodyLen: number }
/**
 * Półfabrykat ręczny: czoło szczęk dokładnie na końcu wysięgu (−długość).
 * Automatyczny: wysięgu nie znamy, więc uchwyt stoi za najdalszym punktem programu (także ruchów szybkich i wiercenia).
 */
export function latheChuck(pr: Pick<LatheProfile, "z0" | "R0">, segments: Segment[] = [], auto = false): LatheChuck {
  let zFace = pr.z0;
  if (auto) for (const sg of segments) if (sg.kind !== "dwell") zFace = Math.min(zFace, sg.from.z - 3, sg.to.z - 3);
  return { zFace, R0: pr.R0, jawR: pr.R0 + 12, jawLen: 18, bodyR: pr.R0 + 30, bodyLen: 40 };
}

/** Kolizja punktu P noża (także szybkim ruchem) ze szczękami: Z na czole szczęk lub dalej, X poniżej ich zewnętrznej średnicy. */
export function latheCollisions(program: Program, segments: Segment[], setup: Setup): { line: number; level: "error"; msg: string }[] {
  // Kolizję da się ocenić tylko przy znanym wysięgu (półfabrykat ustawiony ręcznie).
  if (setup.stock.auto) return [];
  const pr = initLatheProfile(program, segments, setup);
  if (!pr) return [];
  const ch = latheChuck(pr), out: { line: number; level: "error"; msg: string }[] = [], seen = new Set<number>();
  const f = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));
  for (const sg of segments) {
    if (sg.kind === "dwell" || seen.has(sg.line)) continue;
    for (let k = 0; k <= 16; k++) {
      const p = pointAt(sg, k / 16);
      if (p.z <= ch.zFace + 0.2 && p.x < ch.jawR) {
        seen.add(sg.line);
        out.push({ line: sg.line, level: "error", msg: `Kolizja ze szczękami uchwytu (X${f(p.x * 2)} Z${f(p.z)}) — czoło szczęk w Z${f(ch.zFace)}, szczęki do ⌀${f(ch.jawR * 2)}. Skróć ruch w Z albo zwiększ wysięg pręta.` });
        break;
      }
    }
  }
  return out;
}
