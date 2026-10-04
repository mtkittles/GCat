import type {
  CannedCycle,
  MachineState,
  ParsedLine,
  Plane,
  Program,
  Segment,
  Vec3,
  Word,
} from "./types";

export * from "./types";

export const initialState = (units: "mm" | "inch" = "mm"): MachineState => ({
  motion: 0, // sterowniki startują w trybie szybkiego przejazdu
  plane: 17,
  absolute: true,
  units,
  feed: null,
  feedMode: 94,
  spindle: null,
  spindleOn: "off",
  coolant: false,
  tool: null,
  wcs: 54,
  wcsP: null,
  offsets: {},
  comp: 40,
  cycle: null,
  rot: null,
  local: { x: 0, y: 0, z: 0 },
  shift: { x: 0, y: 0, z: 0 },
  frame: { x: 0, y: 0, z: 0 },
  pos: { x: 0, y: 0, z: 0 },
  prog: { x: 0, y: 0, z: 0 },
});

/* ---------- Układy współrzędnych: pomocnicze ---------- */
const ZERO: Vec3 = { x: 0, y: 0, z: 0 };
const isZero = (v: Vec3) => Math.abs(v.x) < 1e-9 && Math.abs(v.y) < 1e-9 && Math.abs(v.z) < 1e-9;
const addV = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });

/** Klucz tabeli przesunięć dla aktywnego układu; null dla G500 (brak przesunięcia). */
export function wcsKey(s: Pick<MachineState, "wcs" | "wcsP">): string | null {
  if (s.wcs === 500) return null;
  if (s.wcs === 54.1) return `p${s.wcsP ?? 1}`;
  return String(s.wcs);
}
/** Przesunięcie aktywnego układu z tabeli (zero, gdy nie wpisano). */
export function activeOffset(s: Pick<MachineState, "wcs" | "wcsP" | "offsets">): Vec3 {
  const k = wcsKey(s);
  return (k && s.offsets[k]) || ZERO;
}
/** Łączne przesunięcie: układ + G52 + G92 + TRANS. Zero układu programu leży w tym punkcie maszyny. */
export function frameShift(s: Pick<MachineState, "wcs" | "wcsP" | "offsets" | "local" | "shift" | "frame">): Vec3 {
  return addV(addV(addV(activeOffset(s), s.local), s.shift), s.frame);
}
/** Etykieta aktywnego układu: G55, G54.1 P3, G500, G505. */
export function wcsLabel(s: Pick<MachineState, "wcs" | "wcsP">): string {
  return s.wcs === 54.1 ? `G54.1 P${s.wcsP ?? 1}` : `G${s.wcs}`;
}

/** Rozbija linię na słowa (litera + liczba) i komentarz. */
export function tokenize(raw: string): { words: Word[]; comment: string | null } {
  let comment: string | null = null;
  let text = raw;
  const paren = text.match(/\(([^)]*)\)/);
  if (paren) {
    comment = paren[1].trim();
    text = text.replace(paren[0], " ");
  }
  const semi = text.indexOf(";");
  if (semi >= 0) {
    const c = text.slice(semi + 1).trim();
    if (c) comment = comment ? `${comment} ${c}` : c;
    text = text.slice(0, semi);
  }
  const words: Word[] = [];
  const re = /([A-Za-z])\s*([-+]?\d*\.?\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    words.push({ letter: m[1].toUpperCase(), value: parseFloat(m[2]), raw: m[0] });
  }
  return { words, comment };
}

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(3).replace(/0+$/, "").replace(/\.$/, ""));

const planeAxes = (p: Plane): [keyof Vec3, keyof Vec3, keyof Vec3] =>
  p === 17 ? ["x", "y", "z"] : p === 18 ? ["z", "x", "y"] : ["y", "z", "x"];

function arcCenter(
  from: Vec3,
  to: Vec3,
  words: Word[],
  plane: Plane,
  cw: boolean,
  errors: string[],
): Vec3 | null {
  const [a, b] = planeAxes(plane);
  const ijk: Record<keyof Vec3, string> = { x: "I", y: "J", z: "K" };
  const iw = words.find((w) => w.letter === ijk[a]);
  const jw = words.find((w) => w.letter === ijk[b]);
  const rw = words.find((w) => w.letter === "R");
  if (iw || jw) {
    return { ...from, [a]: from[a] + (iw?.value ?? 0), [b]: from[b] + (jw?.value ?? 0) };
  }
  if (rw) {
    const r = rw.value;
    const dx = to[a] - from[a];
    const dy = to[b] - from[b];
    const d = Math.hypot(dx, dy);
    if (d === 0) {
      errors.push("Łuk z R: punkt końcowy = początkowy (użyj I/J/K).");
      return null;
    }
    if (d > 2 * Math.abs(r) + 1e-6) {
      errors.push(`Promień R${fmt(r)} za mały — cięciwa ma ${fmt(d)}.`);
      return null;
    }
    const h = Math.sqrt(Math.max(0, r * r - (d / 2) ** 2));
    const mx = from[a] + dx / 2;
    const my = from[b] + dy / 2;
    // R>0: łuk ≤180°, R<0: łuk >180°
    let sign = cw ? -1 : 1;
    if (r < 0) sign = -sign;
    const cx = mx - (sign * h * dy) / d;
    const cy = my + (sign * h * dx) / d;
    return { ...from, [a]: cx, [b]: cy };
  }
  errors.push("Łuk wymaga I/J/K albo R.");
  return null;
}

const planeName = (p: Plane) => (p === 17 ? "XY" : p === 18 ? "ZX" : "YZ");

/** Interpretuje program (dialekt Fanuc/ISO) i zwraca segmenty ruchu + opis PL. */
export interface ParseOptions {
  /** Sterownik: na Sinumeriku G90/G92/G94 na tokarce nie są cyklami (system kodów jak na frezarce). */
  dialect?: "fanuc" | "sinumerik";
  /** Tokarka: X i I programowane średnicowo (Fanuc domyślnie). Geometria wewnętrzna liczona na promieniu. */
  diameterX?: boolean;
  /** Prędkość szybkiego przejazdu [mm/min] do szacowania czasu cyklu. */
  rapidRate?: number;
  /**
   * Jednostki programu. "auto" respektuje G20/G21 w kodzie, pozostałe wymuszają
   * interpretację niezależnie od programu. Wewnętrznie wszystko liczymy w mm,
   * więc program calowy jest przeliczany współczynnikiem 25,4.
   */
  units?: "auto" | "mm" | "inch";
}

