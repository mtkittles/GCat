import type { ReactNode } from "react";
import type { MDXComponents } from "mdx/types";
import ArcCalc from "@/components/ArcCalc";
import { diagrams } from "@/components/diagrams";
import JogDemo from "@/components/lesson/JogDemo";
import { rich } from "@/components/Rich";
import RijCalc from "@/components/RijCalc";
import SimClient from "@/components/simulator/SimClient";
import Term from "@/components/ui/Term";

/*
  Komponenty dostępne w treści MDX. Każdy renderuje dokładnie ten sam HTML co odpowiadający mu blok
  w Article.tsx (test równości w tests/pilot.test.ts). Istniejące komponenty strony (Term, rysunki,
  SimClient, kalkulatory) są tylko używane — bez zmian. Podpisy i tytuły (atrybuty) idą przez rich(),
  jak dziś; plugin remark sprawdza w nich markery [[…]] przy buildzie.
*/

type Mode = "mill" | "lathe";

/** <Diagram id="g01" /> — rysunek z rejestru diagrams.tsx (blok `diagram`). */
export function Diagram({ id }: { id: string }) {
  return <div>{diagrams[id]?.()}</div>;
}

/** <Obraz src="/rysunki/plik.png" alt="…" caption="…" /> — obraz wgrany przez Keystatic do public/rysunki/. */
export function Obraz({ src, alt, caption }: { src: string; alt?: string; caption?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- plik statyczny o nieznanych wymiarach, bez optymalizacji
  return <figure className="grid gap-1"><img src={src} alt={alt ?? ""} />{caption && <figcaption className="cap">{rich(caption)}</figcaption>}</figure>;
}

/** <Note kind="tip|warn|info">tekst</Note> (blok `note`). */
export function Note({ kind, children }: { kind: "tip" | "warn" | "info"; children?: ReactNode }) {
  return <aside className={`note note-${kind}`}>{children}</aside>;
}

/** <Code caption="…">```…```</Code> — program do przeczytania (blok `code`); `src` wstawia plugin z bloku ```. */
export function Code({ src, caption }: { src: string; caption?: string }) {
  return <figure className="grid gap-1"><pre className="syntax">{src}</pre>{caption && <figcaption className="cap">{rich(caption)}</figcaption>}</figure>;
}

/** <Sim mode caption>```…```</Sim> — edytowalny symulator (blok `sim`). Komponent symulatora bez zmian. */
export function Sim({ src, mode, caption }: { src: string; mode?: Mode; caption?: string }) {
  return <figure className="grid gap-2">{caption && <figcaption className="cap">{rich(caption)}</figcaption>}<SimClient initial={src} mode={mode ?? "mill"} /></figure>;
}

/** <Demo mode title caption>```…```</Demo> — animacja bez edycji (blok `demo`). */
export function Demo({ src, mode, title, caption }: { src: string; mode?: Mode; title?: string; caption?: string }) {
  return (
    <figure className="grid gap-2 demo-fig">
      {title && <figcaption className="demo-title">{rich(title)}</figcaption>}
      <SimClient initial={src} mode={mode ?? "mill"} showcase autoplay editable={false} />
      {caption && <figcaption className="cap">{rich(caption)}</figcaption>}
    </figure>
  );
}

/** <Widget id="rij|arc|jog" /> (blok `widget`). */
export function Widget({ id }: { id: "rij" | "arc" | "jog" }) {
  return id === "jog" ? <JogDemo /> : <div id="kalkulator-zamiany-r-i-j">{id === "arc" ? <ArcCalc /> : <RijCalc />}</div>;
}

/** <Table caption="…"> wokół tabeli GFM (blok `table`); plugin owija nią każdą tabelę i dodaje klasy oraz data-label. */
export function Table({ caption, children }: { caption?: string; children?: ReactNode }) {
  return <figure className="grid gap-1"><div className="overflow-x-auto">{children}</div>{caption && <figcaption className="cap">{rich(caption)}</figcaption>}</figure>;
}

export const mdxComponents = { Term, Diagram, Obraz, Note, Code, Sim, Demo, Widget, Table } satisfies MDXComponents;

export { componentNames, diagramIds } from "./names";
