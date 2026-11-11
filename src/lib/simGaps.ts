import { parseProgram } from "@/lib/parser";

/*
  Czego symulator nie odtwarza w danym programie — na podstawie opisów bloków z parsera
  („nieobsługiwane”, „symulator nie wykonuje…”, „w symulatorze jak…”, „orientacyjny”) i kodów M bez opisu.
  Używane w podpisie przykładu bez podglądu na karcie kodu (paczka U) i w audit:programy.
*/
export interface SimGaps {
  /** kody pominięte przez symulator */
  missing: string[];
  /** kody odtwarzane w przybliżeniu (sonda bez sygnału, czas orientacyjny) */
  partial: string[];
  motion: boolean;
}

const CODE = /\b([GM]\d+(?:\.\d)?(?: L\d+)?)\b/;

export function simGaps(src: string, mode: "mill" | "lathe"): SimGaps {
  const p = parseProgram(src, { diameterX: mode === "lathe" });
  const missing = new Set<string>(), partial = new Set<string>();
  for (const l of p.lines) {
    const parts = l.description.split(" · ");
    for (const d of parts) {
      const code = d.match(CODE)?.[1];
      if (!code) continue;
      if (/nieobsługiwan|nie wykonuje/i.test(d)) missing.add(code);
      else if (/w symulatorze|orientacyjn/i.test(d)) partial.add(code);
    }
    // kod M, któremu parser nie nadał opisu (opis = sam kod), np. M19, M41
    for (const w of l.words) {
      if (w.letter !== "M") continue;
      const name = `M${w.value < 10 ? "0" : ""}${w.value}`;
      if (parts.includes(name) || parts.includes(`M${w.value}`)) missing.add(name);
    }
  }
  return { missing: [...missing], partial: [...partial].filter((c) => !missing.has(c)), motion: p.segments.some((s) => s.kind !== "dwell") };
}

const list = (xs: string[]) => xs.join(", ");

/** Podpis przykładu bez podglądu — wynika z tego, co symulator faktycznie obsługuje. */
export function readOnlyCaption(src: string, mode: "mill" | "lathe"): string {
  const g = simGaps(src, mode);
  const why = [
    ...(g.missing.length ? [`symulator nie odtwarza: ${list(g.missing)}`] : []),
    ...(g.partial.length ? [`${g.missing.length ? "a" : "symulator"} odtwarza w przybliżeniu: ${list(g.partial)}`] : []),
  ];
  if (why.length) return `Program do przeczytania — ${why.join(", ")}.`;
  if (!g.motion) return "Program do przeczytania — nie ma w nim ruchu narzędzia.";
  return "Program do przeczytania.";
}
