/*
  Kontur poziomicowy pola na siatce (marching squares) — do miniatur detali: granica obrobionych
  miejsc na mapie wysokości. Węzły siatki: g[j * nx + i], i = 0..nx-1, j = 0..ny-1.
  Wynik w jednostkach siatki (i, j), łamane połączone w ciągi i uproszczone (Ramer–Douglas–Peucker).
*/

export type Pt2 = [number, number];

/** Odcinki izolinii `level` (pole większe od poziomu = „w środku”). NaN liczy się jak `outside` (domyślnie 0). */
export function isoSegments(g: ArrayLike<number>, nx: number, ny: number, level: number, outside = 0): [Pt2, Pt2][] {
  const v = (i: number, j: number) => { const x = g[j * nx + i]; return Number.isNaN(x) ? outside : x; };
  const lerp = (a: number, b: number) => (a === b || !Number.isFinite(a - b) ? 0.5 : Math.min(1, Math.max(0, (level - a) / (b - a))));
  const out: [Pt2, Pt2][] = [];
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = v(i, j), b = v(i + 1, j), c = v(i + 1, j + 1), d = v(i, j + 1);
    const k = (a > level ? 1 : 0) | (b > level ? 2 : 0) | (c > level ? 4 : 0) | (d > level ? 8 : 0);
    if (k === 0 || k === 15) continue;
    // punkty na krawędziach komórki: dół (a-b), prawo (b-c), góra (d-c), lewo (a-d)
    const S: Pt2 = [i + lerp(a, b), j], E: Pt2 = [i + 1, j + lerp(b, c)];
    const N: Pt2 = [i + lerp(d, c), j + 1], Wp: Pt2 = [i, j + lerp(a, d)];
    const mid = (a + b + c + d) / 4 > level;
    switch (k) {
      case 1: case 14: out.push([Wp, S]); break;
      case 2: case 13: out.push([S, E]); break;
      case 3: case 12: out.push([Wp, E]); break;
      case 4: case 11: out.push([E, N]); break;
      case 6: case 9: out.push([S, N]); break;
      case 7: case 8: out.push([Wp, N]); break;
      case 5: if (mid) { out.push([Wp, N], [S, E]); } else { out.push([Wp, S], [E, N]); } break;
      case 10: if (mid) { out.push([Wp, S], [E, N]); } else { out.push([Wp, N], [S, E]); } break;
    }
  }
  return out;
}

/** Łączy odcinki o wspólnych końcach w łamane (zamknięte mają ostatni punkt równy pierwszemu). */
export function joinSegments(segs: [Pt2, Pt2][]): Pt2[][] {
  const key = (p: Pt2) => `${Math.round(p[0] * 1e4)},${Math.round(p[1] * 1e4)}`;
  const ends = new Map<string, number[]>();
  segs.forEach(([p, q], s) => {
    for (const e of [key(p), key(q)]) { const l = ends.get(e); if (l) l.push(s); else ends.set(e, [s]); }
  });
  const used = new Uint8Array(segs.length);
  const next = (p: Pt2): number => (ends.get(key(p)) ?? []).find((s) => !used[s]) ?? -1;
  const lines: Pt2[][] = [];
  for (let s0 = 0; s0 < segs.length; s0++) {
    if (used[s0]) continue;
    used[s0] = 1;
    const line: Pt2[] = [segs[s0][0], segs[s0][1]];
    // w przód od końca, potem wstecz od początku
    for (const forward of [true, false]) {
      for (;;) {
        const tip = forward ? line[line.length - 1] : line[0];
        const s = next(tip);
        if (s < 0) break;
        used[s] = 1;
        const [p, q] = segs[s];
        const far = key(p) === key(tip) ? q : p;
        if (forward) line.push(far); else line.unshift(far);
      }
    }
    lines.push(line);
  }
  return lines;
}

/** Upraszcza łamaną (Ramer–Douglas–Peucker) z tolerancją `tol` w jej jednostkach. */
export function simplify(pts: Pt2[], tol: number): Pt2[] {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy);
    let best = -1, dmax = tol;
    for (let k = a + 1; k < b; k++) {
      const d = L < 1e-9 ? Math.hypot(pts[k][0] - ax, pts[k][1] - ay) : Math.abs(dy * (pts[k][0] - ax) - dx * (pts[k][1] - ay)) / L;
      if (d > dmax) { dmax = d; best = k; }
    }
    if (best >= 0) { keep[best] = 1; stack.push([a, best], [best, b]); }
  }
  return pts.filter((_, k) => keep[k]);
}

/** Ścieżka SVG z łamanych (zamknięte z „Z”). Długie łamane zamknięte dzielimy na pół przed uproszczeniem. */
export function contourPath(lines: Pt2[][], map: (p: Pt2) => Pt2, tol = 0.4): string {
  const f = (n: number) => (Math.round(n * 10) / 10).toString();
  return lines.map((line) => {
    const closed = line.length > 3 && line[0][0] === line[line.length - 1][0] && line[0][1] === line[line.length - 1][1];
    const mapped = line.map(map);
    let pts: Pt2[];
    if (closed) {
      const h = Math.floor(mapped.length / 2);
      pts = [...simplify(mapped.slice(0, h + 1), tol).slice(0, -1), ...simplify(mapped.slice(h), tol)];
    } else pts = simplify(mapped, tol);
    if (pts.length < 2) return "";
    return `M${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join("L")}${closed ? "Z" : ""}`;
  }).join("");
}
