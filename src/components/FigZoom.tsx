"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

/*
  Powiększenie rysunku (#80 §5): etykiety SVG maleją razem z rysunkiem, więc na telefonie
  rysunek można otworzyć na cały ekran w skali co najmniej 760 px szerokości i przesuwać palcem.
  Natywny <dialog>: Esc zamyka, fokus zostaje w oknie. Kopia rysunku powstaje dopiero
  po otwarciu, żeby identyfikatory znaczników SVG nie dublowały się w dokumencie.
*/
export default function FigZoom({ title, children }: { title: string; children: ReactNode }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => { if (open) dlg.current?.showModal(); }, [open]);
  const close = () => dlg.current?.close();
  return (
    <div className="fz">
      {children}
      <button type="button" className="fz-btn" aria-label={`Powiększ rysunek: ${title}`} title="Powiększ rysunek" onClick={() => setOpen(true)}>
        <svg viewBox="0 0 16 16" aria-hidden><path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" /></svg>
      </button>
      {open && (
        <dialog ref={dlg} className="fz-dlg" aria-label={title} onClose={() => setOpen(false)} onClick={(e) => { if (e.target === dlg.current) close(); }}>
          <div className="fz-bar">
            <span>{title}</span>
            <button type="button" className="btn ghost" onClick={close}>Zamknij</button>
          </div>
          <div className="fz-body" tabIndex={0}>{children}</div>
        </dialog>
      )}
    </div>
  );
}
