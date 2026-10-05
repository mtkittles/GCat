"use client";
import { useEffect, useState } from "react";
import { loadActiveId, loadPrograms, newId, saveActiveId, savePrograms, type StoredProgram } from "./programs";
import PageBanner from "@/components/ui/PageBanner";
import Link from "next/link";
import Simulator, { type Dialect, type SimMode } from "@/components/simulator/Simulator";
import { PROGRAMS, programBySlug } from "@/content/programy";
import { simTools, type LibProgram } from "@/lib/programLibrary";
import type { Tool } from "@/components/simulator/setup";

/** znacznik czasu zapisu zakładki — poza komponentem, wywoływany tylko w obsłudze kliknięcia */
function stamp() { return Date.now(); }

export default function SimPage() {
  const first = PROGRAMS[0];
  const [name, setName] = useState(first.title);
  const [lib, setLib] = useState<string | null>(first.slug);
  const [src, setSrc] = useState(first.src);
  const [mode, setMode] = useState<SimMode>(first.mode);
  const [stock, setStock] = useState<LibProgram["stock"]>(first.stock);
  const [tools, setTools] = useState<Record<number, Tool> | undefined>(() => simTools(first));

  const openLib = (p: LibProgram) => {
    setLib(p.slug); setName(p.title); setSrc(p.src); setMode(p.mode); setStock(p.stock); setTools(simTools(p)); setActive(null); setDialect(p.dialect ?? "fanuc");
  };
  const [dialect, setDialect] = useState<Dialect>(first.dialect ?? "fanuc");

  // --- zakładki programów zapisywane w przeglądarce ---
  const [tabs, setTabs] = useState<StoredProgram[]>([]);
  const [active, setActive] = useState<string | null>(null);

  // Odtworzenie zapisanych programów przy pierwszym renderze po stronie klienta.
  // Odtworzenie zapisanych programów i obsługa linku z galerii (?program=slug) — po hydratacji,
  // żeby pierwszy render klienta zgadzał się z HTML-em z serwera.
  useEffect(() => {
    const t = setTimeout(() => {
      const list = loadPrograms();
      const want = new URLSearchParams(window.location.search).get("program");
      const fromLink = want ? programBySlug(want) : undefined;
      if (list.length) setTabs(list);
      if (fromLink) {
        setLib(fromLink.slug); setName(fromLink.title); setSrc(fromLink.src); setMode(fromLink.mode); setStock(fromLink.stock); setTools(simTools(fromLink)); setDialect(fromLink.dialect ?? "fanuc");
      } else if (list.length) {
        const id = loadActiveId() ?? list[0].id;
        const cur = list.find((x) => x.id === id) ?? list[0];
        setActive(cur.id); setSrc(cur.src); setMode(cur.mode); setStock(undefined); setTools(undefined); setLib(null); setName(cur.name);
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // zapis bieżącego programu z opóźnieniem, żeby nie pisać przy każdym znaku
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => {
      setTabs((prev) => {
        const next = prev.map((p) => (p.id === active ? { ...p, src, mode, updated: Date.now() } : p));
        savePrograms(next);
        return next;
      });
    }, 700);
    return () => clearTimeout(t);
  }, [src, mode, active]);

  const openTab = (t: StoredProgram) => {
    setActive(t.id); saveActiveId(t.id);
    setSrc(t.src); setMode(t.mode); setStock(undefined); setTools(undefined); setLib(null); setName(t.name);
  };

  const addTab = (from?: { name: string; src: string; mode: SimMode }) => {
    setLib(null); setTools(undefined);
    const t: StoredProgram = {
      id: newId(),
      name: from?.name ?? `Program ${tabs.length + 1}`,
      src: from?.src ?? "G21 G90 G17 G54\nS1500 M03\nG00 X0 Y0 Z5\n\nM30",
      mode: from?.mode ?? mode,
      updated: stamp(),
    };
    const next = [...tabs, t];
    setTabs(next); savePrograms(next); openTab(t);
  };

  const closeTab = (id: string) => {
    const next = tabs.filter((t) => t.id !== id);
    setTabs(next); savePrograms(next);
    if (active === id) {
      if (next.length) openTab(next[next.length - 1]);
      else openLib(first);
    }
  };

  // zmiana nazwy w miejscu: dwuklik otwiera pole, Enter/utrata fokusu zapisuje, Escape cofa
  const [renaming, setRenaming] = useState<{ id: string; value: string } | null>(null);
  const commitRename = () => {
    if (!renaming) return;
    const nm = renaming.value.trim();
    setRenaming(null);
    if (!nm) return;
    const next = tabs.map((x) => (x.id === renaming.id ? { ...x, name: nm } : x));
    setTabs(next); savePrograms(next);
    if (active === renaming.id) setName(nm);
  };
  const programTabs = (
    <div className="tabs">
      {tabs.map((t) => (
        <span key={t.id} className={`tab ${active === t.id ? "is-active" : ""}`}>
          {renaming?.id === t.id ? (
            <input className="tab-rename" autoFocus value={renaming.value} aria-label="Nazwa programu" size={Math.max(6, renaming.value.length)}
              onChange={(e) => setRenaming({ id: t.id, value: e.target.value })}
              onBlur={commitRename}
              onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenaming(null); }} />
          ) : (
            <button onClick={() => openTab(t)} onDoubleClick={() => setRenaming({ id: t.id, value: t.name })} title="Kliknij dwukrotnie, aby zmienić nazwę">{t.name}</button>
          )}
          <button className="tab-x" onClick={() => closeTab(t.id)} aria-label={`Zamknij ${t.name}`}>×</button>
        </span>
      ))}
      <button className="tab-add" onClick={() => addTab()} title="Nowy pusty program">+ Nowy</button>
      <button className="tab-add" onClick={() => addTab({ name, src, mode })} title="Zapisz bieżący program jako zakładkę">Zapisz bieżący</button>
    </div>
  );
  const groups = (["mill", "lathe"] as const).map((m) => ({
    m, label: m === "mill" ? "Frezowanie" : "Toczenie", items: PROGRAMS.filter((p) => p.mode === m),
  }));
  const cur = lib ? programBySlug(lib) : undefined;
  // wybór gotowego programu — widoczny nad symulatorem w każdej zakładce
  const progSelect = (
    <select value={lib ?? ""} aria-label="Program" onChange={(e) => { const p = programBySlug(e.target.value); if (p) openLib(p); }}>
      {!lib && <option value="">{name} (własny)</option>}
      {groups.map((g) => (
        <optgroup key={g.m} label={g.label}>
          {g.items.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
        </optgroup>
      ))}
    </select>
  );
  const picker = (
    <div className="sim-pick">
      <label className="sim-pick-sel">
        <span>Program</span>
        {progSelect}
      </label>
      {cur && <span className="sim-pick-meta">{cur.level} · {Object.keys(cur.tools).length} narz.{cur.lesson ? <> · <Link href={cur.lesson.href}>{cur.lesson.label}</Link></> : null}</span>}
      <Link href="/programy" className="sim-pick-lib" aria-label="Galeria programów"><span className="lbl-long">Galeria programów →</span><span className="lbl-short">Galeria</span></Link>
    </div>
  );
  const modeButtons = (
    <>
      <button aria-pressed={mode === "mill"} onClick={() => setMode("mill")}>Frezowanie (XY)</button>
      <button aria-pressed={mode === "lathe"} onClick={() => setMode("lathe")}>Toczenie (ZX)</button>
    </>
  );
  const dialectButtons = (
    <>
      <span className="text-muted text-sm">Walidator:</span>
      <button aria-pressed={dialect === "fanuc"} onClick={() => setDialect("fanuc")}>Fanuc</button>
      <button aria-pressed={dialect === "sinumerik"} onClick={() => setDialect("sinumerik")}>Sinumerik</button>
    </>
  );
  return (
    <div className="grid gap-4 sim-page">
      <PageBanner src="/img/banner-simulator.jpg" kicker="Narzędzie" title="Symulator"
        subtitle="Wpisz program i sprawdź tor narzędzia w 2D i 3D."
        info={<ul>
          <li>Po wpisaniu litery adresu (G, M, X…) pojawiają się podpowiedzi.</li>
          <li>Każda linia programu ma opis po polsku.</li>
          <li>Walidator zaznacza błędy na czerwono, ostrzeżenia na żółto.</li>
          <li>W toczeniu X oznacza średnicę, jak w Fanuc.</li>
        </ul>} priority />
      {/* Komputer: wszystko, co dotyczy programu i maszyny, w jednym pasku nad stanowiskiem */}
      <div className="sim-bar">
        <span className="sim-bar-title">Symulator</span>
        <label className="sim-bar-prog">{progSelect}</label>
        <div className="seg2" role="group" aria-label="Maszyna">
          <button aria-pressed={mode === "mill"} onClick={() => setMode("mill")}>Frezarka</button>
          <button aria-pressed={mode === "lathe"} onClick={() => setMode("lathe")}>Tokarka</button>
        </div>
        <div className="seg2" role="group" aria-label="Sterownik">
          <button aria-pressed={dialect === "fanuc"} onClick={() => setDialect("fanuc")}>Fanuc</button>
          <button aria-pressed={dialect === "sinumerik"} onClick={() => setDialect("sinumerik")}>Sinumerik</button>
        </div>
        <div className="sim-bar-tabs">{programTabs}</div>
        {cur && <span className="sim-bar-meta">{cur.level} · {Object.keys(cur.tools).length} narz.{cur.lesson ? <> · <Link href={cur.lesson.href}>{cur.lesson.label}</Link></> : null}</span>}
        <Link href="/programy" className="sim-bar-lib">Galeria →</Link>
      </div>
      {picker}
      <Simulator appLayout source={src} onSourceChange={setSrc} mode={mode} dialect={dialect} stock={stock} tools={tools}
        codeTop={<>{programTabs}</>}
        settingsExtra={<>
          <div className="m-set-row"><span>Obróbka</span><div className="filters">{modeButtons}</div></div>
          <div className="m-set-row"><span>Sterownik</span><div className="filters">{dialectButtons}</div></div>
        </>} />
      <div className="legend sim-legend"><span><i style={{ background: "var(--amber)" }} />G00</span><span><i style={{ background: "var(--green)" }} />G01</span><span><i style={{ background: "var(--blue)" }} />G02/G03</span></div>
    </div>
  );
}
