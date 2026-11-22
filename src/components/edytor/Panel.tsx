"use client";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import { useMemo, useState, type ReactNode } from "react";
import { diagrams } from "@/components/diagrams";
import { rysunki } from "@/components/rys/registry";
import { sources as SOURCES } from "@/content/nauka/sources";
import { NOTE_KINDS, NOTE_LABEL, WIDGET_LABEL, WIDGETS } from "@/lib/edytor/schema";
import type { Problem } from "@/lib/edytor/walidacja";
import { gcodes } from "@/lib/gcodes";
import { simHref } from "@/lib/simLink";
import { around, deleteBlock, duplicateBlock, moveBlock, topBlock } from "./blocks";
import { ei } from "./icons";
import { usePendingCtx } from "./pending";
import { TermPicker } from "./Toolbar";

/*
  Panel po prawej (jak w rysowniku): Blok — właściwości bloku pod kursorem; Karta — wszystkie pola karty;
  Kontrola — błędy, które zablokowałyby build (te same reguły co npm run tresci).
*/

export type Tab = "blok" | "karta" | "kontrola";
type Data = Record<string, unknown>;

export function Group({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return <section className="rys-group" id={id}><h3>{title}</h3>{children}</section>;
}
export function Seg<T extends string | number>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return <div className="rys-seg" role="radiogroup" aria-label={label}>{options.map(([v, l]) => <button key={String(v)} type="button" role="radio" aria-checked={value === v} onClick={() => onChange(v)}>{l}</button>)}</div>;
}
export function Text({ label, value, onChange, id, mono, rows, placeholder, hint }: { label: string; value: string; onChange: (v: string) => void; id?: string; mono?: boolean; rows?: number; placeholder?: string; hint?: string }) {
  return (
    <label className="ed-field" htmlFor={id}>
      <span>{label}</span>
      {rows ? <textarea id={id} className={mono ? "is-mono" : undefined} rows={rows} value={value} placeholder={placeholder} spellCheck={!mono} onChange={(e) => onChange(e.target.value)} />
        : <input id={id} className={mono ? "is-mono" : undefined} value={value} placeholder={placeholder} spellCheck={!mono} onChange={(e) => onChange(e.target.value)} />}
      {hint && <small>{hint}</small>}
    </label>
  );
}
function Acts({ children }: { children: ReactNode }) { return <div className="rys-acts">{children}</div>; }
function Act({ icon, children, onClick, danger }: { icon: keyof typeof ei; children: ReactNode; onClick: () => void; danger?: boolean }) {
  return <button type="button" className={`rys-btn${danger ? " is-danger" : ""}`} onMouseDown={(e) => e.preventDefault()} onClick={onClick}>{ei[icon]}{children}</button>;
}

/* ───────────── Blok ───────────── */

