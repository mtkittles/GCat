import type { ReactNode } from "react";
import { Dim, Fig, T } from "@/components/fig";

/*
  Rysunki działu Płytki ISO (V3.2…) — styl jak figs-noze.tsx: szerokość 360, płytka w szarościach,
  wymiar z oznaczenia kolorem parametru. Proporcje poglądowe.
*/

const rad = (d: number) => (d * Math.PI) / 180;

/* ================= wymiary płytki z oznaczenia: d, l, rε (z góry), s i α (przekrój) ================= */
export function InsertDims() {
  const cx = 104, cy = 108, d = 92, eps = 80;
  const r = d / 2, dA = r / Math.sin(rad(eps / 2)), dO = r / Math.cos(rad(eps / 2));
  const L: [number, number] = [cx - dA, cy], U: [number, number] = [cx, cy - dO], Rr: [number, number] = [cx + dA, cy], D: [number, number] = [cx, cy + dO];
  // przekrój płytki pozytywowej (kąt przyłożenia α)
  const x0 = 244, x1 = 344, y0 = 92, s = 24, al = 11, off = Math.tan(rad(al)) * s * 2.2;
  return (
    <Fig id="tpw" code="ISO 1832" title="Wymiary płytki w oznaczeniu" h={226}
      legend={[["acc", "wymiar z oznaczenia"], ["cons", "okrąg wpisany"]]}
      caption={<>Z lewej płytka rombowa 80° z góry, z prawej przekrój płytki pozytywowej; proporcje poglądowe.</>}>
      {(c) => (
        <g>
          <path d={`M ${L.join(" ")} L ${U.join(" ")} L ${Rr.join(" ")} L ${D.join(" ")} Z`} className="cutter" />
          <circle cx={cx} cy={cy} r={r} className="p-cons" fill="none" />
          {/* d — średnica okręgu wpisanego */}
          <Dim c={c} x1={cx} y1={cy - r} x2={cx} y2={cy + r} label="d" lside={1} />
          {/* l — długość krawędzi (L → U) */}
          <line x1={L[0]} y1={L[1]} x2={U[0]} y2={U[1]} className="p-acc thick" />
          <T x={(L[0] + U[0]) / 2 - 12} y={(L[1] + U[1]) / 2 - 6} anchor="middle" cls="t-acc t-b">l</T>
          {/* rε i kąt naroża ε */}
          <circle cx={L[0] + 3} cy={L[1]} r={8} className="p-acc" fill="none" />
          <T x={L[0] - 4} y={L[1] + 24} anchor="middle" cls="t-acc t-b">rε</T>
          <T x={L[0] + 16} y={L[1] + 4} cls="t-sm t-mut">ε = 80°</T>
          <T x={12} y={16} cls="t-sm t-mut">widok z góry</T>
          {/* przekrój */}
          <T x={x0} y={16} cls="t-sm t-mut">przekrój</T>
          <path d={`M ${x0} ${y0} L ${x1} ${y0} L ${x1 - off} ${y0 + s} L ${x0 + off} ${y0 + s} Z`} className="cutter" />
          <line x1={x0} y1={y0} x2={x0 + off} y2={y0 + s} className="p-acc thick" />
          <line x1={x0} y1={y0} x2={x0} y2={y0 + s + 22} className="p-cons" />
          <T x={x0 + 4} y={y0 + s + 34} cls="t-acc t-b">α</T>
          <Dim c={c} x1={x1 + 6} y1={y0} x2={x1 + 6} y2={y0 + s} label="s" lside={1} />
          <line x1={x1 - 12} y1={y0} x2={x1 + 10} y2={y0} className="p-ext" />
          <line x1={x1 - off} y1={y0 + s} x2={x1 + 10} y2={y0 + s} className="p-ext" />
        </g>
      )}
    </Fig>
  );
}


