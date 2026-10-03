import { noseOf } from "./compensation";
import { INSERT_ANGLE, type Tool } from "./setup";

/*
  Obrys noża tokarskiego w płaszczyźnie ZX (Z w prawo, X w górę), względem punktu P.
  Płytka ułożona wg kąta przystawienia κr: krawędź główna tworzy z kierunkiem
  posuwu (−Z) kąt κr, krawędź pomocnicza jest obrócona o kąt naroża płytki.
  Naroże zaokrąglone promieniem rε, styczne do obu krawędzi.
*/

export interface Outline { insert: [number, number][]; holder?: [number, number][] }

const EDGE: Record<string, number> = { C: 12.9, D: 15.5, V: 16.6, T: 16.5, W: 8.7, S: 12.7 };
const rad = (d: number) => (d * Math.PI) / 180;

export function latheOutline(t: Tool): Outline {
  if (t.kind === "grooving") {
    const w = t.d > 0 ? t.d : 3;
    return {
      insert: [[0, 0], [w, 0], [w, 12], [0, 12]],
      holder: [[-1, 12], [w + 1, 12], [w + 1, 30], [-1, 30]],
    };
  }
  if (t.kind === "threading") {
    // Płytka do gwintów: zarys V (domyślnie 60°) o wysokości ~3 mm na korpusie płytki.
    // Kierunek ostrza 6 — gwint wewnętrzny: ostrze ku górze, wytaczak wzdłuż osi Z, wychodzący z otworu.
    const g = t.tip === 6 ? -1 : 1;
    const half = (t.angle || 60) / 2, h = 3, w = h * Math.tan(rad(half));
    const insert: [number, number][] = [[0, 0], [w, g * h], [3.2, g * h], [3.2, g * 5.5], [-3.2, g * 5.5], [-3.2, g * h], [-w, g * h]];
    const holder: [number, number][] = g > 0
      ? [[-6, 5.5], [6, 5.5], [6, 28], [-6, 28]]                 // zewnętrzny: nóż prostopadle do osi
      : [[-4.2, -5.5], [42, -5.5], [42, -14], [-4.2, -14]];        // wewnętrzny: wytaczak w osi Z
    return { insert, holder };
  }
  if (t.kind === "drill") {
    const r = t.d / 2, cone = r / Math.tan(rad((t.angle || 118) / 2)), len = Math.max(25, t.d * 4);
    return { insert: [[0, 0], [cone, r], [len, r], [len, -r], [cone, -r]] };
  }

  // nóż z płytką: zewnętrzny (turning) albo wytaczak (boring — lustro względem Z)
  const shape = t.shape ?? (t.kind === "boring" ? "D" : "C");
  const eps = rad(INSERT_ANGLE[shape] ?? 80);
  const kr = rad(Math.max(30, Math.min(120, t.angle || 93)));
  const sgn = t.kind === "boring" ? -1 : 1;
  const thM = Math.PI - kr, thS = thM - eps;
  const em: [number, number] = [Math.cos(thM), sgn * Math.sin(thM)];
  const es: [number, number] = [Math.cos(thS), sgn * Math.sin(thS)];
  const nose = noseOf(t);
  const r = Math.max(0.05, t.d);
  const C: [number, number] = nose ? [-nose.tz, -nose.tx] : [r, sgn * r];
  const bl = Math.hypot(em[0] + es[0], em[1] + es[1]);
  const b: [number, number] = [(em[0] + es[0]) / bl, (em[1] + es[1]) / bl];
  const cd = r / Math.sin(eps / 2);
  const N: [number, number] = [C[0] - b[0] * cd, C[1] - b[1] * cd];
  // Wytaczak ma mniejszą płytkę (np. DCMT 07) niż nóż zewnętrzny — mieści się w otworze.
  const L = t.kind === "boring" ? Math.min(7.5, (EDGE[shape] ?? 13) * 0.5) : EDGE[shape] ?? 13;
  const tl = r / Math.tan(eps / 2);
  const Tm: [number, number] = [N[0] + em[0] * tl, N[1] + em[1] * tl];
  const Ts: [number, number] = [N[0] + es[0] * tl, N[1] + es[1] * tl];
  // łuk naroża od krawędzi pomocniczej do głównej, po stronie wierzchołka
  const a0 = Math.atan2(Ts[1] - C[1], Ts[0] - C[0]);
  const a1 = Math.atan2(Tm[1] - C[1], Tm[0] - C[0]);
  let sw = a1 - a0;
  while (sw > Math.PI) sw -= 2 * Math.PI;
  while (sw < -Math.PI) sw += 2 * Math.PI;
  const mid = a0 + sw / 2, toN = Math.atan2(N[1] - C[1], N[0] - C[0]);
  if (Math.cos(mid - toN) < 0) sw -= Math.sign(sw) * 2 * Math.PI;
  const arc: [number, number][] = [];
  for (let k = 0; k <= 8; k++) { const a = a0 + (sw * k) / 8; arc.push([C[0] + r * Math.cos(a), C[1] + r * Math.sin(a)]); }
  const A: [number, number] = [N[0] + em[0] * L, N[1] + em[1] * L];
  const B: [number, number] = [N[0] + es[0] * L, N[1] + es[1] * L];
  const three = shape === "T" || shape === "W";
  const F: [number, number] = [N[0] + (em[0] + es[0]) * L, N[1] + (em[1] + es[1]) * L];
  const insert: [number, number][] = three ? [...arc, A, B] : [...arc, A, F, B];
  const far = three ? [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2] : F;
  if (t.kind === "boring") {
    // wytaczak: okrągły drążek wzdłuż osi Z, wychodzący z otworu (w stronę +Z), pod płytką
    const top = Math.min(A[1], B[1], F[1]) + 1.2, bar = 9;
    const z0 = Math.min(A[0], B[0], F[0]) - 0.5;
    return { insert, holder: [[z0, top], [z0 + 48, top], [z0 + 48, top - bar], [z0, top - bar]] };
  }
  // nóż zewnętrzny: trzonek za płytką, prostopadle do osi
  const hw = 7;
  const holder: [number, number][] = [[far[0] - hw, far[1] - sgn * 4], [far[0] + hw, far[1] - sgn * 4], [far[0] + hw, far[1] + sgn * 22], [far[0] - hw, far[1] + sgn * 22]];
  return { insert, holder };
}
