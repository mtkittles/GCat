import { Code, Fig, mapper, Pt, Step, T } from "@/components/fig";

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


/* ================= T8.1: przykład — licznik przebiegów i pozycja końcowa ================= */
export function GrooveCount() {
  const R: [number, number, number, number] = [-48, 4, 8, 21];
  const m = mapper(R, [10, 4, 340, 100]);
  const zs = [-10, -20, -30];
  return (
    <Fig id="t81ct" code="L3" title="M98 P3000 L3: trzy przebiegi i gdzie zostaje nóż" h={112} legend={["cut", "rap", "acc", "stock"]}
      notes={<><Code k="con">1  G00 X34. Z-10.</Code><Code k="cut">2  O3000: G01 X26. → G00 X34. → W-10.</Code><Code k="con">3  M99 · 4  M98 P3000 L3</Code></>}
      caption={<>Nad każdym rowkiem — numer przebiegu podprogramu. Każdy przebieg kończy się przesunięciem W−10, także ostatni: po trzecim przebiegu nóż stoi w Z−40, nad pełnym materiałem, a nie nad trzecim rowkiem. Numery w kółkach odpowiadają krokom przykładu.</>}>
      {(c) => (
        <g>
          <polygon points={[[0, 15], ...zs.flatMap((z) => [[z + 3, 15], [z + 3, 13], [z, 13], [z, 15]]), [-46, 15], [-46, 9], [0, 9]].map(([z, r]) => `${m.X(z)},${m.Y(r)}`).join(" ")} fill={c.hatch} className="p-con" />
          {zs.map((z, i) => (
            <g key={z}>
              <line x1={m.X(z + 1.5)} y1={m.Y(17)} x2={m.X(z + 1.5)} y2={m.Y(13) - 3} className="p-cut thick" markerEnd={c.a("cut")} />
              <line x1={m.X(z + 0.6)} y1={m.Y(13)} x2={m.X(z + 0.6)} y2={m.Y(17) + 3} className="p-rap" markerEnd={c.a("rap")} />
              <line x1={m.X(z + 0.6)} y1={m.Y(17.6)} x2={m.X(z - 9.4) + 3} y2={m.Y(17.6)} className={i === 2 ? "p-acc thick" : "p-rap"} markerEnd={c.a(i === 2 ? "acc" : "rap")} />
              <T x={m.X(z + 1.5)} y={m.Y(19.4)} anchor="middle" cls="t-mono t-b t-sm">{`${i + 1}/3`}</T>
              <T x={m.X(z + 1.5)} y={m.Y(12.3) + 10} anchor="middle" cls="t-mono t-sm">{`Z${z}`.replace("-", "−")}</T>
            </g>
          ))}
          <Pt x={m.X(-10) + 0} y={m.Y(17)} dot="pt-rap" />
          <Step x={m.X(-6)} y={m.Y(17.2)} n={1} />
          <Step x={m.X(-12.5)} y={m.Y(14.6)} n={2} />
          <Step x={m.X(-15)} y={m.Y(19.4)} n={3} />
          <Pt x={m.X(-40)} y={m.Y(17.6)} label="po L3: Z−40" pos="n" cls="t-mono t-acc t-b t-sm" dot="pt-rap" />
          <Step x={m.X(-44)} y={m.Y(17.6)} n={4} />
          <T x={m.X(-40)} y={m.Y(11)} anchor="middle" cls="t-mut t-sm">wałek Ø30</T>
        </g>
      )}
    </Fig>
  );
}

export const t8Figs = {
  "t81-grooves": () => <ThreeGrooves />,
  "t81-count": () => <GrooveCount />,
};