export function parseProgram(source: string, opts: ParseOptions = {}, start?: MachineState): Program {
  const forcedInit = opts.units && opts.units !== "auto" ? opts.units : "mm";
  let state = start ?? initialState(forcedInit);
  const dia = !!opts.diameterX;
  // Tokarka Fanuc w systemie A: G90, G92, G94 to cykle pojedyncze, nie tryby wymiarowania/posuwu.
  const latheA = dia && opts.dialect !== "sinumerik";
  const rapidRate = opts.rapidRate ?? 20000;
  const forced = opts.units && opts.units !== "auto" ? opts.units : null;
  let seconds = 0;
  let dwellMs = 0;
  const lines: ParsedLine[] = [];
  const allSegments: Segment[] = [];
  /** Każda linia źródła ma jeden wpis — przy wielokrotnym wykonaniu (podprogram) zostaje pierwszy. */
  const lineMap = new Map<number, ParsedLine>();
  const record = (l: ParsedLine) => { if (!lineMap.has(l.index)) lineMap.set(l.index, l); };

  const step = (raw: string, index: number) => {
    const { words: rawWords, comment } = tokenize(raw);
    // Słowa kluczowe Sinumerika (bez liczby po literze, więc tokenizer ich nie widzi).
    const bare = raw.replace(/\([^)]*\)/g, "").replace(/;.*$/, "").toUpperCase();
    const kwTrans = bare.match(/(^|[^A-Z])(ATRANS|TRANS)(?![A-Z])/)?.[2] as "TRANS" | "ATRANS" | undefined;
    const kwOther = bare.match(/(^|[^A-Z])(AROT|ROT|ASCALE|SCALE|AMIRROR|MIRROR|SUPA)(?![A-Z])/)?.[2];

    // Jednostki ustalamy przed przeliczeniem słów: G20/G21 w tym samym bloku
    // obowiązuje już dla jego współrzędnych.
    const gsRaw = rawWords.filter((w) => w.letter === "G").map((w) => w.value);
    const unitsNow: "mm" | "inch" =
      forced ?? (gsRaw.includes(20) ? "inch" : gsRaw.includes(21) ? "mm" : state.units);
    const u = unitsNow === "inch" ? 25.4 : 1;

    const SCALED = "XYZUVWIJKRQ";           // długości i promienie
    const words = rawWords.map((w) => {
      let v = w.value;
      if (u !== 1 && SCALED.includes(w.letter)) v *= u;
      if (u !== 1 && w.letter === "F") v *= u;   // posuw cale/min → mm/min
      // Tokarka: X i U w średnicy. I (środek łuku w X) — w promieniu, jak domyślnie na Fanucu.
      if (dia && (w.letter === "X" || w.letter === "U")) v /= 2;
      return v === w.value ? w : { ...w, value: v };
    });
    const errors: string[] = [];
    const desc: string[] = [];
    const s: MachineState = { ...state, pos: { ...state.pos }, prog: { ...state.prog } };
    const segments: Segment[] = [];

    const gs = words.filter((w) => w.letter === "G").map((w) => w.value);
    let cycleCode: number | null = null;
    let cycleRetract: 98 | 99 = state.cycle?.retract ?? 99;
    const ms = words.filter((w) => w.letter === "M").map((w) => w.value);
    const get = (l: string) => words.find((w) => w.letter === l)?.value;

    if (ms.length > 1) errors.push("Tylko jedna funkcja M w bloku.");

    // Zmiana układu (G54–G59, G52, G92, G10 na aktywnym układzie, TRANS, G68) nie porusza maszyną —
    // po bloku przeliczamy tylko, jak dotychczasowe położenie wyraża się w nowym układzie programu.
    let frameChanged = false;
    const vec = (v: Vec3) => `X${fmt(dia ? v.x * 2 : v.x)}${dia ? "" : ` Y${fmt(v.y)}`} Z${fmt(v.z)}`;
    const axesOf = (): Partial<Vec3> => {
      const o: Partial<Vec3> = {};
      for (const ax of ["x", "y", "z"] as const) { const v = get(ax.toUpperCase()); if (v !== undefined) o[ax] = v; }
      return o;
    };
    const selectWcs = (code: number, p: number | null) => {
      s.wcs = code; s.wcsP = p; frameChanged = true;
      const off = activeOffset(s);
      desc.push(`Układ współrzędnych ${wcsLabel(s)}${isZero(off) ? "" : ` — zero w ${vec(off)} maszyny`}`);
    };

    for (const g of gs) {
      switch (g) {
        case 0: case 1: case 2: case 3:
          s.motion = g as 0 | 1 | 2 | 3; s.lcycle = null; break;
        case 4: {
          // Fanuc: X/U w sekundach, P w milisekundach. Sinumerik: F w sekundach, S w obrotach wrzeciona.
          const pv = get("P"), xv = get("X") ?? get("U"), fv = get("F"), sv = get("S");
          let secs = 0, how = "";
          if (pv !== undefined) secs = pv / 1000;
          else if (xv !== undefined) secs = xv;
          else if (fv !== undefined) secs = fv;
          else if (sv !== undefined && s.spindle) { secs = (sv * 60) / s.spindle; how = ` = ${fmt(sv)} obr. wrzeciona`; }
          dwellMs += secs * 1000;
          desc.push(`Postój ${fmt(secs)} s${how} — osie stoją, wrzeciono pracuje (G04)`);
          segments.push({ kind: "dwell", from: { ...s.pos }, to: { ...s.pos }, seconds: secs, line: index });
          break;
        }
        case 17: case 18: case 19:
          s.plane = g as Plane; desc.push(`Płaszczyzna ${planeName(s.plane)} (G${g})`); break;
        case 20: s.units = forced ?? "inch"; desc.push(forced ? `G20 w programie — wymuszono ${forced === "mm" ? "milimetry" : "cale"}` : "Jednostki: cale (G20)"); break;
        case 21: s.units = forced ?? "mm"; desc.push(forced ? `G21 w programie — wymuszono ${forced === "mm" ? "milimetry" : "cale"}` : "Jednostki: mm (G21)"); break;
        case 28: desc.push("Powrót do punktu referencyjnego (G28)"); break;
        case 27: desc.push("Sprawdzenie powrotu do punktu referencyjnego (G27) — ruch szybki do zadanego punktu"); break;
        case 29: desc.push("Powrót z punktu referencyjnego przez punkt pośredni (G29) — ruch szybki"); break;
        case 30: desc.push(`Powrót do ${fmt(get("P") ?? 2)}. punktu referencyjnego (G30) — ruch szybki przez punkt pośredni`); break;
        case 31: desc.push("Ruch z pomiarem — przerywany sygnałem sondy (G31); w symulatorze jak G01 do końca"); break;
        case 9: desc.push("Dokładne zatrzymanie na końcu bloku (G09, jednorazowo)"); break;
        case 61: desc.push("Tryb dokładnego zatrzymania (G61) — osie zwalniają do zera na końcu każdego bloku"); break;
        case 64: desc.push("Tryb skrawania (G64) — płynne przejścia między blokami"); break;
        case 10: {
          const L = get("L"), P = get("P");
          if (L === 2 || L === 20) {
            const key = L === 2 ? (P === 0 ? "ext" : P !== undefined && P >= 1 && P <= 6 ? String(53 + P) : null) : (P !== undefined && P >= 1 && P <= 48 && Number.isInteger(P) ? `p${P}` : null);
            if (key === null) { errors.push(L === 2 ? "G10 L2 wymaga P0 (zewnętrzne) albo P1–P6 (G54–G59)." : "G10 L20 wymaga P1–P48 (G54.1)."); break; }
            const cur = s.offsets[key] ?? ZERO, ax = axesOf();
            const next: Vec3 = { ...cur };
            for (const k of ["x", "y", "z"] as const) if (ax[k] !== undefined) next[k] = s.absolute ? ax[k]! : cur[k] + ax[k]!;
            s.offsets = { ...s.offsets, [key]: next };
            if (wcsKey(s) === key) frameChanged = true;
            const name = key === "ext" ? "zewnętrzne przesunięcie (EXT)" : key.startsWith("p") ? `G54.1 P${key.slice(1)}` : `G${key}`;
            desc.push(`Wpis przesunięcia układu ${name}: ${vec(next)}${s.absolute ? "" : " (przyrostowo, G91)"} (G10 L${L})`);
          } else if (L === 1 || L === 10 || L === 11 || L === 12 || L === 13) {
            desc.push(`G10 L${fmt(L)} — zapis korektora narzędzia P${fmt(P ?? 0)}; nieobsługiwane: symulator nie ma tabeli korektorów, długość i promień bierze z ustawień narzędzia`);
          } else if (L === undefined) {
            errors.push("G10 wymaga L: L2 (układy G54–G59), L20 (G54.1), L10–L13 (korektory).");
          } else {
            desc.push(`G10 L${fmt(L)} — nieobsługiwane w symulatorze`);
          }
          break;
        }
        case 22: desc.push("Włączenie strefy zabronionej (G22) — bez ruchu"); break;
        case 23: desc.push("Wyłączenie strefy zabronionej (G23)"); break;
        case 15: s.polar = null; desc.push("Wyłączenie współrzędnych biegunowych (G15)"); break;
        case 16:
          if (dia) { desc.push("G16 — współrzędne biegunowe nie dotyczą tokarki w tym symulatorze"); break; }
          s.polar = { r: Math.hypot(state.prog.x, state.prog.y), a: (Math.atan2(state.prog.y, state.prog.x) * 180) / Math.PI };
          desc.push("Współrzędne biegunowe (G16): X — promień, Y — kąt w stopniach");
          break;
        case 44: desc.push(`Korekcja długości ujemna H${fmt(get("H") ?? 0)} (G44)`); break;
        case 53: desc.push("Ruch we współrzędnych maszynowych (G53) — w symulatorze odjazd w górę na wysokość bezpieczną"); break;
        case 65: desc.push(`Wywołanie makra P${fmt(get("P") ?? 0)} (G65) — symulator nie wykonuje makr`); break;
        case 66: desc.push("Modalne wywołanie makra (G66) — symulator nie wykonuje makr"); break;
        case 67: desc.push("Koniec modalnego wywołania makra (G67)"); break;
        case 93: desc.push("Posuw odwrotności czasu (G93) — czas obróbki w symulatorze orientacyjny"); break;
        case 51: desc.push("Skalowanie / lustro (G51) — symulator rysuje tor bez skalowania"); break;
        case 40: s.comp = 40; desc.push("Wyłącz kompensację promienia (G40)"); break;
        case 41: s.comp = 41; desc.push("Kompensacja promienia — lewa (G41)"); break;
        case 42: s.comp = 42; desc.push("Kompensacja promienia — prawa (G42)"); break;
        case 43: desc.push(`Korekcja długości narzędzia H${fmt(get("H") ?? 0)} (G43)`); break;
        case 49: desc.push("Wyłącz korekcję długości (G49)"); break;
        case 54: case 55: case 56: case 57: case 58: case 59: selectWcs(g, null); break;
        case 54.1: {
          const P = get("P");
          if (P === undefined || !Number.isInteger(P) || P < 1 || P > 48) { errors.push("G54.1 wymaga P1–P48."); break; }
          selectWcs(54.1, P); break;
        }
        case 500: selectWcs(500, null); break;
        case 80: s.cycle = null; desc.push("Anuluj cykl stały (G80)"); break;
        case 52: {
          s.local = { x: get("X") ?? 0, y: get("Y") ?? 0, z: get("Z") ?? 0 }; frameChanged = true;
          desc.push(isZero(s.local) ? "Kasowanie układu lokalnego (G52)" : `Układ lokalny przesunięty o ${vec(s.local)} względem ${wcsLabel(s)} (G52)`);
          break;
        }
        case 92.1: {
          if (latheA) { desc.push("G92.1 — nieobsługiwane w symulatorze"); break; }
          s.shift = { ...ZERO }; frameChanged = true; desc.push("Kasowanie przesunięcia G92 (G92.1)"); break;
        }
        case 68: {
          const deg = get("R") ?? 0; frameChanged = true;
          s.rot = { deg, cx: get("X") ?? 0, cy: get("Y") ?? 0 };
          desc.push(`Obrót układu o ${fmt(deg)}° wokół X${fmt(s.rot.cx)} Y${fmt(s.rot.cy)} (G68)`);
          break;
        }
        case 69: s.rot = null; frameChanged = true; desc.push("Kasowanie obrotu układu (G69)"); break;
        // Tokarka Fanuc (system kodów A): G98 — posuw mm/min, G99 — posuw mm/obr.
        case 98: cycleRetract = 98; if (s.cycle) s.cycle = { ...s.cycle, retract: 98 }; if (dia) { s.feedMode = 94; desc.push("Posuw w mm/min (G98, tokarka)"); } else desc.push("Powrót do punktu początkowego w cyklu (G98)"); break;
        case 99: cycleRetract = 99; if (s.cycle) s.cycle = { ...s.cycle, retract: 99 }; if (dia) { s.feedMode = 95; desc.push("Posuw w mm/obr (G99, tokarka)"); } else desc.push("Powrót do płaszczyzny R w cyklu (G99)"); break;
        case 73: case 81: case 82: case 83: case 84: case 85: case 86: case 89: cycleCode = g; break;
        // G87 (wytaczanie wsteczne) i G88 (z ręcznym wycofaniem) — tor jak G86: posuw w dół, wycofanie szybkie
        case 87: case 88: cycleCode = 86; desc.push(`Cykl wytaczania G${g} — tor pokazany jak G86`); break;
        case 90:
          if (latheA) { s.lcycle = { code: 90, end: { ...state.prog }, r: 0 }; desc.push("Cykl toczenia wzdłużnego G90 (system A)"); }
          else { s.absolute = true; desc.push("Wymiarowanie absolutne (G90)"); }
          break;
        case 92:
          if (latheA) { s.lcycle = { code: 92, end: { ...state.prog }, r: 0 }; desc.push("Cykl gwintowania G92 — jedno przejście na blok"); }
          else desc.push("Ustawienie układu współrzędnych w bieżącym punkcie (G92)");
          break;
        case 91: s.absolute = false; desc.push("Wymiarowanie przyrostowe (G91)"); break;
        case 94:
          if (latheA) { s.lcycle = { code: 94, end: { ...state.prog }, r: 0 }; desc.push("Cykl toczenia poprzecznego (planowania) G94"); }
          else { s.feedMode = 94; desc.push("Posuw w mm/min (G94)"); }
          break;
        case 95: s.feedMode = 95; desc.push("Posuw w mm/obr (G95)"); break;
        case 96: s.css = get("S") ?? s.css ?? null; desc.push(`Stała prędkość skrawania ${fmt(get("S") ?? 0)} m/min (G96)`); break;
        case 97: s.css = null; desc.push("Stałe obroty wrzeciona (G97)"); break;
        case 50:
          if (dia) { s.maxRpm = get("S") ?? s.maxRpm ?? null; desc.push(`Limit obrotów wrzeciona ${fmt(get("S") ?? 0)} obr/min (G50)`); }
          else desc.push("Kasowanie skalowania (G50)");
          break;
        case 32: case 33: case 34:
          if (dia) { s.motion = 1; desc.push(`Toczenie gwintu G${g} — posuw równy skokowi F, synchronizacja z wrzecionem`); }
          else desc.push(`G${fmt(g)} — nieobsługiwane w symulatorze`);
          break;
        case 76:
          if (dia) desc.push(words.some((w) => ["X", "U", "Z", "W"].includes(w.letter)) ? "Cykl gwintowania G76 — średnica rdzenia, długość, wysokość zwoju, pierwsze wejście, skok" : "Cykl gwintowania G76 — przejścia wykańczające, kąt, minimalne wejście, naddatek");
          else { cycleCode = 86; desc.push("Dokładne wytaczanie G76 (frezarka) — orientacja wrzeciona i odsunięcie ostrza przed wycofaniem; tor jak G86"); }
          break;
        case 74: case 75:
          if (dia) {
            const hasZX = words.some((w) => ["X", "U", "Z", "W"].includes(w.letter));
            desc.push(hasZX ? (g === 74 ? "Cykl G74 — wiercenie / rowkowanie czołowe z wycofaniem" : "Cykl G75 — rowek promieniowy z wycofaniem") : `Cykl G${g} — wycofanie po każdym wcięciu`);
          } else if (g === 74) { cycleCode = 84; desc.push("Gwintowanie lewe G74 (frezarka) — wrzeciono w lewo, rewers na dnie; tor jak G84"); }
          else desc.push(`G${fmt(g)} — nieobsługiwane w symulatorze`);
          break;
        case 70: case 71: case 72:
          if (dia) {
            const hasP = words.some((w) => w.letter === "P");
            desc.push(g === 70 ? "Cykl wykańczający G70 — przejście po konturze" : hasP ? `Cykl zgrubny G${g} — kontur i naddatki` : `Cykl zgrubny G${g} — głębokość skrawania i wycofanie`);
          } else desc.push(`G${fmt(g)} — nieobsługiwane w symulatorze`);
          break;
        default:
          if (Number.isInteger(g) && g >= 505 && g <= 599) { selectWcs(g, null); break; }
          desc.push(`G${fmt(g)} — nieobsługiwane w symulatorze`);
      }
    }

    // Sinumerik: TRANS zastępuje ramkę programowalną (bez osi — kasuje), ATRANS dodaje.
    if (kwTrans) {
      const ax = axesOf();
      const base = kwTrans === "TRANS" ? ZERO : s.frame;
      s.frame = { x: base.x + (ax.x ?? 0), y: base.y + (ax.y ?? 0), z: base.z + (ax.z ?? 0) };
      frameChanged = true;
      desc.push(kwTrans === "TRANS" && isZero(s.frame) ? "Kasowanie przesunięcia programowalnego (TRANS)" : `${kwTrans === "TRANS" ? "Przesunięcie programowalne" : "Dodatkowe przesunięcie"} ${vec(s.frame)} (${kwTrans})`);
    } else if (kwOther) {
      desc.push(`${kwOther} — ${kwOther === "SUPA" ? "ruch we współrzędnych maszynowych" : "obrót/skalowanie/lustro ramki"} (Sinumerik) — nieobsługiwane w symulatorze, blok pominięty`);
    }

    // G92 na frezarce: bieżący punkt dostaje zadane współrzędne — przesuwamy wszystkie układy (shift).
    if (!latheA && gs.includes(92)) {
      const ax = axesOf(), sh = { ...s.shift };
      for (const k of ["x", "y", "z"] as const) if (ax[k] !== undefined) sh[k] = s.shift[k] + (state.prog[k] - ax[k]!);
      s.shift = sh; frameChanged = true;
    }

    if (frameChanged) s.prog = inverseFrames(s.pos, s);

    // W bloku G04 adresy F i S (Sinumerik) oznaczają czas postoju, nie posuw i obroty.
    const isDwell = gs.includes(4);
    const f = get("F"); if (f !== undefined && !isDwell) { s.feed = f; }
    const sp = get("S"); if (sp !== undefined && !gs.includes(96) && !(dia && gs.includes(50)) && !isDwell) { s.spindle = sp; }
    const t = get("T"); if (t !== undefined) { s.tool = t; desc.push(`Wybierz narzędzie T${fmt(t)}`); }

    for (const m of ms) {
      switch (m) {
        case 0: desc.push("Stop programu (M00)"); break;
        case 1: desc.push("Stop warunkowy (M01)"); break;
        case 2: desc.push("Koniec programu (M02)"); break;
        case 3: s.spindleOn = "cw"; desc.push(`Wrzeciono w prawo${s.spindle ? ` S${fmt(s.spindle)}` : ""} (M03)`); break;
        case 4: s.spindleOn = "ccw"; desc.push(`Wrzeciono w lewo${s.spindle ? ` S${fmt(s.spindle)}` : ""} (M04)`); break;
        case 5: s.spindleOn = "off"; desc.push("Stop wrzeciona (M05)"); break;
        case 6: desc.push("Wymiana narzędzia (M06)"); break;
        case 8: s.coolant = true; desc.push("Chłodziwo włączone (M08)"); break;
        case 9: s.coolant = false; desc.push("Chłodziwo wyłączone (M09)"); break;
        case 30: desc.push("Koniec programu i przewinięcie (M30)"); break;
        case 98: {
          const pw = words.find((w) => w.letter === "P")?.raw.replace(/^P/i, "") ?? "", lw = get("L");
          const long = pw.length > 4 && lw === undefined;
          const num = long ? Number(pw.slice(-4)) : Number(pw), cnt = long ? Number(pw.slice(0, -4)) : (lw ?? 1);
          desc.push(`Wywołanie podprogramu O${fmt(num)}${cnt > 1 ? ` × ${fmt(cnt)}` : ""} (M98)`); break;
        }
        case 99: desc.push("Koniec podprogramu, powrót do programu wywołującego (M99)"); break;
        default: desc.push(`M${fmt(m)}`);
      }
    }

    // Cykl stały: definicja albo powtórzenie w nowym punkcie
    if (cycleCode !== null) {
      const zv = get("Z"), rv = get("R");
      if (zv === undefined || rv === undefined) {
        errors.push(`Cykl G${cycleCode} wymaga Z (dno otworu) i R (płaszczyzna startu).`);
      } else {
        s.cycle = {
          code: cycleCode,
          z: s.absolute ? zv : state.pos.z + zv,
          r: s.absolute ? rv : state.pos.z + rv,
          q: get("Q") ?? null,
          p: get("P") ?? null,
          f: get("F") ?? s.feed,
          retract: cycleRetract,
          initialZ: state.pos.z,
        };
        if (s.cycle.f) s.feed = s.cycle.f;
      }
    }

    // Współrzędne biegunowe (G16): X — promień, Y — kąt; środek w zerze układu (G90) albo w bieżącym punkcie (G91).
    const polarize = (t: Vec3) => {
      if (!s.polar || dia || s.plane !== 17) return;
      const r0 = get("X"), a0 = get("Y");
      if (r0 === undefined && a0 === undefined) return;
      // G90: środek w zerze układu, promień i kąt absolutne. G91: kąt narasta od poprzedniego, środek w bieżącym punkcie.
      const r = r0 ?? s.polar.r;
      const a = a0 !== undefined ? (s.absolute ? a0 : s.polar.a + a0) : s.polar.a;
      s.polar = { r, a };
      const cx = s.absolute ? 0 : state.prog.x, cy = s.absolute ? 0 : state.prog.y;
      t.x = cx + r * Math.cos((a * Math.PI) / 180);
      t.y = cy + r * Math.sin((a * Math.PI) / 180);
    };

    // Tokarka, system A: cykl pojedynczy G90 / G92 / G94 — każdy blok z adresem osi to cały cykl
    // (dojazd, skrawanie, wycofanie, powrót do punktu startu). Pominięte osie biorą wartość z poprzedniego cyklu.
    const lc = s.lcycle;
    const lcAxis = ["X", "Z", "U", "W"].some((l) => get(l) !== undefined);
    if (latheA && lc && lcAxis) {
      const st0 = { ...state.pos };
      const progEnd: Vec3 = { ...lc.end };
      const X = get("X"), Z = get("Z"), U = get("U"), W = get("W");
      if (X !== undefined) progEnd.x = s.absolute ? X : state.prog.x + X; else if (U !== undefined) progEnd.x = state.prog.x + U;
      if (Z !== undefined) progEnd.z = s.absolute ? Z : state.prog.z + Z; else if (W !== undefined) progEnd.z = state.prog.z + W;
      const R = get("R") ?? (X === undefined && Z === undefined && U === undefined && W === undefined ? lc.r : 0);
      const end: Vec3 = { ...progEnd }; applyFrames(end, s);
      const P = (x: number, z: number): Vec3 => ({ ...st0, x, z });
      if (s.feed === null) errors.push(`Cykl G${lc.code} bez posuwu F.`);
      const segs: Segment[] = [];
      if (lc.code === 94) {
        segs.push({ kind: "rapid", from: st0, to: P(st0.x, end.z + R), line: index });
        segs.push({ kind: "linear", from: P(st0.x, end.z + R), to: P(end.x, end.z), line: index });
        segs.push({ kind: "linear", from: P(end.x, end.z), to: P(end.x, st0.z), line: index });
        segs.push({ kind: "rapid", from: P(end.x, st0.z), to: st0, line: index });
        desc.push(`Cykl G94: planowanie do X${fmt(end.x * 2)} Z${fmt(end.z)} i powrót do punktu startu`);
      } else {
        const thread = lc.code === 92;
        segs.push({ kind: "rapid", from: st0, to: P(end.x + R, st0.z), line: index });
        segs.push({ kind: "linear", from: P(end.x + R, st0.z), to: P(end.x, end.z), line: index });
        segs.push({ kind: thread ? "rapid" : "linear", from: P(end.x, end.z), to: P(st0.x, end.z), line: index });
        segs.push({ kind: "rapid", from: P(st0.x, end.z), to: st0, line: index });
        desc.push(thread
          ? `Cykl G92: przejście gwintu na średnicy X${fmt((end.x + R) * 2)}${R ? `→${fmt(end.x * 2)}` : ""} do Z${fmt(end.z)}, skok F${fmt(s.feed ?? 0)}`
          : `Cykl G90: toczenie na średnicę X${fmt(end.x * 2)} do Z${fmt(end.z)}${R ? ` (stożek R${fmt(R)})` : ""} i powrót do punktu startu`);
      }
      segments.push(...segs);
      s.lcycle = { ...lc, end: progEnd, r: R };
      s.pos = st0; s.prog = { ...state.prog };
      record({ index, raw, words, comment, segments, state: s, description: desc.filter(Boolean).join(" · "), errors });
      allSegments.push(...segments);
      state = s;
      return;
    }

    const cyc = s.cycle;
    const hasXY = get("X") !== undefined || get("Y") !== undefined;
    if (cyc && (cycleCode !== null || hasXY)) {
      const progTarget: Vec3 = { ...state.prog };
      (["x", "y"] as const).forEach((ax) => {
        const v = get(ax.toUpperCase());
        if (v !== undefined) progTarget[ax] = s.absolute ? v : state.prog[ax] + v;
      });
      polarize(progTarget);
      const target: Vec3 = { ...progTarget };
      applyFrames(target, s);
      const segs = cycleSegments(state.pos, target, cyc, index);
      segments.push(...segs);
      s.pos = segs.length ? segs[segs.length - 1].to : state.pos;
      s.prog = { ...progTarget, z: s.pos.z };
      desc.push(cycleDescription(cyc, target, dia));
      if (cyc.p) dwellMs += cyc.p;
      record({ index, raw, words, comment, segments, state: s, description: desc.filter(Boolean).join(" · "), errors });
      allSegments.push(...segments);
      state = s;
      return;
    }

    // Osie obrotowe A/B/C: zapamiętujemy kąt (G90 — bezwzględnie, G91 — przyrost) i opisujemy ruch.
    // Tor w symulatorze jest liczony dla osi liniowych; obrót stołu nie zmienia jeszcze geometrii.
    if (!gs.includes(4) && !gs.includes(65) && !gs.includes(10) && !kwTrans && !kwOther) {
      const rot: { a?: number; b?: number; c?: number } = { ...(state.rotary ?? {}) };
      const moved: string[] = [];
      for (const ax of ["a", "b", "c"] as const) {
        const v = get(ax.toUpperCase());
        if (v === undefined) continue;
        rot[ax] = s.absolute ? v : (rot[ax] ?? 0) + v;
        moved.push(`${ax.toUpperCase()}${fmt(rot[ax]!)}°`);
      }
      if (moved.length) { s.rotary = rot; desc.push(`Oś obrotowa: ${moved.join(" ")}`); }
    }

    // Bloki ustawiające układ współrzędnych albo rejestry nie wykonują ruchu,
    // mimo że zawierają adresy osi. W G04 adres X to czas postoju, nie oś.
    const noMotion = !!kwTrans || !!kwOther || gs.some((g) => g === 4 || g === 52 || g === 68 || g === 10 || g === 92 || g === 65 || g === 22 || (dia && g >= 70 && g <= 76 && g !== 73));

    // Ruch
    // Pełny okrąg zapisuje się samym wektorem I/J/K, bez współrzędnych końcowych —
    // taki blok też musi wygenerować ruch.
    const arcWords = words.some((w) => "IJK".includes(w.letter));
    const isArcMode = s.motion === 2 || s.motion === 3;
    // Tokarka: U i W to przyrosty X i Z (U w średnicy — przeliczone wyżej na promień).
    const uw = dia && (get("U") !== undefined || get("W") !== undefined);
    const hasAxis = !noMotion && (["X", "Y", "Z"].some((l) => get(l) !== undefined) || uw || (isArcMode && arcWords));
    if (hasAxis) {
      const progTarget: Vec3 = { ...state.prog };
      (["x", "y", "z"] as const).forEach((ax) => {
        const v = get(ax.toUpperCase());
        if (v !== undefined) progTarget[ax] = s.absolute ? v : state.prog[ax] + v;
      });
      if (dia) {
        const u = get("U"), w = get("W");
        if (u !== undefined) progTarget.x = state.prog.x + u;
        if (w !== undefined) progTarget.z = state.prog.z + w;
      }
      polarize(progTarget);
      const target: Vec3 = { ...progTarget };
      applyFrames(target, s);
      const from = { ...state.pos };
      // G53: współrzędne maszynowe nie są znane — pokazujemy bezpieczny odjazd w górę, bez ruchu w płaszczyźnie.
      if (gs.includes(53)) {
        target.x = from.x; target.y = from.y;
        target.z = dia ? from.z : Math.max(from.z, 50);
        if (dia) { target.x = Math.max(from.x, target.x); }
        progTarget.x = state.prog.x; progTarget.y = state.prog.y; progTarget.z = state.prog.z + (target.z - from.z);
      }
      // G27/G28/G29/G30/G53 — jednorazowo ruchem szybkim; G31 — jednorazowo jak G01.
      const g28 = gs.some((g) => g === 27 || g === 28 || g === 29 || g === 30 || g === 53);
      const g31 = gs.includes(31);
      if (s.motion === null && !g28 && !g31) {
        errors.push("Brak aktywnej funkcji ruchu (G00/G01/G02/G03).");
      } else if (s.motion === 0 || g28) {
        segments.push({ kind: "rapid", from, to: target, line: index });
        desc.push(`Szybki dojazd do ${pt(target, s.plane, dia)}`);
      } else if (s.motion === 1 || g31) {
        if (s.feed === null) errors.push("G01 bez posuwu F.");
        segments.push({ kind: "linear", from, to: target, line: index });
        desc.push(`Ruch liniowy do ${pt(target, s.plane, dia)}${s.feed ? ` z posuwem F${fmt(s.feed)}` : ""}`);
      } else {
        const cw = s.motion === 2;
        const center = arcCenter(from, target, words, s.plane, cw, errors);
        if (center) {
          segments.push({ kind: "arc", from, to: target, center, cw, plane: s.plane, line: index });
          const [a, b] = planeAxes(s.plane);
          const r = Math.hypot(from[a] - center[a], from[b] - center[b]);
          desc.push(`Łuk ${cw ? "zgodnie" : "przeciwnie"} z ruchem wskazówek do ${pt(target, s.plane, dia)}, R=${fmt(r)}`);
        }
      }
      s.pos = target; s.prog = progTarget;
    } else if (s.motion !== null && gs.some((g) => g <= 3) && desc.length === 0) {
      desc.push(`Tryb ruchu G0${s.motion} (modalny)`);
    }

    if (desc.length === 0 && words.length === 0) desc.push(comment ? `Komentarz: ${comment}` : "");
    if (desc.length === 0 && words.length > 0 && words.every((w) => w.letter === "N" || w.letter === "O"))
      desc.push(words[0].letter === "O" ? `Program O${fmt(words[0].value)}` : "");

    record({ index, raw, words, comment, segments, state: s, description: desc.filter(Boolean).join(" · "), errors });
    allSegments.push(...segments);
    state = s;
  };

  const src = source.split(/\r?\n/);
  const clean = (l: string) => l.replace(/\([^)]*\)/g, "").replace(/;.*$/, "").toUpperCase();
  const isCall = (c: string) => /M0*98(?!\d)/.test(c);
  const latheCycle = (c: string) => c.match(/G0*(7[012456])(?!\d)/);
  const hasLatheCycle = dia && src.some((l) => latheCycle(clean(l)));
  if (!src.some((l) => isCall(clean(l))) && !hasLatheCycle) {
    src.forEach((raw, i) => step(raw, i));
  } else {
    // Podprogramy (Fanuc): bloki O…–M99 zapisane pod końcem programu głównego (M30/M02).
    // Wywołanie M98 P2000 L4 albo M98 P42000 (4 powtórzenia, program 2000).
    const endRe = /M0*(30|2)(?!\d)/, retRe = /M0*99(?!\d)/;
    const mainEnd = src.findIndex((l) => endRe.test(clean(l)));
    const subs = new Map<number, number>();
    src.forEach((l, i) => {
      const m = clean(l).match(/^\s*(?:N\d+\s*)?O0*(\d+)/);
      if (m && mainEnd >= 0 && i > mainEnd) subs.set(Number(m[1]), i);
    });
    const callErrors = new Map<number, string>();
    let guard = 0;

    // ---- Cykle tokarskie Fanuc: G71 (wzdłużny), G72 (poprzeczny), G70 (wykańczający) ----
    const skip = new Set<number>();
    const nIndex = new Map<number, number>();
    src.forEach((l, i) => { const m = clean(l).match(/^\s*N0*(\d+)/); if (m && !nIndex.has(Number(m[1]))) nIndex.set(Number(m[1]), i); });
    const depth: Record<number, { d: number; e: number }> = {};
    const num = (c: string, L: string) => { const m = c.match(new RegExp(`${L}\\s*(-?\\d*\\.?\\d+)`)); return m ? Number(m[1]) : undefined; };
    const profileRange = (c: string, i: number): [number, number] | null => {
      const pn = num(c, "P"), qn = num(c, "Q");
      const a = pn !== undefined ? nIndex.get(pn) : undefined, b = qn !== undefined ? nIndex.get(qn) : undefined;
      if (a === undefined || b === undefined || b < a) { callErrors.set(i, `Nie znaleziono bloków konturu N${pn ?? "?"}–N${qn ?? "?"}.`); return null; }
      return [a, b];
    };
    // G74 (wiercenie osiowe / rowki czołowe) i G75 (rowki promieniowe): wcinanie z wycofaniem o R.
    const peckRetract: Record<number, number> = {};
    const peckCycle = (code: number, i: number, c: string, start: Vec3) => {
      const hasTarget = ["X", "U", "Z", "W"].some((L) => num(c, L) !== undefined);
      if (!hasTarget) { peckRetract[code] = Math.abs(num(c, "R") ?? 0.5); return; }
      const e = peckRetract[code] ?? 0.5;
      const xv = num(c, "X"), uv = num(c, "U"), zv = num(c, "Z"), wv = num(c, "W");
      const xEnd = xv !== undefined ? xv / 2 : uv !== undefined ? start.x + uv / 2 : start.x;
      const zEnd = zv !== undefined ? zv : wv !== undefined ? start.z + wv : start.z;
      const di = Math.abs(num(c, "P") ?? 0) / 1000, dk = Math.abs(num(c, "Q") ?? 0) / 1000;
      const out: Segment[] = [];
      const V = (x: number, z: number): Vec3 => ({ x, y: 0, z });
      const lin = (a: Vec3, b: Vec3): Segment => ({ kind: "linear", from: a, to: b, line: i });
      const rap = (a: Vec3, b: Vec3): Segment => ({ kind: "rapid", from: a, to: b, line: i });
      // oś wcinania: G74 — Z, G75 — X; oś przesuwu między wcięciami: druga
      const feedAx = code === 74 ? "z" : "x";
      const peck = code === 74 ? dk : di, shift = code === 74 ? di : dk;
      const s0 = feedAx === "z" ? start.x : start.z, s1 = feedAx === "z" ? xEnd : zEnd;
      const f0 = feedAx === "z" ? start.z : start.x, f1 = feedAx === "z" ? zEnd : xEnd;
      const dir = Math.sign(f1 - f0) || -1;
      const positions: number[] = [s0];
      if (shift > 1e-6 && Math.abs(s1 - s0) > 1e-6) { const sd = Math.sign(s1 - s0); let v = s0; while (Math.abs(s1 - v) > shift + 1e-9) { v += sd * shift; positions.push(v); } positions.push(s1); }
      else if (Math.abs(s1 - s0) > 1e-6) positions.push(s1);
      const P = (sv: number, fv: number) => (feedAx === "z" ? V(sv, fv) : V(fv, sv));
      let cur = { ...start };
      for (const sv of positions) {
        if (sv !== s0) { out.push(rap(cur, P(sv, f0))); cur = P(sv, f0); }
        let f = f0, from = f0;
        for (let guard2 = 0; guard2 < 500; guard2++) {
          const nf = peck > 1e-6 ? (dir < 0 ? Math.max(f1, f + dir * peck) : Math.min(f1, f + dir * peck)) : f1;
          out.push(lin(P(sv, from), P(sv, nf)));
          if (Math.abs(nf - f1) < 1e-9) break;
          out.push(rap(P(sv, nf), P(sv, nf - dir * e)));
          from = nf - dir * e; f = nf;
        }
        out.push(rap(P(sv, f1), P(sv, f0)));
        cur = P(sv, f0);
      }
      out.push(rap(cur, { ...start }));
      allSegments.push(...out);
      const le = lineMap.get(i);
      if (le) { le.segments.push(...out); le.description += ` · ${positions.length} ${positions.length > 1 ? "pozycje" : "pozycja"}, wcinanie do ${feedAx === "z" ? `Z${fmt(zEnd)}` : `X${fmt(xEnd * 2)}`}, wejścia po ${fmt(peck)} mm`; }
      state = { ...state, pos: { ...start }, prog: { ...start } };
    };

    // G76 — cykl gwintowania (zapis dwublokowy Fanuc). Wejścia o stałym przekroju wióra: głębokość · √n.
    let thr = { m: 1, a: 60, dmin: 0.05, d: 0.05 };
    const threadCycle = (i: number, c: string, start: Vec3) => {
      const hasTarget = ["X", "U", "Z", "W"].some((L) => num(c, L) !== undefined);
      if (!hasTarget) {
        const pm = c.match(/P\s*(\d+)/);
        if (pm) { const d6 = pm[1].padStart(6, "0"); thr = { ...thr, m: Math.max(1, Number(d6.slice(0, 2))), a: Number(d6.slice(4, 6)) || 60 }; }
        const q = num(c, "Q"), r = num(c, "R");
        if (q !== undefined) thr.dmin = Math.abs(q) / 1000;
        if (r !== undefined) thr.d = Math.abs(r);
        return;
      }
      const xv = num(c, "X"), uv = num(c, "U"), zv = num(c, "Z"), wv = num(c, "W");
      const root = xv !== undefined ? xv / 2 : uv !== undefined ? start.x + uv / 2 : start.x;
      const zEnd = zv !== undefined ? zv : wv !== undefined ? start.z + wv : start.z;
      const k = Math.abs(num(c, "P") ?? 0) / 1000, d1 = Math.abs(num(c, "Q") ?? 0) / 1000;
      // Gwint wewnętrzny: średnica z bloku (dno bruzdy) większa niż punkt startowy — nóż wchodzi na zewnątrz.
      const inner = root > start.x;
      const crest = inner ? root - k : root + k, tanA = Math.tan(((thr.a || 60) / 2) * Math.PI / 180);
      const out: Segment[] = [];
      const V = (x: number, z: number): Vec3 => ({ x, y: 0, z });
      const depths: number[] = [];
      let prev = 0;
      for (let n = 1; n < 100 && d1 > 0; n++) {
        let dn = d1 * Math.sqrt(n);
        if (dn - prev < thr.dmin) dn = prev + thr.dmin;
        if (dn >= k - thr.d - 1e-9) break;
        depths.push(dn); prev = dn;
      }
      depths.push(Math.max(0, k - thr.d));
      for (let j = 0; j < thr.m; j++) depths.push(k);
      let cur = { ...start };
      for (const dn of depths) {
        const sh = dn * tanA, r = inner ? crest + dn : crest - dn;
        out.push({ kind: "rapid", from: cur, to: V(r, start.z + sh), line: i });
        out.push({ kind: "linear", from: V(r, start.z + sh), to: V(r, zEnd + sh), line: i });
        out.push({ kind: "rapid", from: V(r, zEnd + sh), to: V(start.x, zEnd + sh), line: i });
        out.push({ kind: "rapid", from: V(start.x, zEnd + sh), to: V(start.x, start.z), line: i });
        cur = V(start.x, start.z);
      }
      allSegments.push(...out);
      const le = lineMap.get(i);
      if (le) { le.segments.push(...out); le.description += ` · ${depths.length} przejść, rdzeń Ø${fmt(root * 2)}, wysokość zwoju ${fmt(k)} mm`; }
      state = { ...state, pos: { ...start }, prog: { ...start } };
    };

    const latheCycleAt = (code: number, i: number, c: string) => {
      const start = { ...state.pos };
      if (code === 74 || code === 75) { peckCycle(code, i, c, start); return; }
      if (code === 76) { threadCycle(i, c, start); return; }
      if (code !== 70 && num(c, "P") === undefined) {
        // pierwszy blok: głębokość skrawania (G71 U, G72 W) i wycofanie R
        const d = num(c, code === 71 ? "U" : "W"), e = num(c, "R");
        if (d !== undefined) depth[code] = { d: Math.abs(d), e: Math.abs(e ?? 0.5) };
        return;
      }
      const range = profileRange(c, i);
      if (!range) return;
      const [a, b] = range;
      if (code === 70) {
        for (let k = a; k <= b; k++) step(src[k], k);
        const back: Segment = { kind: "rapid", from: { ...state.pos }, to: { ...start }, line: i };
        allSegments.push(back);
        lineMap.get(i)?.segments.push(back);
        state = { ...state, pos: { ...start }, prog: { ...start } };
        return;
      }
      for (let k = a; k <= b; k++) skip.add(k);
      // kontur: przebieg na próbę, bez zmiany stanu
      const snap = state, sec = seconds, dw = dwellMs, len = allSegments.length;
      for (let k = a; k <= b; k++) step(src[k], k);
      const prof = allSegments.slice(len);
      state = snap; seconds = sec; dwellMs = dw; allSegments.length = len;
      for (let k = a; k <= b; k++) lineMap.delete(k);
      const dd = depth[code] ?? { d: 2, e: 0.5 };
      const du = (num(c, "U") ?? 0) / 2, dw2 = num(c, "W") ?? 0;
      // kontur jako łamana (z, r) przesunięta o naddatki
      const pts: { z: number; r: number }[] = [];
      const push = (z: number, r: number) => pts.push({ z: z + dw2, r: r + du });
      // Pierwszy blok konturu (ns) to dojazd A → A' w jednej osi — nie należy do obszaru skrawania.
      if (prof.length) push(prof[0].to.z, prof[0].to.x);
      for (const sg of prof.slice(1)) {
        if (sg.kind === "arc") {
          const cz = sg.center.z, cr = sg.center.x, rad = Math.hypot(sg.from.z - cz, sg.from.x - cr);
          const a0 = Math.atan2(sg.from.x - cr, sg.from.z - cz), a1 = Math.atan2(sg.to.x - cr, sg.to.z - cz);
          let sw = a1 - a0;
          if (sg.cw) { while (sw >= 0) sw -= 2 * Math.PI; } else { while (sw <= 0) sw += 2 * Math.PI; }
          for (let t = 1; t <= 12; t++) { const an = a0 + (sw * t) / 12; push(cz + rad * Math.cos(an), cr + rad * Math.sin(an)); }
        } else if (sg.kind !== "dwell") push(sg.to.z, sg.to.x);
      }
      if (pts.length < 2) return;
      const out: Segment[] = [];
      const P = (z: number, r: number): Vec3 => ({ x: r, y: 0, z });
      const lin = (from: Vec3, to: Vec3): Segment => ({ kind: "linear", from, to, line: i });
      const rap = (from: Vec3, to: Vec3): Segment => ({ kind: "rapid", from, to, line: i });
      let cur = { ...start };
      const cross = (axis: "z" | "r", v: number) => {
        for (let k = 0; k < pts.length - 1; k++) {
          const p = pts[k], q = pts[k + 1];
          const lo = Math.min(p[axis], q[axis]), hi = Math.max(p[axis], q[axis]);
          if (v >= lo - 1e-9 && v <= hi + 1e-9 && Math.abs(q[axis] - p[axis]) > 1e-9) {
            const t = (v - p[axis]) / (q[axis] - p[axis]);
            return axis === "r" ? p.z + t * (q.z - p.z) : p.r + t * (q.r - p.r);
          }
        }
        return null;
      };
      let passes = 0;
      if (code === 71) {
        // Wytaczanie: kontur leży dalej od osi niż punkt startowy — warstwy idą na zewnątrz.
        const inner = pts.reduce((a, p) => a + p.r, 0) / pts.length > start.x;
        const rlim = inner ? Math.max(...pts.map((p) => p.r)) : Math.min(...pts.map((p) => p.r));
        const sg = inner ? 1 : -1;
        for (let k = 1; k < 200; k++) {
          const rl = start.x + sg * k * dd.d;
          if (inner ? rl >= rlim - 1e-6 : rl <= rlim + 1e-6) break;
          const zEnd = cross("r", rl);
          if (zEnd === null) continue;
          out.push(rap(cur, P(start.z, rl)));
          out.push(lin(P(start.z, rl), P(zEnd, rl)));
          out.push(lin(P(zEnd, rl), P(zEnd + dd.e, rl - sg * dd.e)));
          out.push(rap(P(zEnd + dd.e, rl - sg * dd.e), P(start.z, rl - sg * dd.e)));
          cur = P(start.z, rl - sg * dd.e);
          passes++;
        }
      } else {
        const zmin = Math.min(...pts.map((p) => p.z));
        for (let k = 1; k < 200; k++) {
          const zl = start.z - k * dd.d;
          if (zl <= zmin + 1e-6) break;
          const rEnd = cross("z", zl);
          if (rEnd === null) continue;
          out.push(rap(cur, P(zl, start.x)));
          out.push(lin(P(zl, start.x), P(zl, rEnd)));
          out.push(lin(P(zl, rEnd), P(zl + dd.e, rEnd + dd.e)));
          out.push(rap(P(zl + dd.e, rEnd + dd.e), P(zl + dd.e, start.x)));
          cur = P(zl + dd.e, start.x);
          passes++;
        }
      }
      // przejście po konturze z naddatkiem i powrót do punktu startowego
      out.push(rap(cur, P(pts[0].z, pts[0].r)));
      for (let k = 1; k < pts.length; k++) out.push(lin(P(pts[k - 1].z, pts[k - 1].r), P(pts[k].z, pts[k].r)));
      out.push(rap(P(pts[pts.length - 1].z, pts[pts.length - 1].r), { ...start }));
      allSegments.push(...out);
      const le = lineMap.get(i);
      if (le) { le.segments.push(...out); le.description += ` · ${passes} przejść zgrubnych i przejście po konturze z naddatkiem`; }
      state = { ...state, pos: { ...start }, prog: { ...start } };
    };
    const run = (from: number, depth: number): boolean => {
      for (let i = from; i < src.length; i++) {
        if (++guard > 20000) return true;
        if (skip.has(i)) continue;
        step(src[i], i);
        const c = clean(src[i]);
        const lc = hasLatheCycle ? latheCycle(c) : null;
        if (lc) latheCycleAt(Number(lc[1]), i, c);
        if (retRe.test(c)) return true;
        if (depth === 0 && endRe.test(c)) return true;
        if (isCall(c)) {
          const p = c.match(/P(\d+)/), l = c.match(/L(\d+)/);
          let num = p ? Number(p[1]) : NaN, count = l ? Number(l[1]) : 1;
          if (p && p[1].length > 4 && !l) { count = Number(p[1].slice(0, -4)); num = Number(p[1].slice(-4)); }
          const target = subs.get(num);
          if (target === undefined) callErrors.set(i, `Brak podprogramu O${Number.isNaN(num) ? "?" : num} pod końcem programu (M30).`);
          else if (depth >= 4) callErrors.set(i, "Za głębokie zagnieżdżenie podprogramów.");
          else for (let k = 0; k < Math.max(1, count); k++) if (!run(target + 1, depth + 1)) callErrors.set(target, "Podprogram bez M99.");
        }
      }
      return depth === 0;
    };
    run(0, 0);
    // Linie niewykonane (np. nieużyty podprogram) — tylko opis i błędy, bez ruchu i bez zmiany stanu.
    src.forEach((raw, i) => {
      if (lineMap.has(i)) return;
      const snap = state, sec = seconds, dw = dwellMs, len = allSegments.length;
      step(raw, i);
      state = snap; seconds = sec; dwellMs = dw; allSegments.length = len;
      const e = lineMap.get(i); if (e) e.segments = [];
    });
    callErrors.forEach((msg, i) => lineMap.get(i)?.errors.push(msg));
  }
  lines.push(...[...lineMap.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]));

  for (const sg of allSegments) {
    const len = segmentLength(sg);
    if (sg.kind === "rapid") seconds += (len / rapidRate) * 60;
    else {
      const ln = lines[sg.line];
      let f = ln?.state.feed ?? 200;
      if (ln?.state.feedMode === 95) {
        // Przy G96 obroty zależą od średnicy: n = 1000 · vc / (π · D), ograniczone przez G50.
        const css = ln.state.css;
        const d = Math.max(1, Math.abs(sg.from.x) + Math.abs(sg.to.x)); // średnia średnica (x to promień)
        const rpm = css ? Math.min(ln.state.maxRpm ?? 4000, (1000 * css) / (Math.PI * d)) : (ln.state.spindle ?? 1000);
        f = f * rpm;
      }
      seconds += (len / Math.max(1, f)) * 60;
    }
  }
  seconds += dwellMs / 1000;

  // Pierwszy ruch programu to pozycjonowanie z nieznanego miejsca (baza maszyny).
  // Rysowanie go jako odcinka z punktu (0,0,0) sugerowałoby przejazd przez detal.
  const first = allSegments[0];
  if (first && first.kind === "rapid" && Math.abs(first.from.x) < 1e-9 && Math.abs(first.from.y) < 1e-9 && Math.abs(first.from.z) < 1e-9) {
    allSegments.shift();
    const l = lines[first.line];
    if (l) l.segments = l.segments.filter((sg) => sg !== first);
  }

  const bounds = computeBounds(allSegments);
  return { lines, segments: allSegments, bounds, seconds };
}

