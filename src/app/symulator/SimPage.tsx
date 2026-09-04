"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Simulator, { type SimMode } from "@/components/simulator/Simulator";

const Sim3D = dynamic(() => import("@/components/simulator/Sim3D"), { ssr: false, loading: () => <div className="sim-canvas" style={{ height: 380 }} /> });

const EXAMPLES: Record<string, { mode: SimMode; src: string }> = {
  "Kontur z łukami (frez)": { mode: "mill", src: `G21 G90 G17 G54\nS1500 M03\nG00 X-10 Y-10 Z5\nG01 Z-2 F100\nG01 X0 Y0 F250\nG01 X50\nG02 X70 Y20 I0 J20\nG01 Y40\nG03 X50 Y60 R20\nG01 X0\nG01 Y0\nG00 Z5\nM30` },
  "Kieszeń przyrostowo G91": { mode: "mill", src: `G21 G90 G17 G54\nG00 X10 Y10 Z5\nG01 Z-1 F80\nG91\nG01 X30 F200\nG01 Y20\nG01 X-30\nG01 Y-20\nG01 X5 Y5\nG01 X20\nG01 Y10\nG01 X-20\nG01 Y-10\nG90\nG00 Z5\nM30` },
  "Otwory (frez)": { mode: "mill", src: `G21 G90 G17 G54\nS2000 M03\nG00 X10 Y10 Z5\nG01 Z-12 F100\nG00 Z2\nG00 X40 Y10\nG01 Z-12\nG00 Z2\nG00 X40 Y30\nG01 Z-12\nG00 Z2\nG00 X10 Y30\nG01 Z-12\nG00 Z10\nM30` },
  "Wałek ze stopniem (tokarka)": { mode: "lathe", src: `G21 G90 G18 G95\nG50 S3000\nG97 S1200 M03\nG00 X62 Z2\nG96 S200\nG01 X40 F0.3\nG01 Z-20\nG02 X50 Z-25 R5\nG01 Z-45\nG01 X62\nG00 Z2\nM30` },
  "Wałek z fazą i zaokrągleniem (tokarka)": { mode: "lathe", src: `G21 G90 G18 G95\nG50 S3000\nG97 S1500 M03\nG00 X50 Z2\nG96 S220\nG01 X26 F0.25\nG01 X30 Z0\nG01 Z-15\nG02 X40 Z-20 R5\nG01 Z-35\nG01 X44\nG01 X48 Z-37\nG00 X50 Z2\nM30` },
};

export default function SimPage() {
  const first = Object.keys(EXAMPLES)[0];
  const [name, setName] = useState(first);
  const [src, setSrc] = useState(EXAMPLES[first].src);
  const [mode, setMode] = useState<SimMode>(EXAMPLES[first].mode);
  const [show3d, setShow3d] = useState(false);
  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-3xl font-bold">Symulator</h1>
        <p className="text-muted">W trybie toczenia X jest średnicą (jak w Fanuc). Wpisz program, uruchom, krokuj. Każda linia jest tłumaczona na polski, a błędy podświetlane na czerwono.</p>
      </div>
      <div className="filters">
        <select className="border border-line rounded px-2 py-1 bg-white text-sm" value={name} onChange={(e) => { const n = e.target.value; setName(n); setSrc(EXAMPLES[n].src); setMode(EXAMPLES[n].mode); }}>
          {Object.keys(EXAMPLES).map((k) => <option key={k}>{k}</option>)}
        </select>
        <button aria-pressed={mode === "mill"} onClick={() => setMode("mill")}>Frezowanie (XY)</button>
        <button aria-pressed={mode === "lathe"} onClick={() => setMode("lathe")}>Toczenie (ZX)</button>
      </div>
      <Simulator source={src} onSourceChange={setSrc} mode={mode} />
      <div className="filters"><button aria-pressed={show3d} onClick={() => setShow3d((v) => !v)}>{show3d ? "Ukryj widok 3D" : "Pokaż widok 3D (beta)"}</button></div>
      {show3d && <Sim3D source={src} mode={mode} />}
      <div className="legend"><span><i style={{ background: "var(--amber)" }} />G00</span><span><i style={{ background: "var(--green)" }} />G01</span><span><i style={{ background: "var(--blue)" }} />G02/G03</span></div>
    </div>
  );
}
