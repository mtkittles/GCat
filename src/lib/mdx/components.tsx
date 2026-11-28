import type { ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import ArcCalc from "@/components/ArcCalc";
import { diagrams } from "@/components/diagrams";
import WzorView from "@/components/Wzor";
import DekoderIsoView from "@/components/DekoderISO";
import { progHash } from "@/lib/progHash";
import { FigEdit } from "@/components/edycja/EditMode";
import JogDemo from "@/components/lesson/JogDemo";
import { rich } from "@/components/Rich";
import RijCalc from "@/components/RijCalc";
import Rys from "@/components/rys/Rys";
import { rysBySlug } from "@/components/rys/registry";
import SimClient from "@/components/simulator/SimClient";
import SortTable from "@/components/ui/SortTable";
import Term from "@/components/ui/Term";
import { simHref, type SimLink } from "@/lib/simLink";

/*
  Komponenty dostępne w treści MDX (karty kodów). Każdy renderuje ten sam HTML co odpowiadający mu blok
  w Article.tsx — poza <Sim> i <Demo>: na karcie to animacja z przyciskiem „Otwórz w symulatorze”
  (paczka Z b, decyzja 7 audytu kart), a lekcje (Article.tsx) mają pełny warsztat jak dotąd. Istniejące komponenty strony (Term, rysunki,
  SimClient, kalkulatory) są tylko używane — bez zmian. Podpisy i tytuły (atrybuty) idą przez rich(),
  jak dziś; plugin remark sprawdza w nich markery [[…]] przy buildzie.
*/

type Mode = "mill" | "lathe";

/** <Diagram id="g01" /> — rysunek z rejestru diagrams.tsx (blok `diagram`). */
export function Diagram({ id }: { id: string }) {
  return <div>{diagrams[id]?.()}<FigEdit kind="diagram" id={id} /></div>;
}

/** <Rys id="nazwa" /> — rysunek z rysownika (content/rysunki/<nazwa>.yaml). */
export function RysBlock({ id }: { id: string }) {
  const fig = rysBySlug(id);
  return fig ? <div><Rys fig={fig} /><FigEdit kind="rys" id={id} /></div> : null;
}

/** <Obraz src="/rysunki/plik.png" alt="…" caption="…" /> — obraz wgrany przez Keystatic do public/rysunki/. */
export function Obraz({ src, alt, caption }: { src: string; alt?: string; caption?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- plik statyczny o nieznanych wymiarach, bez optymalizacji
  return <figure className="grid gap-1"><img src={src} alt={alt ?? ""} />{caption && <figcaption className="cap">{rich(caption)}</figcaption>}</figure>;
}

/** <Note kind="tip|warn|info">tekst</Note> (blok `note`). */
export function Note({ kind, children }: { kind: "tip" | "warn" | "info"; children?: ReactNode }) {
  return <div role="note" className={`note note-${kind}`}>{children}</div>;
}

/** <Code caption="…">```…```</Code> — program do przeczytania (blok `code`); `src` wstawia plugin z bloku ```. */
export function Code({ src, caption }: { src: string; caption?: string }) {
  return <figure className="grid gap-1"><pre tabIndex={0} className="syntax">{src}</pre>{caption && <figcaption className="cap">{rich(caption)}</figcaption>}</figure>;
}

/** <Sim mode caption>```…```</Sim> — edytowalny symulator (blok `sim`). Komponent symulatora bez zmian. */
export function Sim({ src, mode, caption, name }: { src: string; mode?: Mode; caption?: string; name?: string }) {
  // na karcie: animacja jak <Demo> + „Otwórz w symulatorze” (paczka Z b, decyzja 7 audytu kart); podpis pod animacją
  return (
    <figure className="grid gap-2 demo-fig" data-prog={progHash(src)}>
      <SimClient initial={src} mode={mode ?? "mill"} showcase autoplay="wide" controls editable={false} />
      <OpenInSim src={src} mode={mode ?? "mill"} name={name} />
      {caption && <figcaption className="cap">{rich(caption)}</figcaption>}
    </figure>
  );
}

/** <Demo mode title caption>```…```</Demo> — animacja bez edycji (blok `demo`). */
export function Demo({ src, mode, title, caption }: { src: string; mode?: Mode; title?: string; caption?: string }) {
  return (
    <figure className="grid gap-2 demo-fig" data-prog={progHash(src)}>
      {title && <figcaption className="demo-title">{rich(title)}</figcaption>}
      <SimClient initial={src} mode={mode ?? "mill"} showcase autoplay="wide" controls editable={false} />
      <OpenInSim src={src} mode={mode ?? "mill"} name={title} />
      {caption && <figcaption className="cap">{rich(caption)}</figcaption>}
    </figure>
  );
}

/** <Wzor f="…" legend="…" caption="…" kind? /> — wzór w ramce z legendą albo obliczenie (standard treści 2026-11-22). */
export function Wzor({ f, legend, caption, kind }: { f: string; legend?: string; caption?: string; kind?: string }) {
  return <WzorView f={f} legend={legend} caption={caption} kind={kind} />;
}

/** Przycisk „Otwórz w symulatorze” pod animacją — ten sam program w pełnym warsztacie (`/symulator?kod=…`). */
export function OpenInSim({ name, ...p }: SimLink) {
  return (
    <p className="sim-open">
      <a className="btn ghost" href={simHref({ ...p, name: name?.replace(/\[\[([^|\]]*\|)?([^\]]*)\]\]/g, "$2") })}>
        Otwórz w symulatorze <span aria-hidden>↗</span>
      </a>
      <span>edycja, widok 3D, narzędzia i materiał</span>
    </p>
  );
}

/** <DekoderISO kod="CNMG 120408" /> — oznaczenie płytki wg ISO 1832, klik w znak (blok `dekoderIso`, V3.2a). */
export function DekoderISO({ kod }: { kod?: string }) {
  return <DekoderIsoView kod={kod} />;
}

/** <Widget id="rij|arc|jog" /> (blok `widget`). */
export function Widget({ id }: { id: "rij" | "arc" | "jog" }) {
  return id === "jog" ? <JogDemo /> : <div id="kalkulator-zamiany-r-i-j">{id === "arc" ? <ArcCalc /> : <RijCalc />}</div>;
}

/** <Table caption="…"> wokół tabeli GFM (blok `table`); plugin owija nią każdą tabelę i dodaje klasy oraz data-label. Podpis nad tabelą (Z a).
    `sort="true"` — sortowanie kliknięciem w nagłówek kolumny (porównania w Technologii). */
export function Table({ caption, sort, children }: { caption?: string; sort?: string; children?: ReactNode }) {
  return <figure className="grid gap-1">{caption && <figcaption className="cap">{rich(caption)}</figcaption>}<div className="overflow-x-auto">{sort === "true" ? <SortTable>{children}</SortTable> : children}</div></figure>;
}

/** <Kolor k="g00|g01|g02|akcent|blad">tekst</Kolor> — wyróżnienie kolorem z gotowego zestawu (kolory ruchów jak w symulatorze). */
export function Kolor({ k, children }: { k: "g00" | "g01" | "g02" | "akcent" | "blad"; children?: ReactNode }) {
  return <span className={`kolor kolor-${k}`}>{children}</span>;
}

export const mdxComponents = { Term, Diagram, Rys: RysBlock, Obraz, Note, Code, Sim, Demo, Widget, Table, Kolor, Wzor, DekoderISO } satisfies MDXComponents;

export { componentNames, diagramIds } from "./names";
