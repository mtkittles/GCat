import { Code, Fig, mapper, T } from "@/components/fig";

/* Rysunki modułu T8 — podprogramy na tokarce. */

/* ================= T8.1: trzy rowki jednym podprogramem ================= */
export function ThreeGrooves() {
  const R: [number, number, number, number] = [-46, 6, 9, 19];
  const m = mapper(R, [10, 6, 340, 190]);
  const zs = [-10, -20, -30];
  return (
    <Fig id="t81gr" code="M98 L3" title="Trzy rowki: ten sam podprogram, przesunięcie W−10" h={214} legend={["cut", "rap", "stock"]}
      notes={<><Code k="con">M98 P3000 L3</Code><Code k="cut">G01 X26. F0.05</Code><Code k="rap">G00 X34. → W-10.</Code></>}
      caption={<>Podprogram wcina rowek w miejscu, w którym stoi nóż, wycofuje go i przesuwa o W−10 — przyrostowo, bez G91. Wywołany trzy razy z Z−10 robi rowki w Z−10, Z−20 i Z−30.</>}>
      {(c) => (
        <g>
          <polygon points={[[0, 15], ...zs.flatMap((z) => [[z + 3, 15], [z + 3, 13], [z, 13], [z, 15]]), [-44, 15], [-44, 9], [0, 9]].map(([z, r]) => `${m.X(z)},${m.Y(r)}`).join(" ")} fill={c.hatch} className="p-con" />
          {zs.map((z, i) => (
            <g key={z}>
              <line x1={m.X(z + 1.5)} y1={m.Y(17)} x2={m.X(z + 1.5)} y2={m.Y(13) - 3} className="p-cut thick" markerEnd={c.a("cut")} />
              <line x1={m.X(z + 0.6)} y1={m.Y(13)} x2={m.X(z + 0.6)} y2={m.Y(17) + 3} className="p-rap" markerEnd={c.a("rap")} />
              {i < 2 && <line x1={m.X(z + 1.5)} y1={m.Y(17.6)} x2={m.X(z - 8.5) + 3} y2={m.Y(17.6)} className="p-rap" markerEnd={c.a("rap")} />}
              <T x={m.X(z + 1.5)} y={m.Y(12.3) + 10} anchor="middle" cls="t-mono t-sm">{`Z${z}`.replace("-", "−")}</T>
            </g>
          ))}
          <T x={m.X(-15)} y={m.Y(18.4)} anchor="middle" cls="t-rap t-sm t-b">W−10</T>
          <T x={m.X(-40)} y={m.Y(12)} cls="t-mut t-sm">wałek Ø30</T>
        </g>
      )}
    </Fig>
  );
}

export const t8Figs = {
  "t81-grooves": () => <ThreeGrooves />,
};
