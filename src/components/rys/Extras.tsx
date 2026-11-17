"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { fmt, layersOf, LAYER0, layerOf, newId, RYS_W, SNAP_KINDS, SNAP_LABEL, type Layer, type RysDoc, type SnapKind } from "@/lib/rys/model";
import { download, exportPdf, exportPng, exportSvg, type Theme } from "./exportRys";
import { icons } from "./icons";

/*
  Dodatki rysownika z paczki RB2: wpisywanie wartości przy kursorze (jak dynamiczne wprowadzanie w CAD),
  menu Plik z oknem eksportu, panel warstw i panel kalki (obraz pod rysunkiem do odrysowania).
*/

/* ───────────── wartości z klawiatury ───────────── */
export type DynKind = "line" | "rect" | "circle" | "cal";
export interface Dyn { kind: DynKind; a: string; b: string; at: [number, number] }
const DYN_LABEL: Record<DynKind, [string, string | null, string]> = {
  line: ["Długość", "Kąt °", "Tab — kąt (puste = kierunek kursora), Enter — wstaw"],
  rect: ["Szerokość", "Wysokość", "Tab — wysokość, Enter — wstaw"],
  circle: ["Promień", null, "Enter — wstaw"],
  cal: ["Odległość", null, "rzeczywista odległość zaznaczonych punktów kalki, Enter — przeskaluj"],
};
export const parseNum = (s: string) => { const n = Number(s.trim().replace(",", ".").replace("−", "-")); return s.trim() && Number.isFinite(n) ? n : null; };

export function DynInput({ dyn, onChange, onApply, onClose }: { dyn: Dyn; onChange: (d: Dyn) => void; onApply: (d: Dyn) => void; onClose: () => void }) {
  const [la, lb, tip] = DYN_LABEL[dyn.kind];
  const ra = useRef<HTMLInputElement>(null), rb = useRef<HTMLInputElement>(null);
  useEffect(() => { ra.current?.focus(); const v = ra.current?.value.length ?? 0; ra.current?.setSelectionRange(v, v); }, []);
  const key = (e: React.KeyboardEvent<HTMLInputElement>, which: "a" | "b") => {
    e.stopPropagation();
    if (e.key === "Escape") { e.preventDefault(); onClose(); }
    else if (e.key === "Enter") { e.preventDefault(); onApply(dyn); }
    else if (e.key === "Tab" && lb) { e.preventDefault(); (which === "a" ? rb : ra).current?.focus(); }
  };
  return (
    <div className="rys-dyn" style={{ left: dyn.at[0] + 18, top: dyn.at[1] + 18 }} role="group" aria-label="Wartość z klawiatury">
      <label>{la}<input ref={ra} inputMode="decimal" value={dyn.a} onChange={(e) => onChange({ ...dyn, a: e.target.value })} onKeyDown={(e) => key(e, "a")} /><span>mm</span></label>
      {lb && <label>{lb}<input ref={rb} inputMode="decimal" value={dyn.b} onChange={(e) => onChange({ ...dyn, b: e.target.value })} onKeyDown={(e) => key(e, "b")} />{dyn.kind === "rect" && <span>mm</span>}</label>}
      <small>{tip}</small>
    </div>
  );
}

