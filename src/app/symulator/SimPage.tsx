"use client";
import { useEffect, useState } from "react";
import { loadActiveId, loadPrograms, newId, saveActiveId, savePrograms, type StoredProgram } from "./programs";
import PageBanner from "@/components/ui/PageBanner";
import Simulator, { type Dialect, type SimMode } from "@/components/simulator/Simulator";

const EXAMPLES: Record<string, { mode: SimMode; src: string; stock?: { x: number; y: number; z: number; ox: number; oy: number; oz: number } }> = {
  "Kontur z łukami (frez)": { mode: "mill", src: `G21 G90 G17 G54\nS1500 M03\nG00 X0 Y0 Z5\nG01 Z-2 F100\nG01 X50 F250\nG02 X70 Y20 I0 J20\nG01 Y40\nG03 X50 Y60 R20\nG01 X0\nG01 Y0\nG00 Z5\nM30` },

  "Korpus — pełna obróbka 4 narzędziami": { mode: "mill", stock: { x: 120, y: 80, z: 25, ox: 0, oy: 0, oz: 25 }, src: `O0600 (KORPUS 120x80x25)
(POLFABRYKAT 120 x 80 x 25, ZERO: LEWY DOLNY NAROZNIK, Z NA GORZE)
G21 G90 G17 G54 G40 G49 G80

(T01 GLOWICA 50 - PLANOWANIE CZOLA)
T01 M06
G43 H01 Z50
S1600 M03
M08
G00 X-32 Y18
G00 Z2
G01 Z-1 F150
G01 X152 F900
G01 Y42
G01 X-32
G01 Y62
G01 X152
G00 Z50
M09
M05

(T02 FREZ WALCOWY 16 - KIESZEN 64x24 W 3 PRZEJSCIACH PO 3MM)
(TOR SRODKA ODSUNIETY O PROMIEN 8 OD SCIANEK KIESZENI)
T02 M06
G43 H02 Z50
S2000 M03
M08
G00 X28 Y28
G00 Z2
G01 Z-4 F150
G01 X92 F450
G01 Y52
G01 X28
G01 Y28
G01 X38 Y38
G01 X82
G01 Y42
G01 X38
G01 Y38
G00 Z2
G00 X28 Y28
G01 Z-7 F150
G01 X92 F450
G01 Y52
G01 X28
G01 Y28
G01 X38 Y38
G01 X82
G01 Y42
G01 X38
G01 Y38
G00 Z2
G00 X28 Y28
G01 Z-10 F150
G01 X92 F450
G01 Y52
G01 X28
G01 Y28
G01 X38 Y38
G01 X82
G01 Y42
G01 X38
G01 Y38
G00 Z50
M09
M05

(T03 FREZ KULISTY 10 - FASOLKA ZAOKRAGLONA)
T03 M06
G43 H03 Z50
S3200 M03
M08
G00 X26 Y66
G00 Z2
G01 Z-3 F200
G01 X94 F350
G03 X94 Y72 I0 J3
G01 X26
G03 X26 Y66 I0 J-3
G01 Z-5 F200
G01 X94
G03 X94 Y72 I0 J3
G01 X26
G03 X26 Y66 I0 J-3
G00 Z50
M09
M05

(T04 WIERTLO 10 - 4 OTWORY PRZELOTOWE)
T04 M06
G43 H04 Z50
S1100 M03
M08
G99 G83 X15 Y15 Z-28 R2 Q7 F120
X105
Y65
X15
G80
G00 Z50
M09
M05

G91 G28 Z0
G90
M30` },
  "Płytka — 3 narzędzia, cykle": { mode: "mill", stock: { x: 90, y: 60, z: 25, ox: 0, oy: 0, oz: 25 }, src: `O0200 (PLYTKA 90x60x20)
G21 G90 G17 G54 G40 G49 G80
(T01 FREZ WALCOWY 12 — KONTUR)
T01 M06
G43 H01 Z50
S2200 M03
M08
G00 X-18 Y-18
G00 Z2
G01 Z-4 F120
G41 D01 X0 Y0 F450
G01 X80
G01 Y50
G01 X0
G01 Y0
G40 X-18 Y-18
G00 Z50
M09
M05
(T02 WIERTLO 8.5 — 4 OTWORY POD M10)
T02 M06
G43 H02 Z50
S1200 M03
M08
G99 G83 X15 Y15 Z-24 R2 Q6 F110
X65
Y35
X15
G80
G00 Z50
M09
M05
(T03 GWINTOWNIK M10x1.5)
T03 M06
G43 H03 Z50
S400 M03
G99 G84 X15 Y15 Z-18 R5 F600
X65
Y35
X15
G80
G00 Z50
M05
G91 G28 Z0
G90
M30` },

  "Korpus — 4 narzędzia": { mode: "mill", src: `O0300 (KORPUS)
G21 G90 G17 G54 G40 G49 G80
(T01 GLOWICA 50 — PLANOWANIE)
T01 M06
G43 H01 Z50
S1600 M03
M08
G00 X-30 Y15
G00 Z2
G01 Z-1 F150
G01 X130 F800
G01 Y45
G01 X-30
G00 Z50
M09
M05
(T02 FREZ 16 — KIESZEN)
T02 M06
G43 H02 Z50
S2000 M03
M08
G00 X30 Y30
G00 Z2
G01 Z-3 F120
G01 X70 F400
G01 Y40
G01 X30
G01 Y20
G01 X70
G00 Z50
M09
M05
(T03 NAWIERTAK)
T03 M06
G43 H03 Z50
S2500 M03
M08
G99 G82 X20 Y20 Z-3 R2 P300 F150
X90
Y45
X20
G80
G00 Z50
M09
M05
(T04 WIERTLO 10 — PRZELOTOWE)
T04 M06
G43 H04 Z50
S1100 M03
M08
G99 G83 X20 Y20 Z-28 R2 Q7 F120
X90
Y45
X20
G80
G00 Z50
M09
M05
G91 G28 Z0
G90
M30` },

  "Wiercenie głębokie G83 vs G73": { mode: "mill", src: `G21 G90 G17 G54 G80
S1200 M03
T01 M06
G43 H01 Z50
G00 X20 Y20 Z10
M08
(G83 — pelne wycofanie do R po kazdym Q)
G99 G83 X20 Y20 Z-40 R2 Q5 F100
G80
(G73 — krotkie wycofanie, szybciej)
G99 G73 X60 Y20 Z-40 R2 Q5 F100
G80
G00 Z50
M09
M30` },

  "Kompensacja G41 — tor rzeczywisty": { mode: "mill", stock: { x: 90, y: 60, z: 20, ox: 0, oy: 0, oz: 20 }, src: `G21 G90 G17 G54 G40
T01 M06
G43 H01 Z50
S2400 M03
M08
G00 X-25 Y-25
G00 Z2
G01 Z-4 F120
G41 D1 X0 Y0 F400
G01 Y50
G01 X80
G01 Y0
G01 X0
G40 X-25 Y-25
G00 Z50
M09
M05
M30` },

  "Obrót układu G68": { mode: "mill", stock: { x: 120, y: 100, z: 20, ox: 60, oy: 50, oz: 20 }, src: `G21 G90 G17 G54
T01 M06
G43 H01 Z50
S2600 M03
G68 X0 Y0 R0
G00 X20 Y-6
G00 Z2
G01 Z-3 F120
G01 X40 F400
G01 Y6
G01 X20
G01 Y-6
G00 Z5
G69
G68 X0 Y0 R120
G00 X20 Y-6
G00 Z2
G01 Z-3 F120
G01 X40 F400
G01 Y6
G01 X20
G01 Y-6
G00 Z5
G69
G68 X0 Y0 R240
G00 X20 Y-6
G00 Z2
G01 Z-3 F120
G01 X40 F400
G01 Y6
G01 X20
G01 Y-6
G00 Z50
G69
M30` },

  "Kieszeń przyrostowo G91": { mode: "mill", src: `G21 G90 G17 G54\nS2000 M03\nG00 X10 Y10 Z5\nG01 Z-1 F80\nG91\nG01 X30 F200\nG01 Y20\nG01 X-30\nG01 Y-20\nG01 X5 Y5\nG01 X20\nG01 Y10\nG01 X-20\nG01 Y-10\nG90\nG00 Z5\nM30` },

  "Wałek ze stopniem (tokarka)": { mode: "lathe", src: `G21 G90 G18 G95\nG50 S3000\nG97 S1200 M03\nG00 X62 Z2\nG96 S200\nG01 X40 F0.3\nG01 Z-20\nG02 X50 Z-25 R5\nG01 Z-45\nG01 X62\nG00 Z2\nM30` },

  "Wałek z fazą i zaokrągleniem (tokarka)": { mode: "lathe", src: `G21 G90 G18 G95\nG50 S3000\nG97 S1500 M03\nG00 X50 Z2\nG96 S220\nG01 X26 F0.25\nG01 X30 Z0\nG01 Z-15\nG02 X40 Z-20 R5\nG01 Z-35\nG01 X44\nG01 X48 Z-37\nG00 X50 Z2\nM30` },

  "Tokarka — 3 narzędzia": { mode: "lathe", src: `O0400 (WALEK 3 NARZEDZIA)
G21 G90 G18 G95
G50 S2800
(T01 NOZ ZGRUBNY)
T01 M06
G97 S1200 M03
M08
G00 X62 Z2
G96 S200
G01 X54 F0.3
G01 Z-55
G00 X64
G00 Z2
G01 X46
G01 Z-55
G00 X64
G00 Z2
G01 X40
G01 Z-30
G00 X64
G00 Z2
(T02 NOZ WYKANCZAJACY)
T02 M06
G97 S1600 M03
G00 X36 Z2
G96 S250
G01 X38 Z0 F0.12
G01 X38 Z-30
G02 X44 Z-33 R3
G01 X44 Z-55
G01 X62
G00 Z2
(T03 NOZ DO ROWKOW)
T03 M06
G97 S900 M03
G00 X46 Z-25
G01 X34 F0.08
G00 X46
G00 Z2
M09
M05
M30` },
};

