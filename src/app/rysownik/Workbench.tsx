"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Editor from "@/components/rys/Editor";
import Rys from "@/components/rys/Rys";
import { RysThumb } from "@/components/rys/Thumb";
import { idbDel, idbList, idbSet } from "@/lib/rys/idb";
import { H_DEFAULT, newId, parseDoc, storeDoc, type RysDoc, type StoredDoc } from "@/lib/rys/model";

/*
  /rysownik — brudnopis: rysunek zapisuje się sam w tej przeglądarce (localStorage).
  „Moje rysunki”: rysunki zapisane pod nazwą i kopie automatyczne (co kilka minut pracy) w IndexedDB tej przeglądarki.
  Publikacja idzie przez panel treści (kolekcja „Rysunki”): „Kopiuj rysunek” tutaj, Ctrl+V w rysowniku panelu.
*/
const KEY = "gcat:rysownik", NAME = "gcat:rysownik:szkic";
const COPY_EVERY = 3 * 60_000, COPIES = 15;

interface Saved { name: string; at: number; doc: StoredDoc }
type Entry = [string, Saved];

function load(): RysDoc {
  try { return parseDoc(JSON.parse(localStorage.getItem(KEY) ?? "null")); } catch { return { h: H_DEFAULT, k: 1, items: [] }; }
}
function loadCurrent(): { id: string; name: string } | null {
  try { const v = JSON.parse(localStorage.getItem(NAME) ?? "null") as { id?: unknown; name?: unknown } | null; return v && typeof v.id === "string" && typeof v.name === "string" ? { id: v.id, name: v.name } : null; } catch { return null; }
}
/** czas zapisu — wywoływany w zdarzeniach (zapis, zmiana rysunku), nie w renderze */
const stamp = () => Date.now();
const when = (t: number) => new Date(t).toLocaleString("pl-PL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default function Workbench() {
  const [initial, setInitial] = useState<RysDoc>(load);
  const [gen, setGen] = useState(0); // nowy klucz = edytor startuje od zera (historia cofania też)
  const [doc, setDoc] = useState<RysDoc>(initial);
  const [cur, setCur] = useState(loadCurrent);
  const [note, setNote] = useState("Szkic zapisuje się w tej przeglądarce");
  const [lib, setLib] = useState<{ saved: Entry[]; copies: Entry[] } | null>(null);
  const [naming, setNaming] = useState(false);
  const preview = useRef<HTMLDialogElement>(null), libDlg = useRef<HTMLDialogElement>(null), nameDlg = useRef<HTMLDialogElement>(null);
  const lastCopy = useRef<{ at: number; json: string } | null>(null);

  const onChange = (d: RysDoc) => {
    setDoc(d);
    const json = JSON.stringify(storeDoc(d));
    try { localStorage.setItem(KEY, json); } catch { setNote("Nie udało się zapisać szkicu w przeglądarce"); }
    // kopia automatyczna: co kilka minut pracy, tylko gdy rysunek się zmienił
    const lc = lastCopy.current;
    if (!lc) lastCopy.current = { at: stamp(), json }; // pierwsza zmiana w sesji: odliczanie od teraz
    else if (d.items.length && json !== lc.json && stamp() - lc.at > COPY_EVERY) {
      lastCopy.current = { at: stamp(), json };
      void idbSet(`kopia:${String(stamp()).padStart(15, "0")}`, { name: cur?.name ?? "Szkic", at: stamp(), doc: storeDoc(d) } satisfies Saved).then(async () => {
        const all = await idbList<Saved>("kopia:");
        for (const [k] of all.slice(0, Math.max(0, all.length - COPIES))) await idbDel(k);
      });
    }
  };
  const open = (d: RysDoc, who: { id: string; name: string } | null) => {
    setInitial(d); setGen((g) => g + 1); onChange(d);
    setCur(who);
    try { if (who) localStorage.setItem(NAME, JSON.stringify(who)); else localStorage.removeItem(NAME); } catch { /* bez nazwy */ }
  };
  const fresh = () => {
    if (doc.items.length && !window.confirm("Zacząć nowy rysunek? Obecny szkic zniknie (kopie automatyczne zostają w „Moje rysunki”).")) return;
    open({ h: H_DEFAULT, k: 1, items: [] }, null);
  };
  const saveAs = async (name: string, id = newId()) => {
    const ok = await idbSet(`szkic:${id}`, { name, at: stamp(), doc: storeDoc(doc) } satisfies Saved);
    if (ok) { const who = { id, name }; setCur(who); try { localStorage.setItem(NAME, JSON.stringify(who)); } catch { /* */ } }
    setNote(ok ? `Zapisano „${name}” w Moich rysunkach` : "Przeglądarka nie pozwoliła zapisać (tryb prywatny albo brak miejsca)");
  };
  const save = () => { if (cur) void saveAs(cur.name, cur.id); else { setNaming(true); } };
  useEffect(() => { if (naming) nameDlg.current?.showModal(); }, [naming]);
  const showLib = async () => {
    const [saved, copies] = await Promise.all([idbList<Saved>("szkic:"), idbList<Saved>("kopia:")]);
    setLib({ saved: saved.sort((a, b) => b[1].at - a[1].at), copies: copies.reverse() });
  };
  useEffect(() => { if (lib && !libDlg.current?.open) libDlg.current?.showModal(); }, [lib]);
  const copyAll = async () => {
    try { await navigator.clipboard.writeText(JSON.stringify({ "gcat-rys": 1, ...storeDoc(doc) })); setNote("Skopiowano — w rysowniku panelu wklej Ctrl+V"); }
    catch { setNote("Przeglądarka nie pozwoliła skopiować — zaznacz wszystko (Ctrl+A) i użyj Ctrl+C"); }
  };
  const pick = (e: Entry, kind: "szkic" | "kopia") => {
    if (doc.items.length && JSON.stringify(storeDoc(doc)) !== JSON.stringify(e[1].doc) && !window.confirm(`Otworzyć „${e[1].name}”? Obecny szkic zostanie zastąpiony.`)) return;
    open(parseDoc(e[1].doc), kind === "szkic" ? { id: e[0].slice(6), name: e[1].name } : null);
    libDlg.current?.close();
    setNote(kind === "szkic" ? `Otwarto „${e[1].name}”` : `Otwarto kopię z ${when(e[1].at)}`);
  };
  const remove = async (e: Entry) => {
    if (!window.confirm(`Usunąć „${e[1].name}” z Moich rysunków?`)) return;
    await idbDel(e[0]);
    if (cur && e[0] === `szkic:${cur.id}`) { setCur(null); try { localStorage.removeItem(NAME); } catch { /* */ } }
    await showLib();
  };

  const card = (e: Entry, kind: "szkic" | "kopia") => (
    <li key={e[0]} className="rys-lib-card">
      <button type="button" className="rys-lib-open" onClick={() => pick(e, kind)} aria-label={`Otwórz ${e[1].name}`}>
        <RysThumb doc={parseDoc(e[1].doc)} label={e[1].name} />
      </button>
      <div><b>{e[1].name}</b><span>{when(e[1].at)} · {e[1].doc.items.length} elem.</span></div>
      <div className="rys-lib-acts">
        <button type="button" className="rys-btn" onClick={() => pick(e, kind)}>Otwórz</button>
        {kind === "szkic" && <button type="button" className="rys-btn" onClick={() => void remove(e)}>Usuń</button>}
      </div>
    </li>
  );

  return (
    <div className="rys-shell">
      <header className="rys-top">
        <h1>Rysownik</h1>
        <span className="rys-sub">{cur ? cur.name : "brudnopis"}</span>
        <span className="rys-saved" role="status">{note}</span>
        <div className="rys-top-actions">
          <button type="button" className="btn ghost" onClick={() => preview.current?.showModal()}>Podgląd</button>
          <button type="button" className="btn ghost" onClick={copyAll}>Kopiuj rysunek</button>
          <Link className="btn" href="/edycja">Tryb edycji</Link>
        </div>
      </header>
      <Editor key={gen} initial={initial} onChange={onChange} kalkaKey="brudnopis" menu={[
        { label: "Nowy rysunek", onClick: fresh },
        { label: cur ? `Zapisz „${cur.name}”` : "Zapisz w Moich rysunkach…", hint: "Zapis pod nazwą w tej przeglądarce", onClick: save },
        { label: "Zapisz jako…", onClick: () => setNaming(true) },
        { label: "Moje rysunki i kopie…", hint: "Rysunki zapisane pod nazwą i kopie automatyczne z ostatnich godzin pracy", onClick: () => void showLib() },
      ]} />
      <p className="rys-narrow">Rysownik działa na komputerze: potrzebuje myszy i szerokiego ekranu. Otwórz tę stronę w oknie o szerokości co najmniej 900 px.</p>
      <dialog ref={preview} className="rys-preview" aria-label="Podgląd rysunku">
        <Rys fig={{ slug: "podglad", title: "Podgląd rysunku", code: "", caption: "Tak rysunek wygląda na stronie. Tytuł, podpis i legendę ustawisz w panelu treści.", legend: [], ...storeDoc(doc) }} />
        <form method="dialog"><button className="btn ghost">Zamknij</button></form>
      </dialog>
      {naming && (
        <dialog ref={nameDlg} className="rys-dialog" aria-labelledby="rys-name-h" onClose={() => setNaming(false)}>
          <form method="dialog" onSubmit={(e) => { const n = String(new FormData(e.currentTarget).get("n") ?? "").trim(); if (!n) { e.preventDefault(); return; } void saveAs(n.slice(0, 60)); }}>
            <h2 id="rys-name-h">Zapisz w Moich rysunkach</h2>
            <label className="rys-dlg-field">Nazwa rysunku<input name="n" defaultValue={cur?.name ?? ""} maxLength={60} autoFocus required /></label>
            <p className="rys-tip">Rysunek zostaje w tej przeglądarce. Na inny komputer przeniesiesz go przez „Plik → Zapisz kopię na dysk”.</p>
            <div className="rys-dialog-actions">
              <button type="button" className="btn ghost" onClick={() => nameDlg.current?.close()}>Anuluj</button>
              <button type="submit" className="btn">Zapisz</button>
            </div>
          </form>
        </dialog>
      )}
      {lib && (
        <dialog ref={libDlg} className="rys-dialog rys-lib" aria-labelledby="rys-lib-h" onClose={() => setLib(null)}>
          <h2 id="rys-lib-h">Moje rysunki</h2>
          {lib.saved.length ? <ul>{lib.saved.map((e) => card(e, "szkic"))}</ul> : <p className="rys-tip">Nie masz jeszcze rysunków zapisanych pod nazwą. Użyj „Plik → Zapisz w Moich rysunkach”.</p>}
          <h3>Kopie automatyczne</h3>
          {lib.copies.length ? <ul>{lib.copies.map((e) => card(e, "kopia"))}</ul> : <p className="rys-tip">Kopia powstaje co kilka minut pracy nad rysunkiem; zostaje {COPIES} ostatnich.</p>}
          <form method="dialog" className="rys-dialog-actions"><button className="btn ghost">Zamknij</button></form>
        </dialog>
      )}
    </div>
  );
}