/* ================= kształty płytek: kąt naroża od wytrzymałości do dostępu ================= */
export function InsertShapes() {
  const items: { l: string; a: number; n: number }[] = [
    { l: "R", a: 0, n: 0 }, { l: "S", a: 90, n: 4 }, { l: "C", a: 80, n: 2 }, { l: "W", a: 80, n: 3 },
    { l: "T", a: 60, n: 3 }, { l: "D", a: 55, n: 2 }, { l: "V", a: 35, n: 2 },
  ];
  const r = 15, y = 70;
  const shape = (l: string, a: number, cx: number) => {
    if (l === "R") return <circle cx={cx} cy={y} r={r} className="cutter" />;
    let pts: [number, number][];
    if (l === "S") pts = [0, 1, 2, 3].map((i) => [cx + r * Math.SQRT2 * Math.cos(rad(180 + 90 * i)), y - r * Math.SQRT2 * Math.sin(rad(180 + 90 * i))]);
    else if (l === "T") pts = [0, 1, 2].map((i) => [cx + 4 + 1.45 * r * Math.cos(rad(180 + 120 * i)), y - 1.45 * r * Math.sin(rad(180 + 120 * i))]);
    else if (l === "W") pts = Array.from({ length: 6 }, (_, i) => { const R = i % 2 ? r * 0.92 : r * 1.3; return [cx + R * Math.cos(rad(180 + 60 * i)), y - R * Math.sin(rad(180 + 60 * i))] as [number, number]; });
    else { const dA = r / Math.sin(rad(a / 2)), dO = r / Math.cos(rad(a / 2)), k = Math.min(1, 24 / dA); pts = [[cx - dA * k, y], [cx, y - dO * k], [cx + dA * k, y], [cx, y + dO * k]]; }
    return <path d={`M ${pts.map((q) => q.map((v) => v.toFixed(1)).join(" ")).join(" L ")} Z`} className="cutter" />;
  };
  return (
    <Fig id="tpk" code="kształt" title="Kształt płytki i kąt naroża" h={170}
      legend={[["acc", "kierunek zmiany cechy"]]}
      caption={<>Płytki uszeregowane od największego do najmniejszego kąta naroża; proporcje poglądowe.</>}>
      {(c) => (
        <g>
          {items.map((it, i) => {
            const cx = 30 + i * 50;
            return (
              <g key={it.l}>
                {shape(it.l, it.a, cx)}
                <T x={cx} y={y + 44} anchor="middle" cls="t-b">{it.l}</T>
                <T x={cx} y={y + 60} anchor="middle" cls="t-sm t-mut">{it.a ? `${it.a}°` : "okrągła"}</T>
              </g>
            );
          })}
          <line x1={170} y1={22} x2={20} y2={22} className="p-acc" markerEnd={c.a("acc")} />
          <T x={20} y={14} cls="t-sm t-acc">mocniejsze ostrze</T>
          <line x1={190} y1={22} x2={340} y2={22} className="p-acc" markerEnd={c.a("acc")} />
          <T x={340} y={14} anchor="end" cls="t-sm t-acc">lepszy dostęp, mniej drgań</T>
        </g>
      )}
    </Fig>
  );
}

/* ================= promień naroża a nierówności: ten sam posuw, dwa promienie ================= */
export function NoseScallops() {
  const f = 56, n = 6, x0 = 12;
  const row = (rr: number, yb: number, label: string) => {
    // łuki naroża co f; h = r - sqrt(r² - (f/2)²)
    const h = rr - Math.sqrt(rr * rr - (f / 2) * (f / 2));
    const d = `M ${x0} ${yb - h} ` + Array.from({ length: n }, (_, i) => `A ${rr} ${rr} 0 0 0 ${x0 + (i + 1) * f} ${yb - h}`).join(" ");
    return { h, d, yb, label };
  };
  const a = row(34, 76, "mały rε"), b = row(120, 156, "duży rε");
  const xc = x0 + 3 * f;
  return (
    <Fig id="tpn" code="rε" title="Promień naroża a wysokość nierówności" h={196}
      legend={[["acc", "teoretyczna wysokość nierówności h"], "stock", "dim"]}
      caption={<>Ślady naroża przy tym samym posuwie f: większy promień zostawia niższe nierówności.</>}>
      {(c) => (
        <g>
          {[a, b].map((r) => (
            <g key={r.label}>
              <T x={x0} y={r.yb - r.h - 10} cls="t-sm t-mut">{r.label}</T>
              <path d={`${r.d} L ${x0 + n * f} ${r.yb + 20} L ${x0} ${r.yb + 20} Z`} fill={c.hatch} className="p-con" />
              <line x1={xc - 18} y1={r.yb - r.h} x2={xc + 40} y2={r.yb - r.h} className="p-ext" />
              <line x1={xc - f / 2} y1={r.yb} x2={xc + 40} y2={r.yb} className="p-ext" />
              <line x1={xc + 34} y1={r.yb - r.h} x2={xc + 34} y2={r.yb} className="p-acc thick" />
              <T x={xc + 42} y={r.yb - r.h / 2 + 4} cls="t-acc t-b">h</T>
            </g>
          ))}
          <Dim c={c} x1={x0 + f} y1={a.yb - a.h - 26} x2={x0 + 2 * f} y2={a.yb - a.h - 26} label="f" lside={-1} />
        </g>
      )}
    </Fig>
  );
}

