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
  | { t: "widget"; id: "rij" | "arc-angle" };

export interface Article { blocks: Block[] }
