"use client";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { Card, type LessonLink } from "@/app/slownik/Glossary";
import { diagrams } from "@/components/diagrams";
import { rysunki } from "@/components/rys/registry";
import { sources as SOURCES } from "@/content/nauka/sources";
import { joinFile, splitFile, type Data } from "@/lib/edytor/plik";
import type { Problem } from "@/lib/edytor/walidacja";
import { gcodes } from "@/lib/gcodes";
import { hasloToEntry } from "@/lib/mdx/gcode";
import { hasloSchema, type Haslo } from "@/lib/mdx/schema";
import { ei } from "./icons";
import { AutoArea, slotWrap } from "./KartaEditor";
import { Group } from "./Panel";
import { figText, usePending } from "./pending";
import { EditorShell, StatusCheck, useDokument, type View } from "./Shell";

/*
  Edytor hasła słownika (content/slownik/<kotwica>.yaml): karta hasła wygląda jak na /slownik,
  nazwa, nazwy zamienne i definicja edytują się w miejscu, reszta w panelu. Rysunek z rysownika
  rysuje się albo poprawia nad edytorem i trafia do repozytorium razem z hasłem.
*/

type Tab = "haslo" | "kontrola";
const lines = (t: string) => t.split("\n").map((x) => x.trim()).filter(Boolean);

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="ed-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export default function HasloEditor({ path, initial, lessons }: { path: string; initial: string; lessons: LessonLink[] }) {
  const [file, setFile] = useState(() => splitFile(initial, "yaml"));
  const [data, setDataRaw] = useState<Data>(file.data);
  const [ok, setOk] = useState<Haslo>(() => hasloSchema.parse(file.data));
  const setData = useCallback((upd: Data | ((d: Data) => Data)) => {
    setDataRaw((d) => {
      const next = typeof upd === "function" ? upd(d) : upd;
      const r = hasloSchema.safeParse(next);
      if (r.success) setOk(r.data);
      return next;
    });
  }, []);
  const set = (k: string, v: unknown) => setData((d) => ({ ...d, [k]: v }));
  const [tab, setTab] = useState<Tab>("haslo");
  const [inline, setInline] = useState<string | null>(null);
  const [view, setView] = useState<View>("edit");
  const pend = usePending();

  const loadText = useCallback((text: string) => { const f = splitFile(text, "yaml"); setFile(f); setData(f.data); }, [setData]);
  const current = useMemo(() => joinFile(file, data), [file, data]);
  const pendingRys = pend.pending.rys;
  const validate = useCallback(async (text: string): Promise<Problem[]> => {
    const { sprawdzHaslo } = await import("@/lib/edytor/walidacja");
    return sprawdzHaslo(path, text, { rysIds: new Set([...rysunki.map((r) => r.slug), ...Object.keys(pendingRys)]) });
  }, [path, pendingRys]);
  const d = useDokument({ path, initial, current, extra: pend.files, extraLabels: pend.labels, loadText, validate, onPublished: pend.clear });

  const entry = useMemo(() => hasloToEntry(ok), [ok]);
  const s = (k: string) => String(data[k] ?? "");
  const arr = <T,>(k: string) => (data[k] ?? []) as T[];

  const INL: Record<string, { label: string; get: () => string; put: (v: string) => void }> = {
    term: { label: "Nazwa hasła", get: () => s("term"), put: (v) => set("term", v) },
    aliases: { label: "Nazwy zamienne (jedna w linii)", get: () => arr<string>("aliases").join("\n"), put: (v) => set("aliases", lines(v)) },
    def: { label: "Definicja", get: () => s("def"), put: (v) => set("def", v) },
  };
  const edit = (k: string, v: ReactNode) => {
    const inl = INL[k];
    const open = () => {
      if (inl) { setInline(k); return; }
      setTab("haslo");
      window.setTimeout(() => { const el = document.getElementById(`f-${k}`); el?.scrollIntoView({ block: "start", behavior: "smooth" }); }, 50);
    };
    const label = inl?.label ?? ({ formulas: "Wzory", meta: "Karty kodów i źródła", fig: "Rysunek" } as Record<string, string>)[k] ?? k;
    return slotWrap({ label, view: v, open, active: !!inl && inline === k,
      editor: inl ? <AutoArea value={inl.get()} onChange={inl.put} onDone={() => setInline(null)} /> : null });
  };

  type F = { expr: string; where: string[]; example: string };
  type S = { id: string; where: string; loc: string; url: string };
  const formulas = arr<F>("formulas"), srcs = arr<S>("sources"), see = arr<string>("see");
  const rys = s("rysunek"), diag = s("diagram");

  const panel = (
    <aside className="rys-panel ed-panel" aria-label="Ustawienia">
      <div className="rys-seg ed-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "haslo"} onClick={() => setTab("haslo")}>Hasło</button>
        <button type="button" role="tab" aria-selected={tab === "kontrola"} onClick={() => setTab("kontrola")}>Kontrola{d.problems.length ? ` (${d.problems.length})` : ""}</button>
      </div>
      {tab === "kontrola" ? (d.problems.length
        ? <ul className="ed-problems">{d.problems.map((p, i) => <li key={i}><b>{p.where}</b>{p.message}</li>)}</ul>
        : <p className="ed-ok">{ei.check} Bez błędów — hasło przejdzie build strony.</p>) : (
        <>
          <Group title="Hasło" id="f-term">
            <Field label="Nazwa"><input value={s("term")} onChange={(e) => set("term", e.target.value)} /></Field>
            <Field label="Kotwica (adres /slownik#…)" hint="Stała — zmiana zepsułaby odnośniki."><input className="is-mono" value={s("anchor")} disabled /></Field>
            <Field label="Nazwy zamienne (jedna w linii)" hint="Po nich działają też odnośniki [[…]]."><textarea rows={3} value={arr<string>("aliases").join("\n")} onChange={(e) => set("aliases", lines(e.target.value))} /></Field>
            <Field label="Definicja"><textarea rows={5} value={s("def")} onChange={(e) => set("def", e.target.value)} /></Field>
            <Field label="Kolejność"><input className="is-mono" value={s("order")} onChange={(e) => set("order", Number(e.target.value) || 0)} /></Field>
          </Group>
          <Group title="Wzory" id="f-formulas">
            {formulas.map((f, i) => (
              <div key={i} className="ed-formula">
                <Field label={`Wzór ${i + 1}`}><input className="is-mono" value={f.expr} onChange={(e) => set("formulas", formulas.map((x, k) => (k === i ? { ...x, expr: e.target.value } : x)))} /></Field>
                <Field label="Objaśnienia (symbol — znaczenie, jednostka; jedno w linii)"><textarea rows={3} value={f.where.join("\n")} onChange={(e) => set("formulas", formulas.map((x, k) => (k === i ? { ...x, where: lines(e.target.value) } : x)))} /></Field>
                <Field label="Przykład liczbowy"><textarea rows={2} value={f.example} onChange={(e) => set("formulas", formulas.map((x, k) => (k === i ? { ...x, example: e.target.value } : x)))} /></Field>
                <button type="button" className="rys-btn is-danger" onClick={() => set("formulas", formulas.filter((_, k) => k !== i))}>{ei.trash}Usuń wzór</button>
              </div>
            ))}
            <button type="button" className="rys-btn" onClick={() => set("formulas", [...formulas, { expr: "", where: [], example: "" }])}>{ei.plus}Dodaj wzór</button>
          </Group>
          <Group title="Rysunek" id="f-fig">
            <div className="rys-acts">
              {rys ? <button type="button" className="rys-btn" onClick={() => pend.openRys({ kind: "rys", slug: rys })}>{ei.rys}Edytuj w rysowniku</button> : null}
              {!rys && diag && diag in diagrams ? <button type="button" className="rys-btn" onClick={() => {
                const box = document.querySelector(".ed-page .gl-fig");
                const t = figText(box);
                pend.openRys({ kind: "diagram", id: diag, svg: box?.querySelector("svg") ?? null, title: t.title || s("term"), code: t.code, caption: t.caption, onDone: (slug) => set("rysunek", slug) });
              }}>{ei.rys}Przerysuj w rysowniku</button> : null}
              <button type="button" className="rys-btn" onClick={() => pend.openRys({ kind: "new", title: s("term"), onDone: (slug) => set("rysunek", slug) })}>{ei.plus}Narysuj nowy</button>
              {rys ? <button type="button" className="rys-btn is-danger" onClick={() => set("rysunek", "")}>{ei.trash}Bez rysunku z rysownika</button> : null}
            </div>
            <p className="rys-tip">Rysunek z rysownika ma pierwszeństwo przed rysunkiem z biblioteki strony{diag ? ` („${diag}” zostaje jako zapas)` : ""}.</p>
            <Field label="Rysunek z rysownika"><select value={rys} onChange={(e) => set("rysunek", e.target.value)}>
              <option value="">— brak —</option>
              {[...Object.values(pend.pending.rys), ...rysunki.filter((r) => !pend.pending.rys[r.slug])].map((r) => <option key={r.slug} value={r.slug}>{r.title} ({r.slug})</option>)}
            </select></Field>
            <Field label="Rysunek z biblioteki strony"><select value={diag} onChange={(e) => set("diagram", e.target.value)}>
              <option value="">— brak —</option>
              {Object.keys(diagrams).sort().map((x) => <option key={x} value={x}>{x}</option>)}
            </select></Field>
          </Group>
          <Group title="Karty kodów" id="f-meta">
            <div className="ed-chips">{see.map((r) => <button key={r} type="button" title="Usuń" onClick={() => set("see", see.filter((x) => x !== r))}>{gcodes.find((g) => g.slug === r)?.code ?? r} ×</button>)}</div>
            <select value="" onChange={(e) => e.target.value && set("see", [...see, e.target.value])}>
              <option value="">Dodaj kartę…</option>
              {gcodes.filter((g) => !see.includes(g.slug)).map((g) => <option key={g.slug} value={g.slug}>{g.code} — {g.name}</option>)}
            </select>
          </Group>
          <Group title="Źródła">
            {srcs.map((x, i) => (
              <div key={i} className="ed-src">
                <select value={x.id} onChange={(e) => set("sources", srcs.map((y, k) => (k === i ? { ...y, id: e.target.value } : y)))}>{Object.values(SOURCES).map((o) => <option key={o.id} value={o.id}>{o.short}</option>)}</select>
                <input value={x.where} placeholder="Co potwierdza" onChange={(e) => set("sources", srcs.map((y, k) => (k === i ? { ...y, where: e.target.value } : y)))} />
                <input value={x.loc ?? ""} placeholder="Rozdział, strona" onChange={(e) => set("sources", srcs.map((y, k) => (k === i ? { ...y, loc: e.target.value } : y)))} />
                <button type="button" className="rys-btn is-danger" onClick={() => set("sources", srcs.filter((_, k) => k !== i))}>{ei.trash}Usuń</button>
              </div>
            ))}
            <button type="button" className="rys-btn" onClick={() => set("sources", [...srcs, { id: Object.keys(SOURCES)[0], where: "", loc: "", url: "" }])}>{ei.plus}Dodaj źródło</button>
          </Group>
        </>
      )}
    </aside>
  );

  const toolbar = (
    <div className="rys-bar ed-bar">
      <span className="rys-tip">Kliknij nazwę, nazwy zamienne albo definicję na karcie, żeby edytować w miejscu. Wzory, rysunek, karty i źródła — w panelu po prawej.</span>
    </div>
  );

  return (
    <pend.Provider value={pend.ctx}>
      <EditorShell d={d} path={path} current={current} loadText={loadText} view={view} setView={setView}
        crumbs={<>Słownik › <b>{entry.term}</b></>} liveHref={`/slownik#${encodeURIComponent(entry.anchor)}`} defaultMessage={`Słownik: ${entry.term}`}
        toolbar={toolbar}
        page={<div className="gl-page ed-gl"><div className="gl-list"><Card e={entry} lessons={lessons} edit={edit} figure={pend.figure} /></div></div>}
        panel={panel}
        status={<><StatusCheck problems={d.problems} />{pend.labels.length > 0 && <span>do publikacji także: {pend.labels.join(", ")}</span>}<span className="rys-hint">Szkic zapisuje się sam. Podgląd pokazuje hasło tak jak w słowniku.</span></>}
        overlay={pend.overlay} previewRys={pend.rysList} />
    </pend.Provider>
  );
}