/** Odwrotność applyFrames — przelicza pozycję maszynową na współrzędne programu. */
export function inverseFrames(p: Vec3, s: MachineState): Vec3 {
  const q = { ...p };
  if (s.rot && Math.abs(s.rot.deg) > 1e-9) {
    const a = (-s.rot.deg * Math.PI) / 180;
    const dx = q.x - s.rot.cx, dy = q.y - s.rot.cy;
    q.x = s.rot.cx + dx * Math.cos(a) - dy * Math.sin(a);
    q.y = s.rot.cy + dx * Math.sin(a) + dy * Math.cos(a);
  }
  const f = frameShift(s);
  q.x -= f.x; q.y -= f.y; q.z -= f.z;
  return q;
}

/** Program → maszyna: przesunięcie układu (G54–G59/G54.1/G505), G52, G92, TRANS, potem obrót G68. */
export function applyFrames(p: Vec3, s: MachineState) {
  const f = frameShift(s);
  p.x += f.x; p.y += f.y; p.z += f.z;
  if (s.rot && Math.abs(s.rot.deg) > 1e-9) {
    const a = (s.rot.deg * Math.PI) / 180;
    const dx = p.x - s.rot.cx, dy = p.y - s.rot.cy;
    p.x = s.rot.cx + dx * Math.cos(a) - dy * Math.sin(a);
    p.y = s.rot.cy + dx * Math.sin(a) + dy * Math.cos(a);
  }
}

