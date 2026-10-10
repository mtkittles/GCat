import { Code, Fig, mapper, Pt, Step, T } from "@/components/fig";

/* Rysunki modułu T4 — korekcja promienia ostrza. Z w prawo, X w górę. */

/* ================= T4.1: punkt teoretyczny ================= */
export function NosePoint() {
  const R: [number, number, number, number] = [-3, 3.4, -1.2, 3];
  const m = mapper(R, [20, 8, 320, 196]);
  const re = 1.4, C = { z: re, x: re };
  return (
    <Fig id="t41np" code="P" title="Program prowadzi punkt P, a skrawa łuk naroża" h={220} legend={["acc", "cons"]}
      notes={<><Code k="acc">P — wierzchołek teoretyczny</Code><Code k="con">rε — promień naroża</Code></>}
      caption={<>P to przecięcie stycznych do naroża w osiach X i Z. Nóż mierzy się do tego punktu, więc wzdłuż osi Z i na czole (wzdłuż X) naroże styka się z detalem dokładnie tam, gdzie P. Na fazach, stożkach i łukach styka się w innym miejscu.</>}>
      {(c) => (
        <g>
          <path d={`M ${m.X(0)} ${m.Y(C.x)} A ${re * m.u} ${re * m.u} 0 0 0 ${m.X(C.z)} ${m.Y(0)} L ${m.X(3.4)} ${m.Y(0)} L ${m.X(3.4)} ${m.Y(3)} L ${m.X(0)} ${m.Y(3)} Z`} className="p-fill-acc" style={{ stroke: "var(--accent)" }} />
          <line x1={m.X(-3)} y1={m.Y(0)} x2={m.X(3.4)} y2={m.Y(0)} className="p-cons" />
          <line x1={m.X(0)} y1={m.Y(-1.2)} x2={m.X(0)} y2={m.Y(3)} className="p-cons" />
          <circle cx={m.X(C.z)} cy={m.Y(C.x)} r={re * m.u} className="p-cons" style={{ fill: "none" }} />
          <Pt x={m.X(C.z)} y={m.Y(C.x)} label="środek naroża" pos="ne" cls="t-mut t-sm" />
          <Pt x={m.X(0)} y={m.Y(0)} label="P" pos="sw" cls="t-acc t-b t-big" dot="pt-rap" />
          <line x1={m.X(C.z)} y1={m.Y(C.x)} x2={m.X(C.z + re * 0.7071)} y2={m.Y(C.x - re * 0.7071) + 0} className="p-dim" markerEnd={c.a("dim")} />
          <T x={m.X(C.z + 0.5)} y={m.Y(C.x - 0.2)} cls="t-mono t-b">rε</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= T4.1: błąd na fazie ================= */
export function ChamferError() {
  const R: [number, number, number, number] = [-2.8, 2.6, 7.4, 11.4];
  const m = mapper(R, [24, 8, 312, 196]);
  const re = 0.8, k = re * (Math.SQRT2 - 1) / Math.SQRT2; // przesunięcie w X i Z linii rzeczywistej
  const P0 = { z: 2, x: 7 }, P1 = { z: -1, x: 10 };
  return (
    <Fig id="t41ce" code="0,41·rε" title="Faza bez korekcji: zostaje pasek materiału" h={220} legend={["cut", "bad", "stock"]}
      notes={<><Code k="bad">błąd ⟂ fazy ≈ 0,414 · rε = 0,33 mm dla R0,8</Code></>}
      caption={<>Punkt P jedzie dokładnie po linii fazy (zielona), ale naroże styka się z materiałem wyżej — rzeczywista faza (czerwona) leży równolegle, o 0,414 · rε dalej od osi. Na promieniach i stożkach powstaje ten sam rodzaj błędu. G41/G42 go usuwają.</>}>
      {(c) => (
        <g>
          <polygon points={`${m.X(0)},${m.Y(7.4)} ${m.X(0)},${m.Y(9 + k * 2)} ${m.X(-1 + k * 2)},${m.Y(10)} ${m.X(-2.8)},${m.Y(10)} ${m.X(-2.8)},${m.Y(7.4)}`} fill={c.hatch} className="p-con" />
          <line x1={m.X(P0.z)} y1={m.Y(P0.x)} x2={m.X(P1.z)} y2={m.Y(P1.x)} className="p-cut thick" />
          <line x1={m.X(0)} y1={m.Y(9 + k * 2)} x2={m.X(-1 + k * 2)} y2={m.Y(10)} className="p-bad thick" />
          <circle cx={m.X(-0.5 + re)} cy={m.Y(9.5 + re)} r={re * m.u} className="tool" />
          <Pt x={m.X(-0.5)} y={m.Y(9.5)} label="P" pos="sw" cls="t-acc t-b" dot="pt-rap" />
          <T x={m.X(1.0)} y={m.Y(7.8)} cls="t-cut t-b">program</T>
          <T x={m.X(-2.6)} y={m.Y(10.5)} cls="t-bad t-b">skrawa naroże</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= T4.1: G42 zewnętrznie, G41 wewnątrz ================= */
export function LatheSides() {
  const R: [number, number, number, number] = [-40, 6, -4, 24];
  const m = mapper(R, [10, 6, 340, 196]);
  return (
    <Fig id="t41sd" code="G42 G41" title="Po której stronie konturu jest nóż" h={222} legend={["cut", "acc", "stock"]}
      notes={<><Code k="acc">zewnętrznie, w stronę uchwytu: G42</Code><Code k="acc">wewnątrz (wytaczanie), w stronę uchwytu: G41</Code></>}
      caption={<>Patrząc w kierunku ruchu — w stronę uchwytu — nóż zewnętrzny jest nad konturem, czyli po prawej stronie: G42. Wytaczak we wnętrzu otworu jest pod konturem, po lewej: G41. Jak przy łukach, stronę odczytuje się z rysunku z X w górę.</>}>
      {(c) => (
        <g>
          <rect x={m.X(-38)} y={m.Y(15)} width={38 * m.u} height={9 * m.u} fill={c.hatch} className="p-con" />
          <line x1={m.X(-40)} y1={m.Y(0)} x2={m.X(6)} y2={m.Y(0)} className="p-cons" />
          <line x1={m.X(2)} y1={m.Y(15)} x2={m.X(-34)} y2={m.Y(15)} className="p-cut thick" markerEnd={c.a("cut")} />
          <line x1={m.X(2)} y1={m.Y(6)} x2={m.X(-34)} y2={m.Y(6)} className="p-cut thick" markerEnd={c.a("cut")} />
          <polygon points={`${m.X(-10)},${m.Y(15)} ${m.X(-7)},${m.Y(19)} ${m.X(-3)},${m.Y(17.5)}`} className="p-fill-acc" style={{ stroke: "var(--accent)" }} />
          <polygon points={`${m.X(-10)},${m.Y(6)} ${m.X(-7)},${m.Y(2.5)} ${m.X(-3)},${m.Y(3.8)}`} className="p-fill-acc" style={{ stroke: "var(--accent)" }} />
          <T x={m.X(-20)} y={m.Y(19)} anchor="middle" cls="t-acc t-b">G42 — nóż zewnętrzny</T>
          <T x={m.X(-20)} y={m.Y(3.4)} anchor="middle" cls="t-acc t-b">G41 — wytaczak</T>
          <T x={m.X(-37)} y={m.Y(10.2)} cls="t-mut t-sm">ścianka tulei</T>
          <T x={m.X(-37)} y={m.Y(1.5)} cls="t-mut t-sm">otwór</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= T4.1: przykład rozwiązany — gdzie włączyć i wyłączyć korekcję =================
   Kontur wykańczający z T3.3 (promienie w mm, X w programie to średnica). Numery = kroki przykładu. */
export function CompRun() {
  const R: [number, number, number, number] = [-59, 13, -2, 25];
  const m = mapper(R, [8, 8, 344, 150]);
  const pts: [number, number][] = [[2, 7], [-1, 10], [-20, 10], [-20, 14], [-21, 15], [-39, 15], [-40, 16], [-40, 17.5], [-40.5, 18], [-55, 18], [-55, 21]];
  const line = pts.map(([z, x]) => `${m.X(z)},${m.Y(x)}`).join(" ");
  const part = [[0, 0], [0, 9], ...pts.slice(1, 10), [-59, 18], [-59, 0]] as [number, number][];
  return (
    <Fig id="t41rn" code="G42 G40" title="Wałek: włączenie i wyłączenie korekcji" h={172} legend={["rap", "cut", "stock"]}
      notes={<><Code k="rap">1  G42 G00 X14. Z2.</Code><Code k="cut">2  G01 X20. Z-1. F0.1 … X42.</Code><Code k="rap">3  G40 G00 Z2.</Code></>}
      caption={<>Połowa przekroju wałka, X w górę jako promień. 1 — dojazd w powietrzu do X14 Z2: na tym ruchu sterowanie odsuwa naroże o rε od konturu. 2 — kontur z wymiarów rysunku, z fazami i dwoma promieniami przy stopniu; kończy go wyjście na X42, ponad detal. 3 — odjazd w Z z G40, nóż jest już w powietrzu.</>}>
      {(c) => (
        <g>
          <polygon points={part.map(([z, x]) => `${m.X(z)},${m.Y(x)}`).join(" ")} fill={c.hatch} className="p-con" />
          <line x1={m.X(-59)} y1={m.Y(0)} x2={m.X(13)} y2={m.Y(0)} className="p-cons" strokeDasharray="10 3 2 3" />
          <T x={m.X(12)} y={m.Y(0) - 4} anchor="end" cls="t-mut t-sm">oś</T>
          {/* 1: dojazd z G42 */}
          <line x1={m.X(6)} y1={m.Y(23)} x2={m.X(2)} y2={m.Y(7) - 4} className="p-rap thick" markerEnd={c.a("rap")} />
          <Pt x={m.X(2)} y={m.Y(7)} label="X14 Z2" pos="e" cls="t-mono t-sm" />
          <Step x={m.X(6) - 14} y={m.Y(17)} n={1} />
          {/* 2: kontur */}
          <polyline points={line} className="p-cut thick" fill="none" />
          <Step x={m.X(-10)} y={m.Y(10) - 14} n={2} />
          <T x={m.X(-55) + 4} y={m.Y(21) - 6} cls="t-mono t-sm">X42</T>
          {/* 3: odjazd z G40 */}
          <line x1={m.X(-55)} y1={m.Y(21)} x2={m.X(2) - 3} y2={m.Y(21)} className="p-rap thick" markerEnd={c.a("rap")} />
          <Step x={m.X(-25)} y={m.Y(21) - 12} n={3} />
          <T x={m.X(-25) + 12} y={m.Y(21) - 8} cls="t-rap t-b t-sm">G40</T>
          <T x={m.X(6) - 2} y={m.Y(23) - 6} anchor="end" cls="t-rap t-b t-sm">G42</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= T4.2: kierunki ostrza ================= */
export function TipDirections() {
  const cx = 130, cy = 110, d = 56;
  const pos: [number, number, string][] = [[1, 1, "1"], [-1, 1, "2"], [-1, -1, "3"], [1, -1, "4"], [1, 0, "5"], [0, 1, "6"], [-1, 0, "7"], [0, -1, "8"]];
  return (
    <Fig id="t42td" code="T1–9" title="Kierunek ostrza: gdzie leży P względem środka naroża" h={234} legend={["acc"]}
      notes={<><Code k="acc">nóż zewnętrzny → 3</Code><Code k="acc">wytaczak → 2</Code><Code k="con">0 lub 9 — środek naroża</Code></>}
      caption={<>Numer mówi sterowaniu, w którą stronę od środka naroża leży punkt P, do którego zmierzono nóż. Numery podaje się w układzie z rysunku: Z w prawo, X w górę.</>}>
      {() => (
        <g>
          <circle cx={cx} cy={cy} r={34} className="p-cons" style={{ fill: "none" }} />
          <line x1={cx - 80} y1={cy} x2={cx + 80} y2={cy} className="p-ext" />
          <line x1={cx} y1={cy - 80} x2={cx} y2={cy + 80} className="p-ext" />
          {pos.map(([z, x, n]) => {
            const on = n === "3" || n === "2";
            return (
              <g key={n}>
                <circle cx={cx + z * d} cy={cy - x * d} r={13} className={on ? "p-fill-acc" : "panel-bg"} style={{ stroke: on ? "var(--accent)" : "var(--ink-2)" }} />
                <text x={cx + z * d} y={cy - x * d + 4.5} textAnchor="middle" style={{ font: "700 13px var(--font-mono)", fill: on ? "var(--accent)" : "var(--ink)" }}>{n}</text>
              </g>
            );
          })}
          <text x={cx} y={cy + 4.5} textAnchor="middle" style={{ font: "700 12px var(--font-mono)", fill: "var(--muted)" }}>0/9</text>
          <T x={cx + 88} y={cy + 4} cls="t-mut">+Z</T>
          <T x={cx + 4} y={cy - 84} cls="t-mut">+X</T>
          <T x={262} y={70} cls="t-b">3 — zewnętrzny</T>
          <T x={262} y={84} cls="t-mut t-sm">P w dół i w lewo</T>
          <T x={262} y={112} cls="t-b">2 — wytaczak</T>
          <T x={262} y={126} cls="t-mut t-sm">P w górę i w lewo</T>
          <T x={262} y={154} cls="t-b">8 — P na dole</T>
          <T x={262} y={168} cls="t-mut t-sm">pośrodku naroża</T>
        </g>
      )}
    </Fig>
  );
}

export const t4Figs = {
  "t41-point": () => <NosePoint />,
  "t41-chamfer": () => <ChamferError />,
  "t41-sides": () => <LatheSides />,
  "t41-run": () => <CompRun />,
  "t42-tips": () => <TipDirections />,
};
