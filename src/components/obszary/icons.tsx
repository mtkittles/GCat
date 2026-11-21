import type { ComponentType, ReactNode, SVGProps } from "react";
import { BookOpen, Box, FileCode2, LayoutGrid, ListChecks, SquareTerminal } from "lucide-react";

/*
  Ikony obszarów i działów (V3.0b): siatka 24 × 24, kreska 1,75, zaokrąglone końce — jak lucide w panelu bocznym.
  Dwubarwne: jeden element w klasie `a` (krawędź skrawająca, płytka w naroże, wiór…) dostaje kolor z --di-a;
  bez tej zmiennej cała ikona jest w kolorze tekstu (panel boczny). Klasy `di-*` i elementy w środku służą
  krótkiemu ruchowi po najechaniu na kartę (technologia.css) — „ogranicz ruch” go wyłącza.
  Rowki freza przesuwa zagnieżdżony <svg> (przycina do swojego pola) — bez identyfikatorów clipPath.
*/
type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, className, children, ...rest }: P & { children: ReactNode }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false"
      className={`di${className ? ` ${className}` : ""}`} {...rest}>
      {children}
    </svg>
  );
}

/** Programowanie CNC: ekran sterowania z kursorem. */
export const IcoCnc = ({ className, ...p }: P) => (
  <Svg className={`di-cnc ${className ?? ""}`} {...p}>
    <rect x="3" y="4" width="18" height="13.5" rx="2.5" />
    <path d="m7 8.75 2.5 2.5L7 13.75" />
    <path className="a cr" d="M12 13.75h4.5" />
    <path d="M9 21h6M12 17.5V21" />
  </Svg>
);

/** Frez trzpieniowy: chwyt, część robocza z rowkami, ostrze czołowe (a). */
export const IcoMill = ({ className, ...p }: P) => (
  <Svg className={`di-mill ${className ?? ""}`} {...p}>
    <path d="M9.5 2h5v7h-5z" />
    <path d="M8.5 9h7v10.5a2.5 2.5 0 0 1-2.5 2.5h-2a2.5 2.5 0 0 1-2.5-2.5z" />
    <svg x="8.5" y="9" width="7" height="11" overflow="hidden">
      <g className="fl"><path d="M0 4.5 7 2M0 9l7-2.5M0 13.5 7 11M0 18l7-2.5" /></g>
    </svg>
    <path className="a" d="M8.5 19.5a2.5 2.5 0 0 0 2.5 2.5h2a2.5 2.5 0 0 0 2.5-2.5" />
  </Svg>
);

/** Toczenie: uchwyt, przedmiot, płytka noża (a). */
export const IcoTurn = ({ className, ...p }: P) => (
  <Svg className={`di-turn ${className ?? ""}`} {...p}>
    <path d="M2.5 5.5h4v13h-4z" />
    <path d="M6.5 9h12v6h-12z" />
    <path className="a tl" d="m14 20.5 2-4 2 4z" />
  </Svg>
);

/** Płytka ISO: romb 80° z otworem; naroże pracujące (a) — po najechaniu płytka obraca się na drugie naroże. */
export const IcoInsert = ({ className, ...p }: P) => (
  <Svg className={`di-ins ${className ?? ""}`} {...p}>
    <g className="ix">
      <path d="M2.5 12 12 4.1 21.5 12 12 19.9z" />
      <path className="a" d="M5.3 9.7 2.5 12l2.8 2.3" />
      <circle cx="12" cy="12" r="2.6" />
    </g>
  </Svg>
);

/** Obliczenia: średnica ⌀ (a) i obracający się przedmiot z karbem. */
export const IcoCalc = ({ className, ...p }: P) => (
  <Svg className={`di-calc ${className ?? ""}`} {...p}>
    <g className="rt"><circle cx="12" cy="12" r="7.5" /><path d="M12 4.5V7" /></g>
    <path className="a" d="M4.5 19.5 19.5 4.5" />
  </Svg>
);

/** Proces skrawania: materiał, nóż i zwijający się wiór (a). */
export const IcoChip = ({ className, ...p }: P) => (
  <Svg className={`di-chip ${className ?? ""}`} {...p}>
    <path d="M11 14H2.5v7.5h19V17h-8" />
    <path d="m13.5 17-2.5-3 1.5-10h5z" />
    <path className="a cp" d="M11 14c-2.2-.8-4.5-2.6-4.5-5.4a2.4 2.4 0 0 1 4.8 0c0 1.4-1.3 2-2.2 1.3" />
  </Svg>
);

