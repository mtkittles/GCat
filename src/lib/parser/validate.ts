import type { Program, Vec3 } from "./types";
import { pointAt, segmentLength } from "./index";

export interface StockBox { minX: number; maxX: number; minY: number; maxY: number; top: number; bottom: number }

export interface Issue { line: number; level: "error" | "warn"; msg: string; }

/** Sprawdzenia programowe wykraczające poza pojedynczy blok. Dialekt: fanuc | sinumerik. */
/** Komunikaty zgłaszane najwyżej raz na program — nie ma sensu powtarzać ich przy każdej linii. */
const ONCE = /wrzecion|G43|posuw F/i;

export function validate(program: Program, dialect: "fanuc" | "sinumerik" = "fanuc", stock?: StockBox, toolLen?: number, compRadius?: number): Issue[] {
  const out: Issue[] = [];
  const L = program.lines;
  let sawToolChange = false, sawG43 = false, sawM30 = false, sawSpindle = false, sawMotion = false;
  let firstCutLine: number | null = null;

  L.forEach((l) => {
    for (const e of l.errors) out.push({ line: l.index, level: "error", msg: e });
    const gs = l.words.filter((w) => w.letter === "G").map((w) => w.value);
    const ms = l.words.filter((w) => w.letter === "M").map((w) => w.value);
    const has = (x: string) => l.words.some((w) => w.letter === x);

    // konflikty grup modalnych w jednym bloku
    const groups: number[][] = [[0, 1, 2, 3], [17, 18, 19], [90, 91], [20, 21], [40, 41, 42], [94, 95], [96, 97], [98, 99]];
    for (const g of groups) { const n = gs.filter((x) => g.includes(x)); if (n.length > 1) out.push({ line: l.index, level: "error", msg: `Dwie funkcje z tej samej grupy w bloku: G${n.join(" G")}.` }); }

    // dialekt
    if (dialect === "sinumerik") {
      if (gs.includes(20) || gs.includes(21)) out.push({ line: l.index, level: "warn", msg: "Sinumerik: jednostki to G70 (cale) / G71 (mm), nie G20/G21." });
      if (gs.includes(28)) out.push({ line: l.index, level: "warn", msg: "Sinumerik nie ma G28 — użyj SUPA G0 Z0 lub G75." });
      if (gs.includes(43)) out.push({ line: l.index, level: "warn", msg: "Sinumerik: długość narzędzia aktywuje T_ D_, nie G43." });
      if (has("R") && (gs.includes(2) || gs.includes(3))) out.push({ line: l.index, level: "warn", msg: "Sinumerik: promień łuku to CR=, nie R." });
    } else {
      if (gs.includes(70) || gs.includes(71)) if (l.state.plane === 17) out.push({ line: l.index, level: "warn", msg: "G70/G71 na frezarce Fanuc to nie jednostki (to cykle tokarskie). Jednostki: G20/G21." });
    }

    // G04 — postój
    if (gs.includes(4)) {
      const w = (x: string) => l.words.find((v) => v.letter === x);
      const others = l.words.filter((v) => !["G", "N", "P", "X", "U", "F", "S"].includes(v.letter) || (v.letter === "G" && v.value !== 4));
      if (others.length) out.push({ line: l.index, level: "warn", msg: "G04 zapisuj w osobnym bloku — bez ruchu i innych funkcji." });
      if (dialect === "sinumerik") {
        if (has("P") || has("X") || has("U")) out.push({ line: l.index, level: "warn", msg: "Sinumerik: postój to G4 F_ (sekundy) albo G4 S_ (obroty wrzeciona)." });
      } else {
        if (w("P")?.raw.includes(".")) out.push({ line: l.index, level: "error", msg: "Fanuc: w G04 adres P podaje się bez kropki, w milisekundach (P500 = 0,5 s)." });
        for (const a of ["X", "U"]) if (w(a) && !w(a)!.raw.includes(".")) out.push({ line: l.index, level: "warn", msg: `Fanuc: G04 ${a} bez kropki może zostać odczytane jako tysięczne sekundy. Pisz ${a}${w(a)!.value}.0.` });
        if (has("F") || has("S")) out.push({ line: l.index, level: "warn", msg: "Fanuc: czas postoju podaje X, U albo P. F i S w bloku G04 zmieniłyby posuw lub obroty." });
      }
      if (!has("P") && !has("X") && !has("U") && !has("F") && !has("S")) out.push({ line: l.index, level: "warn", msg: "G04 bez czasu postoju." });
    }

    if (ms.includes(6)) { sawToolChange = true; sawG43 = false; }
    if (gs.includes(43)) sawG43 = true;
    if (ms.includes(3) || ms.includes(4)) sawSpindle = true;
    if (ms.includes(5)) sawSpindle = false;
    if (ms.includes(30) || ms.includes(2)) sawM30 = true;
    if (gs.some((g) => g <= 3)) sawMotion = true;

    let plungeFlagged = false;
    for (const sg of l.segments) {
      if (!plungeFlagged && sg.kind === "rapid" && l.state.plane === 17 && sg.to.z < sg.from.z && sg.to.z < 0 && !l.state.cycle) {
        out.push({ line: l.index, level: "warn", msg: `G00 w dół do Z${fmt(sg.to.z)} — poniżej zera detalu. Zagłębiaj na G01.` });
        plungeFlagged = true;
      }
      if (sg.kind !== "rapid") {
        if (firstCutLine === null) firstCutLine = l.index;
        // Linie podprogramu pod M30 mają stan z chwili wywołania — liczy się on, a nie kolejność w pliku.
        const spindleOn = sawM30 ? l.state.spindleOn !== "off" : sawSpindle;
        if (!spindleOn) out.push({ line: l.index, level: "warn", msg: "Ruch roboczy przy wyłączonym wrzecionie (brak M03/M04)." });
        if (dialect === "fanuc" && l.state.plane === 17 && sawToolChange && !sawG43) out.push({ line: l.index, level: "warn", msg: "Po wymianie narzędzia brak G43 H_ — długość narzędzia nieaktywna." });
        if (l.state.feed !== null && l.state.feedMode === 94 && l.state.plane === 18 && l.state.feed < 5) out.push({ line: l.index, level: "warn", msg: `Posuw F${l.state.feed} przy G94 (mm/min) wygląda na wartość mm/obr — sprawdź G95.` });
        if (l.state.feed !== null && l.state.feedMode === 95 && l.state.feed > 5) out.push({ line: l.index, level: "warn", msg: `Posuw F${l.state.feed} przy G95 (mm/obr) jest bardzo duży — to nie mm/min?` });
      }
    }
    if (ms.includes(99) && !L.some((x) => x.words.some((w) => w.letter === "O"))) { /* podprogram – ok */ }
  });

  if (L.some((l) => l.words.length) && !sawM30) out.push({ line: L.length - 1, level: "warn", msg: "Brak M30/M02 na końcu programu." });
  if (L.some((l) => l.words.length) && !sawMotion) out.push({ line: 0, level: "warn", msg: "Program nie zawiera żadnego ruchu (G00–G03)." });
  // Kierunek obiegu konturu kontra strona kompensacji.
  // Pole zorientowane zamkniętego toru mówi, w którą stronę obchodzimy kontur;
  // dla konturu zewnętrznego narzędzie musi zostać po jego zewnętrznej stronie.
  {
    const cut = program.segments.filter((sg) => sg.kind !== "rapid");
    const comped = cut.filter((sg) => {
      const c = program.lines[sg.line]?.state.comp;
      return c === 41 || c === 42;
    });
    // Pierwszy blok z aktywną kompensacją to dojazd — nie należy do konturu.
    const body = comped.length >= 4 ? comped.slice(1) : comped;
    if (body.length >= 3) {
      const pts: { x: number; y: number }[] = [];
      for (const sg of body) for (let t = 0; t <= 1; t += 0.5) { const q = pointAt(sg, t); pts.push({ x: q.x, y: q.y }); }
      let area2 = 0;
      for (let i = 0; i < pts.length; i++) {
        const j = (i + 1) % pts.length;
        area2 += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
      }
      const closed = Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y) < 1.5;
      const ccw = area2 > 0;
      const side = program.lines[comped[0].line]?.state.comp;
      if (closed && Math.abs(area2 / 2) > 25) {
        if (ccw && side === 41) {
          out.push({ line: body[0].line, level: "warn", msg: "Kontur obchodzony przeciwnie do wskazówek zegara przy G41 — narzędzie idzie po wewnętrznej stronie. Dla konturu zewnętrznego użyj G42 albo odwróć kolejność bloków." });
        } else if (!ccw && side === 42) {
          out.push({ line: body[0].line, level: "warn", msg: "Kontur obchodzony zgodnie z ruchem wskazówek zegara przy G42 — narzędzie idzie po wewnętrznej stronie. Dla konturu zewnętrznego użyj G41 albo odwróć kolejność bloków." });
        }
      }
    }
  }

  // kontrola poprawności kompensacji promienia
  {
    let prevComp: 40 | 41 | 42 = 40;
    let activatedAt: number | null = null;
    program.lines.forEach((l) => {
      const comp = l.state.comp;
      const gs = l.words.filter((w) => w.letter === "G").map((w) => w.value);

      // zmiana strony bez wyłączenia kompensacji
      if ((prevComp === 41 && comp === 42) || (prevComp === 42 && comp === 41)) {
        out.push({ line: l.index, level: "error", msg: "Zmiana strony kompensacji z G41 na G42 (lub odwrotnie) bez pośredniego G40. Tor przeskakuje na drugą stronę konturu — wyłącz kompensację, odjedź i włącz ją ponownie." });
      }

      // włączenie kompensacji
      if (prevComp === 40 && (comp === 41 || comp === 42)) {
        activatedAt = l.index;
        if (l.state.motion === 0) {
          out.push({ line: l.index, level: "warn", msg: "Kompensacja włączona w bloku szybkiego przejazdu. Blok dojazdowy powinien być ruchem G01 — na części sterowników G00 z G41/G42 kończy się alarmem." });
        }
        const move = l.segments.find((sg) => sg.kind !== "rapid") ?? l.segments[0];
        if (move && compRadius) {
          const len = Math.hypot(move.to.x - move.from.x, move.to.y - move.from.y);
          if (len > 0 && len < compRadius * 1.05) {
            out.push({ line: l.index, level: "error", msg: `Blok dojazdowy ma ${fmt(len)} mm, a promień narzędzia to ${fmt(compRadius)} mm. Dojazd musi być dłuższy niż promień, inaczej sterownik zgłosi przecięcie toru.` });
          }
        }
        if (l.words.some((w) => w.letter === "Z") && !l.words.some((w) => w.letter === "X" || w.letter === "Y")) {
          out.push({ line: l.index, level: "warn", msg: "Kompensacji nie da się włączyć ruchem wyłącznie w osi Z — potrzebny jest ruch w płaszczyźnie obróbki." });
        }
      }

      // łuk w bloku włączającym
      if ((comp === 41 || comp === 42) && activatedAt === l.index && gs.some((g) => g === 2 || g === 3)) {
        out.push({ line: l.index, level: "error", msg: "Kompensacji nie wolno włączać w bloku z łukiem G02/G03 — użyj ruchu prostoliniowego." });
      }

      prevComp = comp;
    });
    if (prevComp !== 40 && program.lines.some((l) => l.words.length)) {
      out.push({ line: program.lines.length - 1, level: "warn", msg: "Program kończy się z aktywną kompensacją promienia. Dodaj G40 w bloku odjazdowym." });
    }
  }

  // kontrola kolizji z półfabrykatem
  if (stock) {
    for (const l of program.lines) {
      let flagged = false;
      for (const sg of l.segments) {
        if (flagged || sg.kind !== "rapid") continue;
        // Pionowe zjazdy i wycofania (także te generowane przez cykle) są normalne —
        // groźny jest dopiero szybki przejazd BOKIEM poniżej powierzchni materiału.
        const lateral = Math.hypot(sg.to.x - sg.from.x, sg.to.y - sg.from.y);
        if (lateral < 0.01) continue;
        const n = 12;
        for (let i = 0; i <= n; i++) {
          const p: Vec3 = pointAt(sg, i / n);
          if (p.z < stock.top - 0.01 && inside(p, stock)) {
            out.push({ line: l.index, level: "error", msg: `Kolizja: szybki przejazd w poprzek materiału na Z${fmt(p.z)} (górna powierzchnia Z${fmt(stock.top)}). Podnieś narzędzie nad materiał albo przejedź na G01.` });
            flagged = true;
            break;
          }
        }
      }
      if (toolLen) {
        for (const sg of l.segments) {
          const dz = Math.min(sg.from.z, sg.to.z);
          if (sg.kind !== "rapid" && stock.top - dz > toolLen)
            out.push({ line: l.index, level: "warn", msg: `Głębokość ${fmt(stock.top - dz)} mm przekracza długość ostrza narzędzia (${fmt(toolLen)} mm).` });
        }
      }
    }
  }

  const seen = new Set<string>();
  const res: Issue[] = [];
  for (const i of out) {
    const key = ONCE.test(i.msg) ? i.msg : `${i.line}:${i.msg}`;
    if (seen.has(key)) continue;
    seen.add(key); res.push(i);
  }
  const sorted = res.sort((a, b) => a.line - b.line);
  if (sorted.length > 30) {
    const head = sorted.slice(0, 30);
    head.push({ line: sorted[30].line, level: "warn", msg: `…oraz ${sorted.length - 30} dalszych uwag. Popraw powyższe i sprawdź ponownie.` });
    return head;
  }
  return sorted;
}
const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2));
const inside = (p: Vec3, s: StockBox) => p.x > s.minX - 1e-6 && p.x < s.maxX + 1e-6 && p.y > s.minY - 1e-6 && p.y < s.maxY + 1e-6 && p.z > s.bottom - 1e-6;

/** Czas cyklu w formacie mm:ss. */
export function formatTime(sec: number) {
  const m = Math.floor(sec / 60), r = Math.round(sec % 60);
  return `${m}:${String(r).padStart(2, "0")}`;
}

export { segmentLength };
