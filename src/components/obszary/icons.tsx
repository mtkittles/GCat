import type { ComponentType, ReactNode, SVGProps } from "react";
import { BookOpen, Box, FileCode2, LayoutGrid, ListChecks, SquareTerminal } from "lucide-react";

/*
  Ikony obszarów i działów (V3.0b, przerysowane w V3.1 do poziomu ikon doku): siatka 24 × 24, kreska 1,8,
  zaokrąglone końce, mało kresek i dużo światła w środku — jak lucide w doku i panelu.
  Akcent: jeden mały element w klasie `a` (ostrze, kursor, zakładka…) w kolorze --di-a (pomarańcz);
  bez tej zmiennej cała ikona jest w kolorze tekstu. Klasy `di-*` i elementy w środku służą krótkiemu ruchowi
  po najechaniu na kartę (obszary.css) — „ogranicz ruch” go wyłącza.
*/
type P = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, className, children, ...rest }: P & { children: ReactNode }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden focusable="false"
      className={`di${className ? ` ${className}` : ""}`} {...rest}>
      {children}
    </svg>
  );
}

/** Programowanie CNC: ekran sterowania, znak zachęty i kursor (a). */
export const IcoCnc = ({ className, ...p }: P) => (
  <Svg className={`di-cnc ${className ?? ""}`} {...p}>
    <rect x="3" y="4" width="18" height="13" rx="2.5" />
    <path d="m7.5 8.5 2.5 2-2.5 2" />
    <path className="a cr" d="M12.5 12.5h4" />
    <path d="M12 17v4M8.5 21h7" />
  </Svg>
);

/** Frez trzpieniowy: chwyt, część robocza z dwoma rowkami, ostrze czołowe (a). */
export const IcoMill = ({ className, ...p }: P) => (
  <Svg className={`di-mill ${className ?? ""}`} {...p}>
    <path d="M9.5 2.5h5V8h-5z" />
    <path d="M8 8h8v10a3.5 3.5 0 0 1-3.5 3.5h-1A3.5 3.5 0 0 1 8 18z" />
    <svg x="8" y="8" width="8" height="11" overflow="hidden">
      <g className="fl"><path d="M0 4.5 8 1.5M0 9.5l8-3M0 14.5l8-3" /></g>
    </svg>
    <path className="a" d="M10.5 21.5h3" />
  </Svg>
);

/** Toczenie: uchwyt, przedmiot, płytka noża (a). */
export const IcoTurn = ({ className, ...p }: P) => (
  <Svg className={`di-turn ${className ?? ""}`} {...p}>
    <rect x="2.5" y="5.5" width="4" height="13" rx="1" />
    <path d="M6.5 9.5h12.5a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H6.5" />
    <path className="a tl" d="m13 20.5 2-3.5 2 3.5z" />
  </Svg>
);

/** Płytka ISO: romb 80° z otworem; naroże pracujące (a) — po najechaniu płytka obraca się na drugie naroże. */
export const IcoInsert = ({ className, ...p }: P) => (
  <Svg className={`di-ins ${className ?? ""}`} {...p}>
    <g className="ix">
      <path d="M2.5 12 12 4.3 21.5 12 12 19.7z" />
      <circle cx="12" cy="12" r="2.4" />
      <path className="a" d="M5.4 9.6 2.5 12l2.9 2.4" />
    </g>
  </Svg>
);

/** Obliczenia: przedmiot z karbem i średnica ⌀ (a). */
export const IcoCalc = ({ className, ...p }: P) => (
  <Svg className={`di-calc ${className ?? ""}`} {...p}>
    <g className="rt"><circle cx="12" cy="12" r="8" /><path d="M12 4v2.5" /></g>
    <path className="a" d="M7 17 17 7" />
  </Svg>
);

/** Proces skrawania: powierzchnia, nóż i zwijający się wiór (a). */
export const IcoChip = ({ className, ...p }: P) => (
  <Svg className={`di-chip ${className ?? ""}`} {...p}>
    <path d="M3 20h18" />
    <path d="M13.5 20 16 6h3.5L17 20" />
    <path className="a cp" d="M13.5 14c-3 .5-6-1-6-4a2.5 2.5 0 0 1 5 0c0 1.3-1.2 2-2.2 1.4" />
  </Svg>
);

