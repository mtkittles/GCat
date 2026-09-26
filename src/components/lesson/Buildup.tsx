"use client";
import { useState } from "react";
import SimClient from "@/components/simulator/SimClient";
import type { BuildLine } from "@/content/nauka/buildup";

/*
  Program detalu przewodniego. Widać linie z tej i wcześniejszych lekcji:
  nowe na pomarańczowo, starsze wyszarzone — tapnięcie pokazuje przypomnienie.
  „Dokąd zmierzamy” odsłania cały docelowy program (i opcjonalnie jego symulację).
*/

export interface ShownLine extends BuildLine { state: "old" | "new" | "future"; sinceTitle?: string }

export default function Buildup({ title, lines, lessonId, mode }: { title: string; lines: ShownLine[]; lessonId: string; mode: "mill" | "lathe" }) {
  const [open, setOpen] = useState<number | null>(null);
  const [future, setFuture] = useState(false);
  const [sim, setSim] = useState(false);
  const shown = lines.filter((l) => future || l.state !== "future");
  const fresh = lines.filter((l) => l.state === "new").length;
  return (
    <div className="bu">
      <div className="bu-head">
        <strong>{title}</strong>
        <span className="chip chip-accent">+{fresh} {fresh === 1 ? "linia" : fresh < 5 ? "linie" : "linii"} w {lessonId}</span>
      </div>
      <ol className="bu-code">
        {shown.map((l, i) => (
          <li key={i} className={`bu-line is-${l.state}${open === i ? " is-open" : ""}`}>
            <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
              <code>{l.code}</code>
              {l.state !== "new" && <span className="bu-since">{l.since}</span>}
            </button>
            {open === i && <p className="bu-note">{l.note}{l.state === "future" && l.sinceTitle ? ` Pojawi się w lekcji ${l.since}: ${l.sinceTitle}.` : ""}</p>}
          </li>
        ))}
      </ol>
      <div className="bu-actions">
        <button type="button" className="btn ghost" aria-expanded={future} onClick={() => { setFuture(!future); setOpen(null); }}>
          {future ? "Pokaż tylko to, co już znasz" : "Pokaż, dokąd zmierzamy"}
        </button>
        {future && !sim && <button type="button" className="btn ghost" onClick={() => setSim(true)}>Uruchom gotowy program</button>}
      </div>
      {future && sim && <SimClient initial={lines.map((l) => l.code).join("\n")} mode={mode} editable={false} />}
    </div>
  );
}
