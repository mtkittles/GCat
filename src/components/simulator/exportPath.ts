import { pointAt, type Segment, type Vec3 } from "@/lib/parser";

/*
  Eksport toru z symulatora 2D: SVG w jednostkach milimetrowych (1 mm = 1 px),
  z osią Y skierowaną w górę jak na rysunku. Łuki są próbkowane, żeby plik otwierał się
  wszędzie bez interpretowania flag łuków.
*/
const COLOR: Record<Segment["kind"], string> = { rapid: "#F59E0B", linear: "#22C55E", arc: "#38BDF8", dwell: "#F97316" };

export function pathToSvg(segments: Segment[], mode: "mill" | "lathe", title = "GCat"): string {
  const [ha, va]: [keyof Vec3, keyof Vec3] = mode === "mill" ? ["x", "y"] : ["z", "x"];
  const pts: { x: number; y: number }[] = [];
  const paths: string[] = [];
  for (const sg of segments) {
    if (sg.kind === "dwell") continue;
    const n = sg.kind === "arc" ? 48 : 1;
    const d: string[] = [];
    for (let i = 0; i <= n; i++) {
      const p = pointAt(sg, i / n);
      const x = p[ha], y = p[va];
      pts.push({ x, y });
      d.push(`${i ? "L" : "M"}${x.toFixed(3)} ${(-y).toFixed(3)}`);
    }
    paths.push(`<path d="${d.join(" ")}" stroke="${COLOR[sg.kind]}"${sg.kind === "rapid" ? ' stroke-dasharray="2 1.5"' : ""}/>`);
  }
  if (!pts.length) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><title>${title}</title></svg>`;
  const minX = Math.min(...pts.map((p) => p.x)) - 5, maxX = Math.max(...pts.map((p) => p.x)) + 5;
  const minY = Math.min(...pts.map((p) => p.y)) - 5, maxY = Math.max(...pts.map((p) => p.y)) + 5;
  const w = maxX - minX, h = maxY - minY;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX.toFixed(3)} ${(-maxY).toFixed(3)} ${w.toFixed(3)} ${h.toFixed(3)}" width="${w.toFixed(1)}mm" height="${h.toFixed(1)}mm">
<title>${title}</title>
<desc>Tor narzędzia z symulatora GCat. Jednostki: mm. Osie: ${mode === "mill" ? "X w prawo, Y w górę" : "Z w prawo, X (promień) w górę"}.</desc>
<g fill="none" stroke-width="0.4" stroke-linecap="round" stroke-linejoin="round">
${paths.join("\n")}
</g>
</svg>
`;
}

export function download(name: string, data: Blob | string, type = "text/plain;charset=utf-8") {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
