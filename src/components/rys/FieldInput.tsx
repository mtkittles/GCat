"use client";
import { useId, useState } from "react";
import { createPortal } from "react-dom";
import { FigDefs, figCtx } from "@/components/fig";
import { parseDoc, RYS_W, storeDoc, type RysDoc, type StoredDoc } from "@/lib/rys/model";
import Editor from "./Editor";
import { renderItem } from "./render";

/*
  Pole „Rysunek” w panelu treści (Keystatic): miniatura i przycisk otwierający rysownik na całym ekranie.
  Rysunek trafia do formularza dopiero po „Gotowe”; zapis wpisu robi panel (gałąź → PR), jak przy każdej treści.
*/
export function RysThumb({ doc }: { doc: RysDoc }) {
  const id = `t${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const c = figCtx(id);
  return (
    <div className="fig rys-thumb">
      <svg viewBox={`0 0 ${RYS_W} ${doc.h}`} role="img" aria-label="Miniatura rysunku">
        <FigDefs id={id} />
        {doc.items.map((it) => <g key={it.id}>{renderItem(it, c)}</g>)}
      </svg>
    </div>
  );
}

export default function RysFieldInput({ value, onChange, label }: { value: StoredDoc; onChange: (v: StoredDoc) => void; label: string }) {
  const [open, setOpen] = useState<RysDoc | null>(null); // rysunek, od którego startuje otwarty edytor
  const [work, setWork] = useState<RysDoc | null>(null);
  const doc = parseDoc(value);
  const start = () => { const d = parseDoc(value); setWork(d); setOpen(d); };
  const dirty = open !== null && work !== null && JSON.stringify(storeDoc(work)) !== JSON.stringify(storeDoc(open));
  const cancel = () => { if (!dirty || window.confirm("Zamknąć rysownik bez przenoszenia zmian do wpisu?")) setOpen(null); };
  const done = () => { if (work) onChange(storeDoc(work)); setOpen(null); };
  return (
    <div className="rys-field">
      <div className="rys-field-head"><b>{label}</b><span>{doc.items.length ? `${doc.items.length} elem. · 360 × ${doc.h}` : "pusty"}</span></div>
      <RysThumb doc={doc} />
      <button type="button" className="btn" onClick={start}>{doc.items.length ? "Edytuj w rysowniku" : "Otwórz rysownik"}</button>
      {open && createPortal(
        <div className="rys-shell" role="dialog" aria-modal="true" aria-label="Rysownik">
          <header className="rys-top">
            <h1>Rysownik</h1>
            <span className="rys-sub">{label}</span>
            <span className="rys-saved">{dirty ? "Zmiany nieprzeniesione do wpisu" : "Bez zmian"}</span>
            <div className="rys-top-actions">
              <button type="button" className="btn ghost" onClick={cancel}>Anuluj</button>
              <button type="button" className="btn" onClick={done}>Gotowe</button>
            </div>
          </header>
          <Editor initial={open} onChange={setWork} />
          <p className="rys-narrow">Rysownik działa na komputerze: potrzebuje myszy i okna o szerokości co najmniej 900 px.</p>
        </div>, document.body)}
    </div>
  );
}