const CYCLE_NAME: Record<number, string> = {
  73: "wiercenie głębokie z krótkim wycofaniem (G73)",
  81: "wiercenie (G81)",
  82: "wiercenie z postojem na dnie (G82)",
  83: "wiercenie głębokie z pełnym wycofaniem (G83)",
  84: "gwintowanie (G84)",
  85: "wytaczanie z wyjściem na posuwie (G85)",
  86: "wytaczanie ze stopem wrzeciona (G86)",
  89: "wytaczanie z postojem (G89)",
};

function cycleDescription(c: CannedCycle, target: Vec3, dia: boolean) {
  const parts = [`Cykl: ${CYCLE_NAME[c.code] ?? `G${c.code}`} w X${fmt(dia ? target.x * 2 : target.x)} Y${fmt(target.y)}`];
  parts.push(`do Z${fmt(c.z)}, start od R${fmt(c.r)}`);
  if (c.q && (c.code === 83 || c.code === 73)) parts.push(`co Q${fmt(c.q)}`);
  if (c.p) parts.push(`postój ${fmt(c.p / 1000)} s`);
  parts.push(c.retract === 98 ? "powrót do punktu początkowego (G98)" : "powrót do R (G99)");
  return parts.join(", ");
}

/** Rozwija cykl stały na elementarne ruchy — tak jak robi to sterownik. */
function cycleSegments(from: Vec3, xy: Vec3, c: CannedCycle, line: number): Segment[] {
  const out: Segment[] = [];
  let cur: Vec3 = { ...from };
  const move = (to: Vec3, kind: "rapid" | "linear") => { out.push({ kind, from: { ...cur }, to: { ...to }, line }); cur = { ...to }; };

  // przejazd nad otwór na bieżącej wysokości
  if (xy.x !== cur.x || xy.y !== cur.y) move({ ...cur, x: xy.x, y: xy.y }, "rapid");
  // zjazd do płaszczyzny R
  if (cur.z !== c.r) move({ ...cur, z: c.r }, "rapid");

  const peck = c.q && c.q > 0 ? Math.abs(c.q) : null;
  if ((c.code === 83 || c.code === 73) && peck) {
    let z = c.r;
    while (z > c.z + 1e-6) {
      const next = Math.max(c.z, z - peck);
      move({ ...cur, z: next }, "linear");
      if (next <= c.z + 1e-6) break;
      // G83 wycofuje do R, G73 tylko o niewielką wartość
      move({ ...cur, z: c.code === 83 ? c.r : next + 1 }, "rapid");
      if (c.code === 83) move({ ...cur, z: next + 1 }, "rapid");
      z = next;
    }
  } else {
    move({ ...cur, z: c.z }, "linear");
  }

  // wyjście
  const backZ = c.retract === 98 ? c.initialZ : c.r;
  if (c.code === 84 || c.code === 85 || c.code === 89) move({ ...cur, z: backZ }, "linear");
  else move({ ...cur, z: backZ }, "rapid");
  return out;
}