/** Mocowanie: czoło wrzeciona, oprawka ze stożkiem i narzędzie (a). */
export const IcoHolder = ({ className, ...p }: P) => (
  <Svg className={`di-hold ${className ?? ""}`} {...p}>
    <path d="M4.5 2.5h15" />
    <g className="ho">
      <path d="M7.5 4.5h9L15 10.5H9z" />
      <path d="M7 10.5h10v3H7z" />
      <path className="a" d="M10.5 13.5h3V22h-3z" />
    </g>
  </Svg>
);

/** Materiały: kostka; ściana górna (a) rozjaśnia się po najechaniu. */
export const IcoCube = ({ className, ...p }: P) => (
  <Svg className={`di-mat ${className ?? ""}`} {...p}>
    <path d="M12 2.5 20.5 7.3v9.4L12 21.5l-8.5-4.8V7.3z" />
    <path d="M12 12v9.5M12 12l8.5-4.7M12 12 3.5 7.3" />
    <path className="a fc" d="M12 12l8.5-4.7L12 2.5 3.5 7.3z" />
  </Svg>
);

/** Strategie: tor narzędzia (a) nad materiałem. */
export const IcoPath = ({ className, ...p }: P) => (
  <Svg className={`di-str ${className ?? ""}`} {...p}>
    <path d="M3 20.5h18" />
    <path className="a pt" d="M4 16.5c2-6 4-6 5-2s2 4 4-1 3-5 4-1 2 3 3 1" />
  </Svg>
);

/** Pomiar i jakość: suwmiarka; szczęka przesuwna (a). */
export const IcoCaliper = ({ className, ...p }: P) => (
  <Svg className={`di-cal ${className ?? ""}`} {...p}>
    <path d="M2.5 5.5h19v4h-19z" />
    <path d="M4.5 9.5v9l3-2.5V9.5" />
    <g className="jw"><path className="a" d="M14.5 9.5v9l3-2.5V9.5" /></g>
    <path d="M7 5.5v2M10 5.5v2M13 5.5v2M16 5.5v2M19 5.5v2" />
  </Svg>
);

/** Kody G i M: kartka programu; podświetlony blok (a). */
export const IcoCode = ({ className, ...p }: P) => (
  <Svg className={`di-code ${className ?? ""}`} {...p}>
    <path d="M5.5 2.5h9L19 7v14.5H5.5z" />
    <path d="M14.5 2.5V7H19" />
    <path d="M8.5 10.5h5M8.5 18h4" />
    <path className="a" d="M8.5 14.25h7.5" />
  </Svg>
);

/** Symulator: półfabrykat w rzucie izometrycznym i tor narzędzia na górnej ścianie (a). */
export const IcoSim = ({ className, ...p }: P) => (
  <Svg className={`di-sim ${className ?? ""}`} {...p}>
    <path d="M3 9.5 12 5l9 4.5v7L12 21l-9-4.5z" />
    <path d="M3 9.5 12 14l9-4.5M12 14v7" />
    <path className="a" d="M7.5 9.5 12 7.25l4.5 2.25L12 11.75z" />
  </Svg>
);

/** Kalkulatory: wyświetlacz, klawisze; klawisz wyniku (a). */
export const IcoCalculator = ({ className, ...p }: P) => (
  <Svg className={`di-calcu ${className ?? ""}`} {...p}>
    <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
    <path d="M8.5 6.5h7" />
    <path d="M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M8.5 18h.01M12 18h.01" />
    <path className="a" d="M15.5 14.5V18" />
  </Svg>
);

/** Słownik: otwarta książka z zakładką (a). */
export const IcoBook = ({ className, ...p }: P) => (
  <Svg className={`di-book ${className ?? ""}`} {...p}>
    <path d="M12 6.5C10 5 7 4.5 3 4.5v14c4 0 7 .5 9 2 2-1.5 5-2 9-2v-14c-4 0-7 .5-9 2z" />
    <path d="M12 6.5v14" />
    <path className="a" d="M15.5 5.1V10l1.5-1 1.5 1V4.8" />
  </Svg>
);

/** Ikony działów Technologii po polu `icon` z content/technologia/dzialy.yaml. */
export const DZIAL_ICO: Record<string, ComponentType<P>> = {
  frez: IcoMill, plytka: IcoInsert, wzory: IcoCalc, proces: IcoChip, mocowanie: IcoHolder, materialy: IcoCube, strategie: IcoPath,
};

export const OBSZAR_ICO = { cnc: IcoCnc, tech: IcoMill, pomiar: IcoCaliper } as const;

/** Ikony węzłów drzewa (src/lib/obszary.ts → `icon`): strony Programowania z lucide jak dotąd, działy Technologii — własne. */
export const NODE_ICO: Record<string, ComponentType<{ className?: string }>> = {
  nauka: BookOpen, kody: SquareTerminal, symulator: Box, zadania: ListChecks, programy: FileCode2, przeglad: LayoutGrid,
  ...DZIAL_ICO,
};
