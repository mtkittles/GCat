"use client";
import { useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Drawer } from "vaul";
import { ListOrdered } from "lucide-react";
import { LessonNav, useActiveSection, type SideLesson, type TocItem } from "./LessonSide";
import { useTopbarSlot } from "@/lib/ui/topbarSlot";

/*
  Spis lekcji na telefonie i tablecie (< 1100 px, gdzie nie ma lewego panelu): przycisk w górnym pasku
  (portal do #topbar-slot — nie zasłania tekstu nad dokiem) z numerem lekcji i bieżącą sekcją
  otwiera dolny arkusz Vaul ze spisem sekcji i lekcjami modułu.
  Wybór sekcji zamyka arkusz i przewija do niej (po zamknięciu — Vaul blokuje przewijanie strony, gdy jest otwarty).
*/
export default function LessonSheet({ toc, track, moduleLabel, lessons, currentId }: {
  toc: TocItem[]; track: string; moduleLabel: string; lessons: SideLesson[]; currentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [ids] = useState(() => toc.map((t) => t.id));
  const active = useActiveSection(ids);
  const cur = active >= 0 ? toc[active] : undefined;
  const slot = useTopbarSlot();

  const onPick = (e: MouseEvent<HTMLDivElement>) => {
    const a = (e.target as HTMLElement).closest("a");
    const hash = a?.getAttribute("href");
    if (!hash?.startsWith("#")) { if (a) setOpen(false); return; }
    e.preventDefault();
    setOpen(false);
    window.setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", hash);
    }, 320);
  };

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      {slot && createPortal(
        <Drawer.Trigger className="lsh-btn" aria-label={`Spis lekcji${cur ? `, bieżąca sekcja: ${cur.label}` : ""}`}>
          <ListOrdered aria-hidden />
          <span className="lsh-k">{currentId}</span>
          <span className="lsh-t">{cur ? cur.label : "Spis lekcji"}</span>
          {active >= 0 && <span className="lsh-n">{active + 1}/{toc.length}</span>}
        </Drawer.Trigger>,
        slot,
      )}
      <Drawer.Portal>
        <Drawer.Overlay className="vd-overlay" />
        <Drawer.Content className="vd vd-bottom lsh" aria-describedby={undefined}>
          <div className="vd-handle" aria-hidden />
          <Drawer.Title className="vd-title">Spis lekcji · {currentId}</Drawer.Title>
          <div className="lsh-body" onClick={onPick}>
            <LessonNav toc={toc} track={track} moduleLabel={moduleLabel} lessons={lessons} currentId={currentId} />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