function pt(p: Vec3, plane: Plane, dia = false) {
  const [a, b, c] = planeAxes(plane);
  const v = (k: keyof Vec3) => fmt(dia && k === "x" ? p[k] * 2 : p[k]);
  if (plane === 18) return `X${v("x")} Z${v("z")}`;
  return `${a.toUpperCase()}${v(a)} ${b.toUpperCase()}${v(b)} ${c.toUpperCase()}${v(c)}`;
}

function computeBounds(segments: Segment[]) {
  const min: Vec3 = { x: 0, y: 0, z: 0 };
  const max: Vec3 = { x: 0, y: 0, z: 0 };
  const add = (p: Vec3) => {
    (["x", "y", "z"] as const).forEach((k) => {
      min[k] = Math.min(min[k], p[k]);
      max[k] = Math.max(max[k], p[k]);
    });
  };
  for (const sg of segments) {
    add(sg.from); add(sg.to);
    if (sg.kind === "arc") {
      const [a, b] = planeAxes(sg.plane);
      const r = Math.hypot(sg.from[a] - sg.center[a], sg.from[b] - sg.center[b]);
      add({ ...sg.center, [a]: sg.center[a] - r, [b]: sg.center[b] - r });
      add({ ...sg.center, [a]: sg.center[a] + r, [b]: sg.center[b] + r });
    }
  }
  return { min, max };
}