function BlockPanel({ editor }: { editor: Editor }) {
  const pend = usePendingCtx();
  const st = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const sel = e.state.selection;
      const node = sel instanceof NodeSelection ? sel.node : null;
      const ctx = node && ["term", "diagram", "rys", "obraz", "widget", "wzor", "raw"].includes(node.type.name) ? { node, pos: sel.from }
        : around(e, ["codeFig", "simFig", "demoFig", "table", "note", "heading"]);
      const top = topBlock(e);
      return { ctx: ctx ? { type: ctx.node.type.name, attrs: ctx.node.attrs as Record<string, unknown>, pos: ctx.pos, text: ctx.node.textContent } : null, top: top ? top.node.type.name : null, inTable: e.isActive("table") };
    },
  });
  const set = (attrs: Record<string, unknown>) => {
    const c = st.ctx;
    if (!c) return;
    editor.chain().command(({ tr }) => { tr.setNodeMarkup(c.pos, undefined, { ...tr.doc.nodeAt(c.pos)!.attrs, ...attrs }); return true; }).run();
  };
  const c = st.ctx;
  const a = c?.attrs ?? {};
  let body: ReactNode = <p className="rys-tip">Kliknij w tekst albo blok na stronie, żeby zobaczyć jego ustawienia. Zaznacz tekst i użyj paska u góry: pogrubienie, kod, kolor, odnośnik.</p>;
  if (c?.type === "term") body = (
    <Group title="Odnośnik">
      <p className="rys-tip">Na stronie: dymek z opisem karty albo hasła. Klucz to kod (G01) albo hasło słownika.</p>
      <Text label="Tekst na stronie" value={String(a.label ?? "")} placeholder={String(a.k)} onChange={(v) => set({ label: v || null })} />
      <div className="ed-field"><span>Klucz: <b>{String(a.k)}</b> — zmień:</span><TermPicker initial="" onPick={(k) => set({ k })} /></div>
    </Group>
  );
  else if (c?.type === "codeFig" || c?.type === "simFig" || c?.type === "demoFig") body = (
    <Group title={c.type === "codeFig" ? "Program do przeczytania" : "Animacja programu"}>
      <p className="rys-tip">Program edytujesz w ramce na stronie. {c.type === "codeFig" ? "Na stronie: sam kod z podpisem." : "Na stronie: animacja w symulatorze i przycisk „Otwórz w symulatorze”."}</p>
      {c.type !== "codeFig" && <Seg label="Maszyna" value={String(a.mode) as "mill" | "lathe"} options={[["mill", "Frezarka"], ["lathe", "Tokarka"]]} onChange={(v) => set({ mode: v })} />}
      {c.type === "demoFig" && <Text label="Tytuł" value={String(a.title ?? "")} onChange={(v) => set({ title: v })} />}
      <Text label="Podpis" rows={3} value={String(a.caption ?? "")} onChange={(v) => set({ caption: v })} hint="Można użyć `kodu` i [[odnośników]]." />
      {c.type !== "codeFig" && <a className="rys-btn" href={simHref({ src: c.text, mode: a.mode === "lathe" ? "lathe" : "mill" })} target="_blank" rel="noreferrer">{ei.sim}Sprawdź w symulatorze ↗</a>}
      <div className="rys-tip">Zmiana rodzaju:</div>
      <Seg label="Rodzaj" value={c.type} options={[["codeFig", "Kod"], ["simFig", "Animacja"], ["demoFig", "Z tytułem"]]} onChange={(t) => {
        if (t === c.type) return;
        editor.chain().command(({ tr, state }) => { const n = state.doc.nodeAt(c.pos)!; tr.setNodeMarkup(c.pos, state.schema.nodes[t], { ...n.attrs, mode: n.attrs.mode ?? "mill" }); return true; }).run();
      }} />
    </Group>
  );
  else if (c?.type === "note") body = (
    <Group title="Ramka">
      <Seg label="Rodzaj ramki" value={String(a.kind)} options={NOTE_KINDS.map((k) => [k, NOTE_LABEL[k]] as [string, string])} onChange={(v) => set({ kind: v })} />
      <Acts><Act icon="trash" onClick={() => editor.chain().focus().lift("note").run()}>Zdejmij ramkę</Act></Acts>
    </Group>
  );
  else if (c?.type === "table") body = (
    <Group title="Tabela">
      <Text label="Podpis nad tabelą" value={String(a.caption ?? "")} onChange={(v) => set({ caption: v })} />
      <div className="rys-checks"><label><input type="checkbox" checked={a.sort === "true"} onChange={(e) => set({ sort: e.target.checked ? "true" : "" })} />sortowanie kliknięciem w nagłówek kolumny</label></div>
      <p className="rys-tip">Pierwszy wiersz to nagłówek. Na telefonie tabela układa się w karty z nazwami kolumn.</p>
      <Acts>
        <Act icon="plus" onClick={() => editor.chain().focus().addRowAfter().run()}>Wiersz poniżej</Act>
        <Act icon="plus" onClick={() => editor.chain().focus().addColumnAfter().run()}>Kolumna obok</Act>
        <Act icon="trash" onClick={() => editor.chain().focus().deleteRow().run()}>Usuń wiersz</Act>
        <Act icon="trash" onClick={() => editor.chain().focus().deleteColumn().run()}>Usuń kolumnę</Act>
      </Acts>
    </Group>
  );
  else if (c?.type === "heading") body = (
    <Group title={a.level === 3 ? "Podtytuł" : "Nagłówek sekcji"}>
      <Seg label="Poziom" value={Number(a.level)} options={[[2, "Nagłówek"], [3, "Podtytuł"]]} onChange={(v) => set({ level: v })} />
      <Text label="Kotwica (adres sekcji)" mono value={String(a.anchor ?? "")} onChange={(v) => set({ anchor: v.toLowerCase().replace(/[^\p{Ll}\p{N}-]+/gu, "-"), autoAnchor: false })}
        hint={a.autoAnchor ? "Tworzy się z tekstu nagłówka." : "Stała — zmiana zepsuje linki do tej sekcji (#…)."} />
    </Group>
  );
  else if (c?.type === "diagram") body = <DiagramPick id={String(a.id)} onPick={(id) => set({ id })} />;
  else if (c?.type === "rys") body = (
    <Group title="Rysunek z rysownika">
      {pend && <Acts>
        {a.id ? <Act icon="rys" onClick={() => pend.openRys({ kind: "rys", slug: String(a.id) })}>Edytuj w rysowniku</Act> : null}
        <Act icon="plus" onClick={() => pend.openRys({ kind: "new", onDone: (id) => set({ id }) })}>Narysuj nowy</Act>
      </Acts>}
      {a.was ? <Acts><Act icon="history" onClick={() => editor.chain().command(({ tr, state }) => { tr.setNodeMarkup(c.pos, state.schema.nodes.diagram, { id: a.was }); return true; }).run()}>Wróć do rysunku „{String(a.was)}”</Act></Acts> : null}
      <p className="rys-tip">Albo wybierz istniejący:</p>
      <div className="ed-list">{[...Object.values(pend?.pending.rys ?? {}), ...rysunki.filter((r) => !pend?.pending.rys[r.slug])].map((r) => <button key={r.slug} type="button" aria-pressed={r.slug === a.id} onClick={() => set({ id: r.slug })}><b>{r.title}</b><span>{r.slug}{pend?.pending.rys[r.slug] ? " · nowy" : ""}</span></button>)}</div>
    </Group>
  );
  else if (c?.type === "obraz") body = (
    <Group title="Obraz">
      <Text label="Plik" mono value={String(a.src ?? "")} placeholder="/rysunki/plik.png" onChange={(v) => set({ src: v })} hint="Plik z public/rysunki/. Nowy plik wgrasz przyciskiem „Wgraj z komputera” nad obrazem (PNG, JPG, WebP, SVG, do 2 MB)." />
      <Text label="Opis dla czytników ekranu" value={String(a.alt ?? "")} onChange={(v) => set({ alt: v })} />
      <Text label="Podpis" value={String(a.caption ?? "")} onChange={(v) => set({ caption: v })} />
    </Group>
  );
  else if (c?.type === "widget") body = <Group title="Narzędzie"><Seg label="Narzędzie" value={String(a.id)} options={WIDGETS.map((w) => [w, WIDGET_LABEL[w]] as [string, string])} onChange={(v) => set({ id: v })} /></Group>;
  else if (c?.type === "wzor") body = (
    <Group title="Wzór">
      <Text label="Wzór" mono rows={2} value={String(a.f ?? "")} placeholder="n = 1000 · V_c / (π · D)" onChange={(v) => set({ f: v })} hint="_ indeks dolny (V_c, D_{cap}), ^ wykładnik (ae^2), √(…) pierwiastek, ; kolejny wzór w tej samej ramce. Zmienne pokażą się kursywą." />
      <Text label="Legenda" rows={4} value={String(a.legend ?? "")} placeholder="n — obroty wrzeciona [obr/min]; D — średnica [mm]" onChange={(v) => set({ legend: v })} hint="Wpisy rozdzielone średnikiem: symbol — znaczenie [jednostka]." />
      <Text label="Podpis nad wzorem" value={String(a.caption ?? "")} onChange={(v) => set({ caption: v })} />
    </Group>
  );
  else if (c?.type === "raw") body = <Group title="Fragment MDX"><p className="rys-tip">Edytor nie zna tego zapisu, więc zostawia go w pliku bez zmian. Możesz poprawić źródło w ramce.</p></Group>;

  return (
    <>
      {body}
      {st.top && (
        <Group title="Blok">
          <Acts>
            <Act icon="up" onClick={() => moveBlock(editor, -1)}>Wyżej</Act>
            <Act icon="down" onClick={() => moveBlock(editor, 1)}>Niżej</Act>
            <Act icon="dup" onClick={() => duplicateBlock(editor)}>Duplikuj</Act>
            <Act icon="trash" danger onClick={() => deleteBlock(editor)}>Usuń</Act>
          </Acts>
          <p className="rys-tip">Alt + ↑/↓ przesuwa blok z kursorem.</p>
        </Group>
      )}
    </>
  );
}

