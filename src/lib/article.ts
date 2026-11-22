export type Block =
  | { t: "p"; x: string }
  | { t: "h"; x: string; id?: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "note"; kind: "tip" | "warn" | "info"; x: string }
  | { t: "code"; x: string; caption?: string }
  | { t: "sim"; src: string; mode?: "mill" | "lathe"; caption?: string }
  /** Animacja: program po lewej, rysowany tor po prawej, w pętli. */
  | { t: "demo"; src: string; mode?: "mill" | "lathe"; title?: string; caption?: string }
  | { t: "table"; head: string[]; rows: string[][]; caption?: string }
  | { t: "diagram"; id: string }
  | { t: "widget"; id: "rij" | "arc" | "jog" }
  /** Wzór w ramce z legendą albo obliczenie (standard treści, jak <Wzor> w MDX): f — LaTeX, caption „A; B” — opis nad każdym wierszem. */
  | { t: "wzor"; f: string; legend?: string; caption?: string; kind?: "obliczenie" }
  /** Blok zwijany („Pokaż pomoc”): porównania, dodatkowe rzuty, rozwinięcia — domyślnie zamknięty (#80 §5). */
  | { t: "more"; title: string; blocks: Block[] };

/** Bloki z rozwinięciem zawartości bloków zwijanych — do audytów, wyszukiwarki i liczenia rysunków. */
export function flatBlocks(blocks: Block[]): Block[] {
  return blocks.flatMap((b) => (b.t === "more" ? flatBlocks(b.blocks) : [b]));
}

export interface Article { blocks: Block[] }