/** Punkt na segmencie dla t∈[0,1] — do animacji. */
export function pointAt(sg: Segment, t: number): Vec3 {
  if (sg.kind !== "arc") {
    return {
      x: sg.from.x + (sg.to.x - sg.from.x) * t,
      y: sg.from.y + (sg.to.y - sg.from.y) * t,
      z: sg.from.z + (sg.to.z - sg.from.z) * t,
    };
  }
  const [a, b, c] = planeAxes(sg.plane);
  const { start, sweep, r } = arcParams(sg);
  const ang = start + sweep * t;
  const p: Vec3 = { x: 0, y: 0, z: 0 };
  p[a] = sg.center[a] + r * Math.cos(ang);
  p[b] = sg.center[b] + r * Math.sin(ang);
  p[c] = sg.from[c] + (sg.to[c] - sg.from[c]) * t;
  return p;
}

export function arcParams(sg: Extract<Segment, { kind: "arc" }>) {
  const [a, b] = planeAxes(sg.plane);
  const r = Math.hypot(sg.from[a] - sg.center[a], sg.from[b] - sg.center[b]);
  const start = Math.atan2(sg.from[b] - sg.center[b], sg.from[a] - sg.center[a]);
  const end = Math.atan2(sg.to[b] - sg.center[b], sg.to[a] - sg.center[a]);
  let sweep = end - start;
  const full = Math.abs(sg.from[a] - sg.to[a]) < 1e-9 && Math.abs(sg.from[b] - sg.to[b]) < 1e-9;
  if (sg.cw) {
    if (sweep >= -1e-9) sweep -= 2 * Math.PI;
  } else {
    if (sweep <= 1e-9) sweep += 2 * Math.PI;
  }
  if (full) sweep = sg.cw ? -2 * Math.PI : 2 * Math.PI;
  return { start, sweep, r };
}

export function segmentLength(sg: Segment) {
  if (sg.kind !== "arc") return Math.hypot(sg.to.x - sg.from.x, sg.to.y - sg.from.y, sg.to.z - sg.from.z);
  const { sweep, r } = arcParams(sg);
  return Math.abs(sweep) * r;
}

/**
 * Długość dla odtwarzacza i rysowania toru — geometryczna dla ruchu, a dla postoju (G04)
 * umowna wartość proporcjonalna do realnego czasu (40 jednostek/s, tyle co prędkość
 * odtwarzania ruchu roboczego), więc postój rzeczywiście trwa na animacji, zamiast
 * znikać jako odcinek zerowej długości. Nigdy nie używać do statystyk drogi/czasu —
 * do tego służy segmentLength + realny sg.seconds.
 */
export function playLength(sg: Segment) {
  if (sg.kind === "dwell") return Math.max(sg.seconds, 0.5) * 40;
  return segmentLength(sg);
}

export { planeAxes };