function DiagramPick({ id, onPick }: { id: string; onPick: (id: string) => void }) {
  const [q, setQ] = useState("");
  const ids = useMemo(() => Object.keys(diagrams).sort().filter((x) => x.includes(q.trim().toLowerCase())), [q]);
  return (
    <Group title="Rysunek z biblioteki">
      <input className="ed-search" value={q} placeholder="Szukaj (np. g02, tool)…" onChange={(e) => setQ(e.target.value)} />
      <div className="ed-thumbs">
        {ids.slice(0, 60).map((x) => (
          <div key={x} role="button" tabIndex={0} aria-pressed={x === id} title={x} onClick={() => onPick(x)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(x); } }}>
            <span className="ed-thumb" inert>{diagrams[x]()}</span><span>{x}</span>
          </div>
        ))}
      </div>
      {ids.length > 60 && <p className="rys-tip">Pokazano 60 z {ids.length} — zawęź wyszukiwanie.</p>}
    </Group>
  );
}

/* ───────────── Karta ───────────── */

export function ListEdit<T>({ items, onChange, render, make, add }: { items: T[]; onChange: (v: T[]) => void; render: (it: T, set: (v: T) => void, i: number) => ReactNode; make: () => T; add: string }) {
  const move = (i: number, d: number) => { const n = [...items]; const [x] = n.splice(i, 1); n.splice(i + d, 0, x); onChange(n); };
  return (
    <div className="ed-items">
      {items.map((it, i) => (
        <div key={i} className="ed-item">
          {render(it, (v) => onChange(items.map((x, k) => (k === i ? v : x))), i)}
          <div className="ed-item-acts">
            <button type="button" disabled={i === 0} title="Wyżej" onClick={() => move(i, -1)}>{ei.up}</button>
            <button type="button" disabled={i === items.length - 1} title="Niżej" onClick={() => move(i, 1)}>{ei.down}</button>
            <button type="button" title="Usuń" onClick={() => onChange(items.filter((_, k) => k !== i))}>{ei.trash}</button>
          </div>
        </div>
      ))}
      <button type="button" className="rys-btn" onClick={() => onChange([...items, make()])}>{ei.plus}{add}</button>
    </div>
  );
}

