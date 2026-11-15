"use client";
import { useId } from "react";
import { FigDefs, figCtx } from "@/components/fig";
import { RYS_W, type Item } from "@/lib/rys/model";
import { renderItem } from "./render";

/** Miniatura rysunku (panel treści, okno importu). */
export function RysThumb({ doc, label = "Miniatura rysunku" }: { doc: { h: number; k: number; items: Item[] }; label?: string }) {
  const id = `t${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const c = figCtx(id);
  return (
    <div className="fig rys-thumb">
      <svg viewBox={`0 0 ${RYS_W} ${doc.h}`} role="img" aria-label={label}>
        <FigDefs id={id} />
        {doc.items.map((it) => <g key={it.id}>{renderItem(it, c, doc.k)}</g>)}
      </svg>
    </div>
  );
}