/* ───────────── menu Plik ───────────── */
export interface MenuItem { label: string; hint?: string; key?: string; onClick: () => void; sep?: boolean }
export function FileMenu({ items, icon }: { items: MenuItem[]; icon: ReactNode }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null), btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); setOpen(false); } };
    document.addEventListener("pointerdown", off);
    document.addEventListener("keydown", esc, true);
    return () => { document.removeEventListener("pointerdown", off); document.removeEventListener("keydown", esc, true); };
  }, [open]);
  return (
    <div ref={box} className="rys-menu">
      <button ref={btn} type="button" className="rys-tool" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} title="Plik: otwieranie, kopie, eksport, kalka, import">{icon}<span>Plik</span></button>
      {open && (
        <div className="rys-menu-list" role="menu">
          {items.map((m, i) => (
            <div key={i} role="none">
              {m.sep && <hr />}
              <button type="button" role="menuitem" onClick={() => { setOpen(false); btn.current?.focus(); m.onClick(); }} title={m.hint}>
                <span>{m.label}</span>{m.key && <kbd>{m.key}</kbd>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────────── rodzaje przyciągania (jak ustawienia OSNAP) ───────────── */
export function SnapMenu({ kinds, onChange, up }: { kinds: ReadonlySet<SnapKind>; onChange: (k: ReadonlySet<SnapKind>) => void; up?: boolean }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", off);
    return () => document.removeEventListener("pointerdown", off);
  }, [open]);
  const toggle = (k: SnapKind) => { const n = new Set(kinds); if (n.has(k)) n.delete(k); else n.add(k); onChange(n); };
  return (
    <div ref={box} className="rys-menu">
      <button type="button" className={up ? "rys-sbt rys-sbt-n" : "rys-tool rys-tool-narrow"} aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((v) => !v)} title="Rodzaje przyciągania" aria-label="Rodzaje przyciągania">{icons.chevron}</button>
      {open && (
        <div className={`rys-menu-list rys-snapkinds${up ? " is-up" : ""}`} role="group" aria-label="Rodzaje przyciągania">
          {SNAP_KINDS.map((k) => <label key={k}><input type="checkbox" checked={kinds.has(k)} onChange={() => toggle(k)} /> {SNAP_LABEL[k]}</label>)}
          <hr />
          <div className="rys-snapkinds-all">
            <button type="button" onClick={() => onChange(new Set(SNAP_KINDS))}>Wszystkie</button>
            <button type="button" onClick={() => onChange(new Set(["end", "mid", "center", "int"] as SnapKind[]))}>Tylko punkty</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────── okno eksportu ───────────── */
export type ExportFormat = "svg" | "png" | "pdf";
const FORMAT_LABEL: Record<ExportFormat, string> = { svg: "SVG — wektor, do dalszej edycji i na strony", png: "PNG — obraz, do prezentacji i dokumentów", pdf: "PDF — strona A4 do druku" };
const SCALES = [4, 6, 10] as const;

export function ExportDialog({ doc, format: f0, onClose }: { doc: RysDoc; format: ExportFormat; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [format, setFormat] = useState<ExportFormat>(f0);
  const [theme, setTheme] = useState<Theme>("light");
  const [bg, setBg] = useState(true);
  const [scale, setScale] = useState<number>(6);
  const [name, setName] = useState("rysunek");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { ref.current?.showModal(); }, []);
  const save = async () => {
    setBusy(true); setErr("");
    const file = (name.trim() || "rysunek").replace(/[\\/:*?"<>|]+/g, "-");
    try {
      if (format === "svg") download(await exportSvg(doc, { theme, bg }), `${file}.svg`, "image/svg+xml");
      else if (format === "png") download(await exportPng(doc, { theme, bg }, scale), `${file}.png`);
      else download(await exportPdf(doc, { theme, bg: true }), `${file}.pdf`);
      onClose();
    } catch (e) { setErr(e instanceof Error ? e.message : "Eksport się nie udał"); }
    finally { setBusy(false); }
  };
  return (
    <dialog ref={ref} className="rys-dialog" onClose={onClose} aria-labelledby="rys-exp-h">
      <form method="dialog" onSubmit={(e) => { e.preventDefault(); void save(); }}>
        <h2 id="rys-exp-h">Eksport rysunku</h2>
        <fieldset><legend>Format</legend>
          {(Object.keys(FORMAT_LABEL) as ExportFormat[]).map((x) => <label key={x} className="rys-radio"><input type="radio" name="fmt" checked={format === x} onChange={() => setFormat(x)} /> {FORMAT_LABEL[x]}</label>)}
        </fieldset>
        <fieldset><legend>Kolory</legend>
          <label className="rys-radio"><input type="radio" name="th" checked={theme === "light"} onChange={() => setTheme("light")} /> Jasne — do druku i dokumentów</label>
          <label className="rys-radio"><input type="radio" name="th" checked={theme === "dark"} onChange={() => setTheme("dark")} /> Ciemne — jak na stronie w trybie ciemnym</label>
          {format !== "pdf" && <label className="rys-radio"><input type="checkbox" checked={bg} onChange={(e) => setBg(e.target.checked)} /> Tło (bez tła — przezroczyste)</label>}
        </fieldset>
        {format === "png" && (
          <fieldset><legend>Rozmiar</legend>
            {SCALES.map((s) => <label key={s} className="rys-radio"><input type="radio" name="sc" checked={scale === s} onChange={() => setScale(s)} /> {RYS_W * s} × {Math.round(doc.h * s)} px</label>)}
          </fieldset>
        )}
        <label className="rys-dlg-field">Nazwa pliku<input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} /></label>
        {format === "pdf" && <p className="rys-tip">Rysunek dopasowany do strony A4 (marginesy 10 mm), obraz w wysokiej rozdzielczości bez strat.</p>}
        {err && <p className="rys-err" role="alert">{err}</p>}
        <div className="rys-dialog-actions">
          <button type="button" className="btn ghost" onClick={onClose}>Anuluj</button>
          <button type="submit" className="btn" disabled={busy}>{busy ? "Zapisuję…" : "Zapisz plik"}</button>
        </div>
      </form>
    </dialog>
  );
}

/* ───────────── warstwy ───────────── */
export function LayersPanel({ doc, active, sel, onActive, onLayers, onMove }: {
  doc: RysDoc; active: string; sel: string[];
  onActive: (id: string) => void; onLayers: (layers: Layer[], moveTo0?: string) => void; onMove: (layer: string) => void;
}) {
  const layers = layersOf(doc);
  const count = (id: string) => doc.items.filter((it) => layerOf(it) === id).length;
  const patch = (id: string, p: Partial<Layer>) => onLayers(layers.map((l) => (l.id === id ? { ...l, ...p } : l)));
  return (
    <div className="rys-lys">
      <ul>
        {layers.map((l) => (
          <li key={l.id} className={l.id === active ? "is-active" : ""}>
            <input type="radio" name="rys-ly" checked={l.id === active} onChange={() => onActive(l.id)} aria-label={`Rysuj na warstwie ${l.name}`} title="Nowe elementy trafiają na tę warstwę" />
            <input type="text" value={l.name} maxLength={40} onChange={(e) => patch(l.id, { name: e.target.value })} aria-label="Nazwa warstwy" />
            <span className="rys-lys-n" title="Liczba elementów">{count(l.id)}</span>
            <select className="rys-lys-op" value={Math.round((l.op ?? 1) * 100)} onChange={(e) => { const v = +e.target.value / 100; patch(l.id, v >= 1 ? { op: undefined } : { op: v }); }} title="Krycie warstwy (także na stronie)" aria-label="Krycie warstwy">
              {[100, 75, 50, 25].map((x) => <option key={x} value={x}>{x}%</option>)}
            </select>
            <button type="button" aria-pressed={l.vis} onClick={() => patch(l.id, { vis: !l.vis })} title={l.vis ? "Ukryj (ukryta warstwa nie pojawia się na stronie ani w eksporcie)" : "Pokaż"} aria-label={l.vis ? "Ukryj warstwę" : "Pokaż warstwę"}>{l.vis ? icons.eye : icons.eyeOff}</button>
            <button type="button" aria-pressed={l.lock} onClick={() => patch(l.id, { lock: !l.lock })} title={l.lock ? "Odblokuj" : "Zablokuj (elementów nie da się zaznaczyć, ale przyciągają)"} aria-label={l.lock ? "Odblokuj warstwę" : "Zablokuj warstwę"}>{l.lock ? icons.lock : icons.unlock}</button>
            {l.id !== LAYER0.id && <button type="button" onClick={() => { if (!count(l.id) || window.confirm(`Usunąć warstwę „${l.name}”? Jej elementy przejdą na warstwę „${layers[0].name}”.`)) onLayers(layers.filter((x) => x.id !== l.id), l.id); }} title="Usuń warstwę" aria-label="Usuń warstwę">{icons.trash}</button>}
          </li>
        ))}
      </ul>
      <div className="rys-lys-acts">
        {layers.length < 20 && <button type="button" className="rys-btn" onClick={() => { const id = newId(); onLayers([...layers, { id, name: `Warstwa ${layers.length + 1}`, vis: true, lock: false }]); onActive(id); }}>+ Nowa warstwa</button>}
        {sel.length > 0 && layers.length > 1 && (
          <label className="rys-lys-move">Zaznaczone na
            <select value="" onChange={(e) => { if (e.target.value) onMove(e.target.value); }}>
              <option value="">— wybierz —</option>
              {layers.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}

/* ───────────── kalka ───────────── */
export interface Kalka { src: string; x: number; y: number; w: number; ar: number; op: number; vis: boolean }
export type KalkaMode = null | "move" | "cal";

export function KalkaPanel({ kalka, mode, k, onChange, onMode, onRemove }: {
  kalka: Kalka; mode: KalkaMode; k: number; onChange: (p: Partial<Kalka>) => void; onMode: (m: KalkaMode) => void; onRemove: () => void;
}) {
  const n = (label: string, key: "x" | "y" | "w") => (
    <label className="rys-num"><span>{label}</span>
      <input type="number" step={1} value={kalka[key]} onChange={(e) => { const v = Number(e.target.value); if (Number.isFinite(v) && (key !== "w" || v > 1)) onChange({ [key]: v }); }} />
    </label>
  );
  return (
    <div className="rys-kalka">
      <label className="rys-range">Przezroczystość <input type="range" min={5} max={100} value={Math.round(kalka.op * 100)} onChange={(e) => onChange({ op: +e.target.value / 100 })} /> <b>{Math.round(kalka.op * 100)}%</b></label>
      <div className="rys-nums">{n("X", "x")}{n("Y", "y")}{n("Szerokość", "w")}</div>
      <p className="rys-tip">Wysokość obrazu: {fmt(kalka.w * kalka.ar)}. Szerokość w mm przy skali rysunku: {fmt(kalka.w / (k || 1))}.</p>
      <div className="rys-acts">
        <button type="button" className="rys-btn" aria-pressed={!kalka.vis} onClick={() => onChange({ vis: !kalka.vis })}>{kalka.vis ? "Ukryj" : "Pokaż"}</button>
        <button type="button" className="rys-btn" aria-pressed={mode === "move"} onClick={() => onMode(mode === "move" ? null : "move")} title="Przeciągnij obraz myszą; Esc kończy">Przesuń myszą</button>
        <button type="button" className="rys-btn" aria-pressed={mode === "cal"} onClick={() => onMode(mode === "cal" ? null : "cal")} title="Kliknij dwa punkty na obrazie o znanej odległości i wpisz ją w mm">Skaluj wg 2 punktów</button>
        <button type="button" className="rys-btn" onClick={() => onChange({ x: 0, y: 0, w: RYS_W })}>Na całą szerokość</button>
        <button type="button" className="rys-btn" onClick={onRemove}>Usuń kalkę</button>
      </div>
    </div>
  );
}

/** Plik obrazu → kalka dopasowana do arkusza. */
export async function readKalka(file: Blob, h: number): Promise<Kalka> {
  if (file.size > 12 * 1024 * 1024) throw new Error("Obraz jest za duży (ponad 12 MB)");
  const src = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(r.error); r.readAsDataURL(file); });
  const img = new Image();
  await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error("To nie jest obraz, który przeglądarka umie otworzyć")); img.src = src; });
  const ar = img.naturalHeight / img.naturalWidth || 1;
  const w = Math.min(RYS_W, h / ar);
  return { src, x: Math.round((RYS_W - w) / 2), y: 0, w: Math.round(w * 100) / 100, ar, op: 0.45, vis: true };
}

/* ───────────── warstwy na wstążce ───────────── */
export function LayerBar(props: { doc: RysDoc; active: string; sel: string[]; onActive: (id: string) => void; onLayers: (layers: Layer[], moveTo0?: string) => void; onMove: (layer: string) => void }) {
  const { doc, active, sel, onActive, onLayers, onMove } = props;
  const layers = layersOf(doc), cur = layers.find((l) => l.id === active) ?? layers[0];
  const patch = (p: Partial<Layer>) => onLayers(layers.map((l) => (l.id === cur.id ? { ...l, ...p } : l)));
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const off = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", off);
    return () => document.removeEventListener("pointerdown", off);
  }, [open]);
  return (
    <div className="rys-lbar">
      <label className="rys-step">Warstwa
        <select value={cur.id} onChange={(e) => onActive(e.target.value)} title="Nowe elementy trafiają na tę warstwę">
          {layers.map((l) => <option key={l.id} value={l.id}>{l.name}{!l.vis ? " (ukryta)" : ""}{l.lock ? " (zablokowana)" : ""}</option>)}
        </select>
      </label>
      <button type="button" className="rys-ib" aria-pressed={cur.vis} onClick={() => patch({ vis: !cur.vis })} title={cur.vis ? "Ukryj warstwę" : "Pokaż warstwę"} aria-label={cur.vis ? "Ukryj warstwę" : "Pokaż warstwę"}>{cur.vis ? icons.eye : icons.eyeOff}</button>
      <button type="button" className="rys-ib" aria-pressed={cur.lock} onClick={() => patch({ lock: !cur.lock })} title={cur.lock ? "Odblokuj warstwę" : "Zablokuj warstwę"} aria-label={cur.lock ? "Odblokuj warstwę" : "Zablokuj warstwę"}>{cur.lock ? icons.lock : icons.unlock}</button>
      <label className="rys-step">Krycie
        <select value={Math.round((cur.op ?? 1) * 100)} onChange={(e) => { const v = +e.target.value / 100; patch(v >= 1 ? { op: undefined } : { op: v }); }}>
          {[100, 75, 50, 25].map((x) => <option key={x} value={x}>{x}%</option>)}
        </select>
      </label>
      {layers.length < 20 && <button type="button" className="rys-btn" onClick={() => { const id = newId(); onLayers([...layers, { id, name: `Warstwa ${layers.length + 1}`, vis: true, lock: false }]); onActive(id); }}>+ Nowa warstwa</button>}
      {sel.length > 0 && layers.length > 1 && (
        <label className="rys-step">Zaznaczone na
          <select value="" onChange={(e) => { if (e.target.value) onMove(e.target.value); }}>
            <option value="">— wybierz —</option>
            {layers.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </label>
      )}
      <div ref={box} className="rys-menu">
        <button type="button" className="rys-btn" aria-expanded={open} onClick={() => setOpen((v) => !v)}>Wszystkie warstwy {icons.chevron}</button>
        {open && <div className="rys-menu-list rys-lpop"><LayersPanel {...props} /></div>}
      </div>
    </div>
  );
}