export type Src = { id: string; where: string; loc: string; url: string };
type Stock = { discriminant: boolean; value?: Record<string, number> | null };

function KartaPanel({ data, onChange }: { data: Data; onChange: (d: Data) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v });
  const s = (k: string) => String(data[k] ?? "");
  const syntax = (data.syntax ?? { fanuc: "", sinumerik: "" }) as { fanuc: string; sinumerik: string };
  const ex = (data.example ?? { src: "", simulate: true, mode: "", dialect: "", stock: { discriminant: false } }) as { src: string; simulate: boolean; mode: string; dialect: string; stock: Stock };
  const machines = (data.machines ?? []) as string[];
  const toggleM = (m: string) => set("machines", machines.includes(m) ? machines.filter((x) => x !== m) : [...machines, m].sort());
  const stock = ex.stock?.discriminant ? (ex.stock.value ?? { x: 100, y: 60, z: 20, ox: 0, oy: 0, oz: 0 }) : null;
  return (
    <>
      <Group title="Nagłówek karty" id="f-head">
        <div className="ed-two">
          <Text id="f-code" label="Kod" mono value={s("code")} onChange={(v) => set("code", v)} />
          <Text label="Grupa" value={s("group")} onChange={(v) => set("group", v)} />
        </div>
        <Text label="Tytuł" value={s("name")} onChange={(v) => set("name", v)} />
        <Seg label="Poziom" value={Number(data.level ?? 1)} options={[[1, "Podstawy"], [2, "Średni"], [3, "Zaawansowany"]]} onChange={(v) => set("level", v)} />
        <div className="rys-checks">
          <label><input type="checkbox" checked={!!data.modal} onChange={(e) => set("modal", e.target.checked)} />modalny</label>
          <label><input type="checkbox" checked={machines.includes("frezowanie")} onChange={() => toggleM("frezowanie")} />frezowanie</label>
          <label><input type="checkbox" checked={machines.includes("toczenie")} onChange={() => toggleM("toczenie")} />toczenie</label>
          <label><input type="checkbox" checked={!!data.star} onChange={(e) => set("star", e.target.checked)} />★ opracowana</label>
        </div>
        <Text label="Zależy od (opcjonalnie)" value={s("variesBy")} onChange={(v) => set("variesBy", v)} placeholder="np. systemu kodów" />
        <Text label="Kolejność na liście" mono value={s("order")} onChange={(v) => set("order", Number(v) || 0)} />
      </Group>
      <Group title="Opis">
        <Text id="f-short" label="Jedno zdanie pod tytułem" rows={2} value={s("short")} onChange={(v) => set("short", v)} />
        <Text id="f-desc" label="Opis (karta bez artykułu; akapity — pusta linia)" rows={5} value={s("desc")} onChange={(v) => set("desc", v)} />
      </Group>
      <Group title="Składnia" id="f-syntax">
        <Text id="f-syntax.fanuc" label="Fanuc" mono value={syntax.fanuc} onChange={(v) => set("syntax", { ...syntax, fanuc: v })} />
        <Text id="f-syntax.sinumerik" label="Sinumerik" mono value={syntax.sinumerik} onChange={(v) => set("syntax", { ...syntax, sinumerik: v })} />
      </Group>
      <Group title="Adresy" id="f-params">
        <ListEdit items={(data.params ?? []) as { key: string; desc: string }[]} onChange={(v) => set("params", v)} make={() => ({ key: "", desc: "" })} add="Dodaj adres"
          render={(p, upd) => <div className="ed-pair"><input className="is-mono" value={p.key} placeholder="X Y Z" onChange={(e) => upd({ ...p, key: e.target.value })} /><textarea rows={2} value={p.desc} placeholder="Znaczenie" onChange={(e) => upd({ ...p, desc: e.target.value })} /></div>} />
      </Group>
      <Group title="Sinumerik (różnice)">
        <Text id="f-sinumerik" label="Notka" rows={3} value={s("sinumerik")} onChange={(v) => set("sinumerik", v)} />
      </Group>
      <Group title="Na co uważać" id="f-pitfalls">
        <ListEdit items={(data.pitfalls ?? []) as string[]} onChange={(v) => set("pitfalls", v)} make={() => ""} add="Dodaj uwagę"
          render={(p, upd, i) => <textarea id={`f-pitfalls.${i}`} rows={3} value={p} onChange={(e) => upd(e.target.value)} />} />
      </Group>
      <Group title="Program przykładowy" id="f-example">
        <Text id="f-example.src" label="Program" mono rows={10} value={ex.src} onChange={(v) => set("example", { ...ex, src: v })} />
        <div className="rys-checks"><label><input type="checkbox" checked={ex.simulate !== false} onChange={(e) => set("example", { ...ex, simulate: e.target.checked })} />animacja w symulatorze</label></div>
        <Seg label="Maszyna" value={ex.mode || ""} options={[["", "Automatycznie"], ["mill", "Frezarka"], ["lathe", "Tokarka"]]} onChange={(v) => set("example", { ...ex, mode: v })} />
        <Seg label="Zapis" value={ex.dialect || ""} options={[["", "Fanuc"], ["sinumerik", "Sinumerik"]]} onChange={(v) => set("example", { ...ex, dialect: v })} />
        <div className="rys-checks"><label><input type="checkbox" checked={!!stock} onChange={(e) => set("example", { ...ex, stock: e.target.checked ? { discriminant: true, value: { x: 100, y: 60, z: 20, ox: 0, oy: 0, oz: 0 } } : { discriminant: false } })} />własny półfabrykat</label></div>
        {stock && <div className="rys-nums">{(["x", "y", "z", "ox", "oy", "oz"] as const).map((k) => <label key={k} className="rys-num">{k.toUpperCase()}<input type="number" value={stock[k] ?? 0} onChange={(e) => set("example", { ...ex, stock: { discriminant: true, value: { ...stock, [k]: Number(e.target.value) } } })} /></label>)}</div>}
      </Group>
      <Group title="Źródła" id="f-sources">
        <ListEdit items={(data.sources ?? []) as Src[]} onChange={(v) => set("sources", v)} make={() => ({ id: Object.keys(SOURCES)[0], where: "", loc: "", url: "" })} add="Dodaj źródło"
          render={(x, upd) => (
            <div className="ed-src">
              <select value={x.id} onChange={(e) => upd({ ...x, id: e.target.value })}>{Object.values(SOURCES).map((o) => <option key={o.id} value={o.id}>{o.short}</option>)}</select>
              <input value={x.where} placeholder="Co potwierdza" onChange={(e) => upd({ ...x, where: e.target.value })} />
              <input value={x.loc} placeholder="Rozdział, strona" onChange={(e) => upd({ ...x, loc: e.target.value })} />
              <input value={x.url} placeholder="Link (opcjonalnie)" onChange={(e) => upd({ ...x, url: e.target.value })} />
            </div>
          )} />
      </Group>
      <Group title="Powiązane karty" id="f-related">
        <div className="ed-chips">
          {((data.related ?? []) as string[]).map((r) => <button key={r} type="button" onClick={() => set("related", (data.related as string[]).filter((x) => x !== r))} title="Usuń">{gcodes.find((g) => g.slug === r)?.code ?? r} ×</button>)}
        </div>
        <select value="" onChange={(e) => e.target.value && set("related", [...((data.related ?? []) as string[]), e.target.value])}>
          <option value="">Dodaj kartę…</option>
          {gcodes.filter((g) => g.slug !== data.slug && !((data.related ?? []) as string[]).includes(g.slug)).map((g) => <option key={g.slug} value={g.slug}>{g.code} — {g.name}</option>)}
        </select>
        <p className="rys-tip">Pusta lista — karty z tej samej grupy.</p>
      </Group>
    </>
  );
}

