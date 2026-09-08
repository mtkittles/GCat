"use client";
import { useEffect, type ReactNode } from "react";

/*
  Pełnoekranowa powłoka symulatora na telefon.

  Układ: pasek narzędziowy u góry, podgląd wypełniający resztę ekranu,
  odczyt aktywnej linii i sterowanie odtwarzaniem na dole, a konsola programu
  jako wysuwany panel. Dzięki temu nie trzeba przewijać strony, żeby
  jednocześnie widzieć tor, kod i przyciski.
*/

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  toolbar: ReactNode;      // przełącznik widoku i przyciski pomocnicze
  view: ReactNode;         // kanwa 2D albo scena 3D
  status: ReactNode;       // aktywna linia i współrzędne
  transport: ReactNode;    // start, krok, reset, suwak
  console: ReactNode;      // edytor i lista bloków
  sheetOpen: boolean;
  onSheetToggle: () => void;
}

export default function FullscreenSim({
  open, onClose, title, toolbar, view, status, transport, console: consolePanel, sheetOpen, onSheetToggle,
}: Props) {
  // Blokada przewijania strony pod spodem oraz obsługa klawisza Escape.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fs-sim" role="dialog" aria-modal="true" aria-label={`Symulator — ${title}`}>
      <header className="fs-bar">
        <button className="fs-close" onClick={onClose} aria-label="Zamknij pełny ekran">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <span className="fs-title">{title}</span>
        <div className="fs-tools">{toolbar}</div>
      </header>

      <div className="fs-view">{view}</div>

      <div className="fs-status">{status}</div>

      <div className="fs-transport">
        {transport}
        <button className={`fs-sheet-btn ${sheetOpen ? "is-open" : ""}`} onClick={onSheetToggle} aria-expanded={sheetOpen}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 8l-5 4 5 4M15 8l5 4-5 4" />
          </svg>
          Kod
        </button>
      </div>

      <aside className={`fs-sheet ${sheetOpen ? "is-open" : ""}`} aria-hidden={!sheetOpen}>
        <div className="fs-sheet-head">
          <span className="fs-sheet-grip" aria-hidden />
          <strong>Program</strong>
          <button onClick={onSheetToggle} aria-label="Zwiń konsolę">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="fs-sheet-body">{consolePanel}</div>
      </aside>
    </div>
  );
}
