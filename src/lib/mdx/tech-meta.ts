/* Wyliczane dane artykułu Technologii (bez dysku — używa też edytor w przeglądarce). */

export type Thumb = { kind: "diagram" | "rys"; id: string };

/** Czas czytania w minutach (180 słów/min, min. 1). */
export const readingMinutes = (text: string) => Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 180));

/** Miniatura artykułu: pierwszy <Diagram id> albo <Rys id> w treści. */
export function firstThumb(body: string): Thumb | null {
  const m = body.match(/<(Diagram|Rys)\s+id="([^"]+)"/);
  return m ? { kind: m[1] === "Rys" ? "rys" : "diagram", id: m[2] } : null;
}