/* ================= kc1 w grupach materiałowych: zakresy z tabeli ISCAR (DIN/ISO 513, VDI 3323) ================= */
export function GroupKc() {
  const rows: { g: string; n: string; a: number; b: number }[] = [
    { g: "P", n: "stal", a: 1350, b: 2500 },
    { g: "M", n: "nierdzewna", a: 1875, b: 2150 },
    { g: "K", n: "żeliwo", a: 1150, b: 1420 },
    { g: "N", n: "nieżelazne", a: 700, b: 800 },
    { g: "S", n: "żaroodporne, Ti", a: 1700, b: 3300 },
    { g: "H", n: "hartowane", a: 4500, b: 4700 },
  ];
  const x0 = 104, x1 = 344, max = 5000, sx = (v: number) => x0 + ((x1 - x0) * v) / max, y0 = 34, dy = 26;
  return (
    <Fig id="tgk" code="kc1" title="Właściwa siła skrawania w grupach materiałów" h={222}
      legend={[["acc", "zakres kc1 w grupie"]]}
      caption={<>Dolna i górna wartość kc1 w każdej grupie według tabeli ISCAR; kc1 dla wióra 1 mm × 1 mm.</>}>
      {() => (
        <g>
          {[0, 1000, 2000, 3000, 4000, 5000].map((v) => (
            <g key={v}>
              <line x1={sx(v)} y1={y0 - 10} x2={sx(v)} y2={y0 + dy * rows.length - 8} className="p-ext" />
              <T x={sx(v)} y={y0 + dy * rows.length + 6} anchor="middle" cls="t-sm t-mut">{v}</T>
            </g>
          ))}
          <T x={x1} y={y0 + dy * rows.length + 22} anchor="end" cls="t-sm t-mut">kc1 [N/mm²]</T>
          {rows.map((r, i) => {
            const y = y0 + i * dy;
            return (
              <g key={r.g}>
                <T x={12} y={y + 4} cls="t-b">{r.g}</T>
                <T x={28} y={y + 4} cls="t-sm t-mut">{r.n}</T>
                <rect x={sx(r.a)} y={y - 6} width={Math.max(6, sx(r.b) - sx(r.a))} height={12} className="holder" />
                <line x1={sx(r.a) + 1} y1={y} x2={sx(r.a) + Math.max(5, sx(r.b) - sx(r.a)) - 1} y2={y} className="p-acc thick" />
              </g>
            );
          })}
        </g>
      )}
    </Fig>
  );
}

/* ================= grupy zastosowań 01…50: odporność na ścieranie a ciągliwość (ISO 513) ================= */
export function ApplicationScale() {
  const x0 = 30, x1 = 330, y = 82, nums = ["01", "10", "20", "30", "40", "50"];
  const sx = (i: number) => x0 + ((x1 - x0) * i) / (nums.length - 1);
  return (
    <Fig id="tgs" code="P01…P50" title="Numer grupy zastosowania" h={128}
      legend={[["acc", "kierunek zmiany cechy"]]}
      caption={<>Przykład dla grupy P (od P01 do P50); w innych grupach skala kończy się na innym numerze, np. M40.</>}>
      {(c) => (
        <g>
          <line x1={x0} y1={y} x2={x1} y2={y} className="p-con" />
          {nums.map((n, i) => (
            <g key={n}>
              <line x1={sx(i)} y1={y - 6} x2={sx(i)} y2={y + 6} className="p-con" />
              <T x={sx(i)} y={y + 22} anchor="middle" cls="t-sm">{`P${n}`}</T>
            </g>
          ))}
          <line x1={170} y1={40} x2={x0} y2={40} className="p-acc" markerEnd={c.a("acc")} />
          <T x={x0} y={30} cls="t-sm t-acc">odporność na ścieranie</T>
          <line x1={190} y1={40} x2={x1} y2={40} className="p-acc" markerEnd={c.a("acc")} />
          <T x={x1} y={30} anchor="end" cls="t-sm t-acc">ciągliwość</T>
        </g>
      )}
    </Fig>
  );
}

export const plytkiFigs: Record<string, () => ReactNode> = {
  "tech-plytka-wymiary": () => <InsertDims />,
  "tech-plytki-ksztalty": () => <InsertShapes />,
  "tech-naroze-nierownosci": () => <NoseScallops />,
  "tech-grupy-kc": () => <GroupKc />,
  "tech-grupy-zastosowan": () => <ApplicationScale />,
};