function Kontrola({ problems, checking }: { problems: Problem[]; checking: boolean }) {
  if (checking && !problems.length) return <p className="rys-tip">Sprawdzam…</p>;
  if (!problems.length) return <p className="ed-ok">{ei.check} Bez błędów — treść przejdzie build strony.</p>;
  return (
    <ul className="ed-problems">
      {problems.map((p, i) => <li key={i}><b>{p.where}{p.line ? `, linia ${p.line}` : ""}</b>{p.message}</li>)}
    </ul>
  );
}

export default function Panel({ tab, setTab, editor, data, onData, problems, checking, fields }: {
  tab: Tab; setTab: (t: Tab) => void; editor: Editor; data: Data; onData: (d: Data) => void; problems: Problem[]; checking: boolean;
  /** zamiast pól karty kodu: pola innego rodzaju treści (np. artykułu Technologii) */
  fields?: { label: string; node: ReactNode };
}) {
  return (
    <aside className="rys-panel ed-panel" aria-label="Ustawienia">
      <div className="rys-seg ed-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "blok"} onClick={() => setTab("blok")}>Blok</button>
        <button type="button" role="tab" aria-selected={tab === "karta"} onClick={() => setTab("karta")}>{fields?.label ?? "Karta"}</button>
        <button type="button" role="tab" aria-selected={tab === "kontrola"} onClick={() => setTab("kontrola")}>Kontrola{problems.length ? ` (${problems.length})` : ""}</button>
      </div>
      {tab === "blok" && <BlockPanel editor={editor} />}
      {tab === "karta" && (fields ? fields.node : <KartaPanel data={data} onChange={onData} />)}
      {tab === "kontrola" && <Kontrola problems={problems} checking={checking} />}
    </aside>
  );
}