/** Mocowanie: czoło wrzeciona, oprawka ze stożkiem i narzędzie (a). */
export const IcoHolder = ({ className, ...p }: P) => (
  <Svg className={`di-hold ${className ?? ""}`} {...p}>
    <path d="M5 3h14" />
    <g className="ho">
      <path d="M8 5.5h8L14.5 11h-5z" />
      <rect x="8" y="11" width="8" height="3" rx=".8" />
    </g>
    <path className="a" d="M12 14v7" />
  </Svg>
);

/** Materiały: kostka; krawędź wewnętrzna (a). */
export const IcoCube = ({ className, ...p }: P) => (
  <Svg className={`di-mat ${className ?? ""}`} {...p}>
    <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9z" />
    <path d="M12 12v9" />
    <path className="a fc" d="M4 7.5 12 12l8-4.5" />
  </Svg>
);

/** Strategie: tor narzędzia nad materiałem i narzędzie na końcu (a). */
export const IcoPath = ({ className, ...p }: P) => (
  <Svg className={`di-str ${className ?? ""}`} {...p}>
    <path d="M3 20.5h18" />
    <path className="pt" d="M4 16c2-5.5 4-5.5 5-2s2.5 3.5 4-1 3-4.5 4.5-1" />
    <circle className="a" cx="19.5" cy="13" r="1.5" />
  </Svg>
);

/** Pomiar i jakość: suwmiarka; szczęka przesuwna (a). */
export const IcoCaliper = ({ className, ...p }: P) => (
  <Svg className={`di-cal ${className ?? ""}`} {...p}>
    <rect x="2.5" y="4.5" width="19" height="4.5" rx="1" />
    <path d="M5 9v10l3-2.5V9" />
    <g className="jw"><path className="a" d="M14 9v10l3-2.5V9" /></g>
  </Svg>
);

/** Kody G i M: kartka programu; podświetlony blok (a). */
export const IcoCode = ({ className, ...p }: P) => (
  <Svg className={`di-code ${className ?? ""}`} {...p}>
    <path d="M6 2.5h8l4.5 4.5v14.5H6z" />
    <path d="M14 2.5V7h4.5" />
    <path d="M9 11h5M9 18.5h3.5" />
    <path className="a" d="M9 14.75h6.5" />
  </Svg>
);

/** Symulator: półfabrykat w rzucie izometrycznym i tor narzędzia na górnej ścianie (a). */
export const IcoSim = ({ className, ...p }: P) => (
  <Svg className={`di-sim ${className ?? ""}`} {...p}>
    <path d="M3 9.5 12 5l9 4.5v7L12 21l-9-4.5z" />
    <path d="M3 9.5 12 14l9-4.5M12 14v7" />
    <path className="a" d="M8 9.5 12 7.5l4 2-4 2z" />
  </Svg>
);

/** Kalkulatory: wyświetlacz, klawisze; klawisz wyniku (a). */
export const IcoCalculator = ({ className, ...p }: P) => (
  <Svg className={`di-calcu ${className ?? ""}`} {...p}>
    <rect x="5" y="2.5" width="14" height="19" rx="2.5" />
    <path d="M8.5 7h7" />
    <path d="M8.5 11.5h.01M12 11.5h.01M8.5 15h.01M12 15h.01M8.5 18.5h.01M12 18.5h.01" />
    <path className="a" d="M15.5 11.5v7" />
  </Svg>
);

/** Słownik: otwarta książka z zakładką (a). */
export const IcoBook = ({ className, ...p }: P) => (
  <Svg className={`di-book ${className ?? ""}`} {...p}>
    <path d="M12 6.5C10 5 7 4.5 3 4.5v14c4 0 7 .5 9 2 2-1.5 5-2 9-2v-14c-4 0-7 .5-9 2z" />
    <path d="M12 6.5v14" />
    <path className="a" d="M15.5 5.3V10l1.5-1.2 1.5 1.2V4.9" />
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
