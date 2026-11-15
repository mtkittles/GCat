"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import Editor from "@/components/rys/Editor";
import Rys from "@/components/rys/Rys";
import { H_DEFAULT, parseDoc, storeDoc, type RysDoc } from "@/lib/rys/model";

/*
  /rysownik — brudnopis: rysunek zapisuje się sam w tej przeglądarce (localStorage).
  Publikacja idzie przez panel treści (kolekcja „Rysunki”): „Kopiuj rysunek” tutaj, Ctrl+V w rysowniku panelu.
*/
const KEY = "gcat:rysownik";

function load(): RysDoc {
  try { return parseDoc(JSON.parse(localStorage.getItem(KEY) ?? "null")); } catch { return { h: H_DEFAULT, items: [] }; }
}

export default function Workbench() {
  const [initial, setInitial] = useState<RysDoc>(load);
  const [gen, setGen] = useState(0); // nowy klucz = edytor startuje od zera (historia cofania też)
  const [doc, setDoc] = useState<RysDoc>(initial);
  const [note, setNote] = useState("Szkic zapisuje się w tej przeglądarce");
  const preview = useRef<HTMLDialogElement>(null);

  const onChange = (d: RysDoc) => {
    setDoc(d);
    try { localStorage.setItem(KEY, JSON.stringify(storeDoc(d))); } catch { setNote("Nie udało się zapisać szkicu w przeglądarce"); }
  };
  const fresh = () => {
    if (doc.items.length && !window.confirm("Zacząć nowy rysunek? Obecny szkic zniknie.")) return;
    const empty = { h: H_DEFAULT, items: [] };
    setInitial(empty); setGen((g) => g + 1); onChange(empty);
  };
  const copyAll = async () => {
    try { await navigator.clipboard.writeText(JSON.stringify({ "gcat-rys": 1, h: doc.h, items: storeDoc(doc).items })); setNote("Skopiowano — w rysowniku panelu wklej Ctrl+V"); }
    catch { setNote("Przeglądarka nie pozwoliła skopiować — zaznacz wszystko (Ctrl+A) i użyj Ctrl+C"); }
  };

  return (
    <div className="rys-shell">
      <header className="rys-top">
        <h1>Rysownik</h1>
        <span className="rys-sub">brudnopis</span>
        <span className="rys-saved" role="status">{note}</span>
        <div className="rys-top-actions">
          <button type="button" className="btn ghost" onClick={fresh}>Nowy</button>
          <button type="button" className="btn ghost" onClick={() => preview.current?.showModal()}>Podgląd</button>
          <button type="button" className="btn ghost" onClick={copyAll}>Kopiuj rysunek</button>
          <Link className="btn" href="/edycja">Tryb edycji</Link>
        </div>
      </header>
      <Editor key={gen} initial={initial} onChange={onChange} />
      <p className="rys-narrow">Rysownik działa na komputerze: potrzebuje myszy i szerokiego ekranu. Otwórz tę stronę w oknie o szerokości co najmniej 900 px.</p>
      <dialog ref={preview} className="rys-preview" aria-label="Podgląd rysunku">
        <Rys fig={{ slug: "podglad", title: "Podgląd rysunku", code: "", caption: "Tak rysunek wygląda na stronie. Tytuł, podpis i legendę ustawisz w panelu treści.", legend: [], ...storeDoc(doc) }} />
        <form method="dialog"><button className="btn ghost">Zamknij</button></form>
      </dialog>
    </div>
  );
}
