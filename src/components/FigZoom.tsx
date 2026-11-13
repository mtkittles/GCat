"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

/*
  Powiększenie rysunku (#80 §5, Z a — audyt kart cz. 2 §4.5): okno startuje dopasowane do szerokości
  ekranu (cały rysunek widać od razu), przyciski „−” i „+” zmieniają skalę 1× / 1,5× / 2× / 3×,
  a większy rysunek przesuwa się palcem. Pod rysunkiem stoi jego podpis.
  Natywny <dialog>: Esc zamyka, fokus zostaje w oknie. Kopia rysunku powstaje dopiero
  po otwarciu, żeby identyfikatory znaczników SVG nie dublowały się w dokumencie.
*/
const STEPS = [1, 1.5, 2, 3];

export default function FigZoom({ title, caption, children }: { title: string; caption?: ReactNode; children: ReactNode }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [k, setK] = useState(0);
  useEffect(() => { if (open) dlg.current?.showModal(); }, [open]);
  const close = () => dlg.current?.close();
  const z = STEPS[k];
  return (
    <div className="fz">
      {children}
      <button type="button" className="fz-btn" aria-label={`Powiększ rysunek: ${title}`} title="Powiększ rysunek" onClick={() => { setK(0); setOpen(true); }}>
        <svg viewBox="0 0 16 16" aria-hidden><path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" /></svg>
      </button>
      {open && (
        <dialog ref={dlg} className="fz-dlg" aria-label={title} onClose={() => setOpen(false)} onClick={(e) => { if (e.target === dlg.current) close(); }}>
          <div className="fz-bar">
            <span>{title}</span>
            <div className="fz-tools">
              <button type="button" className="btn ghost fz-step" aria-label="Pomniejsz" disabled={k === 0} onClick={() => setK((v) => Math.max(0, v - 1))}>−</button>
              <span className="fz-scale" aria-live="polite">{String(z).replace(".", ",")}×</span>
              <button type="button" className="btn ghost fz-step" aria-label="Powiększ" disabled={k === STEPS.length - 1} onClick={() => setK((v) => Math.min(STEPS.length - 1, v + 1))}>+</button>
              <button type="button" className="btn ghost" onClick={close}>Zamknij</button>
            </div>
          </div>
          <div className="fz-body" tabIndex={0}>
            <div className="fz-fig" style={{ width: `${z * 100}%`, maxWidth: `${860 * z}px` }}>{children}</div>
            {caption && <p className="fz-cap">{caption}</p>}
          </div>
        </dialog>
      )}
    </div>
  );
}