export default function SimPage() {
  const first = Object.keys(EXAMPLES)[0];
  const [name, setName] = useState(first);
  const [src, setSrc] = useState(EXAMPLES[first].src);
  const [mode, setMode] = useState<SimMode>(EXAMPLES[first].mode);
  const [stock, setStock] = useState(EXAMPLES[first].stock);
  const [dialect, setDialect] = useState<Dialect>("fanuc");

  // --- zakładki programów zapisywane w przeglądarce ---
  const [tabs, setTabs] = useState<StoredProgram[]>([]);
  const [active, setActive] = useState<string | null>(null);

  // Odtworzenie zapisanych programów przy pierwszym renderze po stronie klienta.
  const [restored, setRestored] = useState(false);
  if (typeof window !== "undefined" && !restored) {
    setRestored(true);
    const list = loadPrograms();
    if (list.length) {
      const id = loadActiveId() ?? list[0].id;
      const cur = list.find((t) => t.id === id) ?? list[0];
      setTabs(list); setActive(cur.id); setSrc(cur.src); setMode(cur.mode); setStock(undefined); setName(cur.name);
    }
  }

  // zapis bieżącego programu z opóźnieniem, żeby nie pisać przy każdym znaku
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      setTabs((prev) => {
        const next = prev.map((p) => (p.id === active ? { ...p, src, mode, updated: Date.now() } : p));
        savePrograms(next);
        return next;
      });
    }, 700);
    return () => clearTimeout(t);
  }, [src, mode, active]);

  const openTab = (t: StoredProgram) => {
    setActive(t.id); saveActiveId(t.id);
    setSrc(t.src); setMode(t.mode); setStock(undefined); setName(t.name);
  };

  const addTab = (from?: { name: string; src: string; mode: SimMode }) => {
    const t: StoredProgram = {
      id: newId(),
      name: from?.name ?? `Program ${tabs.length + 1}`,
      src: from?.src ?? "G21 G90 G17 G54\nS1500 M03\nG00 X0 Y0 Z5\n\nM30",
      mode: from?.mode ?? mode,
      updated: Date.now(),
    };
    const next = [...tabs, t];
    setTabs(next); savePrograms(next); openTab(t);
  };

  const closeTab = (id: string) => {
    const next = tabs.filter((t) => t.id !== id);
    setTabs(next); savePrograms(next);
    if (active === id) {
      if (next.length) openTab(next[next.length - 1]);
      else { setActive(null); setName(first); setSrc(EXAMPLES[first].src); setMode(EXAMPLES[first].mode); setStock(EXAMPLES[first].stock); }
    }
  };

  const renameTab = (id: string) => {
    const t = tabs.find((x) => x.id === id); if (!t) return;
    const nm = prompt("Nazwa programu", t.name)?.trim();
    if (!nm) return;
    const next = tabs.map((x) => (x.id === id ? { ...x, name: nm } : x));
    setTabs(next); savePrograms(next);
    if (active === id) setName(nm);
  };
  return (
    <div className="grid gap-4">
      <PageBanner src="/img/banner-simulator.jpg" title="Symulator" subtitle="Wizualizacja obróbki CNC w czasie rzeczywistym." priority />
      <div>
        <h1 className="text-3xl font-bold">Symulator</h1>
        <p className="text-muted">W trybie toczenia X jest średnicą (jak w Fanuc). Wpisz program (podpowiedzi po literze G, M, X…), uruchom, krokuj. Każda linia jest tłumaczona na polski; walidator zaznacza błędy na czerwono i ostrzeżenia na żółto.</p>
      </div>
      <div className="tabs">
        {tabs.map((t) => (
          <span key={t.id} className={`tab ${active === t.id ? "is-active" : ""}`}>
            <button onClick={() => openTab(t)} onDoubleClick={() => renameTab(t.id)} title="Kliknij dwukrotnie, aby zmienić nazwę">{t.name}</button>
            <button className="tab-x" onClick={() => closeTab(t.id)} aria-label={`Zamknij ${t.name}`}>×</button>
          </span>
        ))}
        <button className="tab-add" onClick={() => addTab()} title="Nowy pusty program">+ Nowy</button>
        <button className="tab-add" onClick={() => addTab({ name, src, mode })} title="Zapisz bieżący program jako zakładkę">Zapisz bieżący</button>
      </div>

      <div className="filters">
        <select className="border border-line rounded px-2 py-1 bg-card text-sm" value={name} onChange={(e) => { const n = e.target.value; setName(n); setSrc(EXAMPLES[n].src); setMode(EXAMPLES[n].mode); setStock(EXAMPLES[n].stock); setActive(null); }}>
          {Object.keys(EXAMPLES).map((k) => <option key={k}>{k}</option>)}
        </select>
        <button aria-pressed={mode === "mill"} onClick={() => setMode("mill")}>Frezowanie (XY)</button>
        <button aria-pressed={mode === "lathe"} onClick={() => setMode("lathe")}>Toczenie (ZX)</button>
        <span className="text-muted text-sm">Walidator:</span>
        <button aria-pressed={dialect === "fanuc"} onClick={() => setDialect("fanuc")}>Fanuc</button>
        <button aria-pressed={dialect === "sinumerik"} onClick={() => setDialect("sinumerik")}>Sinumerik</button>
      </div>
      <Simulator source={src} onSourceChange={setSrc} mode={mode} dialect={dialect} stock={stock} />
      <div className="legend"><span><i style={{ background: "var(--amber)" }} />G00</span><span><i style={{ background: "var(--green)" }} />G01</span><span><i style={{ background: "var(--blue)" }} />G02/G03</span></div>
    </div>
  );
}
