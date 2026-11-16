"use client";
import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import CardView, { type EditSlot } from "@/components/karta/CardView";
import { rysunki } from "@/components/rys/registry";
import { canon, docToMdx, mdxToDoc } from "@/lib/edytor/mdx";
import { joinFile, splitFile, type Data } from "@/lib/edytor/plik";
import type { GCode } from "@/lib/gcodes";
import { kodToGcode } from "@/lib/mdx/gcode";
import { kodSchema } from "@/lib/mdx/schema";
import { articleMeta } from "./blocks";
import Panel, { type Tab } from "./Panel";
import { usePending } from "./pending";
import { EditorShell, StatusCheck, useDokument, type View } from "./Shell";
import Toolbar from "./Toolbar";
import { editorExtensions } from "./views";

/*
  Edytor karty kodu: strona wygląda jak na żywo (wspólny widok CardView), artykuł edytuje się w miejscu,
  pola karty — klik w miejscu albo panel „Karta”. Rysunki przerysowuje się w rysowniku nad edytorem,
  obrazy wgrywa z komputera — idą do repozytorium razem z kartą.
*/

const getPath = (d: Data, k: string): unknown => k.split(".").reduce<unknown>((o, p) => (o == null ? o : Array.isArray(o) ? o[Number(p)] : (o as Data)[p]), d);
function setPath(d: Data, k: string, v: unknown): Data {
  const [h, ...rest] = k.split(".");
  if (!rest.length) return { ...d, [h]: v };
  const cur = d[h];
  if (Array.isArray(cur)) { const i = Number(rest[0]); const n = [...cur]; n[i] = rest.length > 1 ? setPath(n[i] as Data, rest.slice(1).join("."), v) : v; return { ...d, [h]: n }; }
  return { ...d, [h]: setPath((cur ?? {}) as Data, rest.join("."), v) };
}

/** Pola edytowane w miejscu (tekst pod kliknięciem); pozostałe otwierają panel „Karta”. */
const INLINE: Record<string, { label: string; mono?: boolean }> = {
  short: { label: "Jedno zdanie pod tytułem" }, desc: { label: "Opis" }, sinumerik: { label: "Sinumerik" },
  "syntax.fanuc": { label: "Składnia Fanuc", mono: true }, "syntax.sinumerik": { label: "Składnia Sinumerik", mono: true },
  "example.src": { label: "Program przykładowy", mono: true },
};
const PANEL_LABEL: Record<string, string> = { head: "Nagłówek karty", params: "Adresy", related: "Powiązane karty", sources: "Źródła", example: "Program przykładowy" };

export function AutoArea({ value, onChange, onDone, mono }: { value: string; onChange: (v: string) => void; onDone: () => void; mono?: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { const t = ref.current; if (t) { t.focus(); t.style.height = "auto"; t.style.height = `${t.scrollHeight + 2}px`; } }, [value]);
  return <textarea ref={ref} className={`ed-slot-area${mono ? " is-mono" : ""}`} value={value} spellCheck={!mono} onChange={(e) => onChange(e.target.value)} onBlur={onDone}
    onKeyDown={(e) => { if (e.key === "Escape" || (e.key === "Enter" && (e.ctrlKey || e.metaKey))) { e.preventDefault(); onDone(); } }} />;
}

/** Owijka pola strony w trybie edycji: klik → edycja w miejscu (inline) albo panel. */
export function slotWrap({ label, view, active, editor, open }: { label: string; view: ReactNode; active: boolean; editor: ReactNode; open: () => void }) {
  if (active) return <div className="ed-slot is-edit"><span className="ed-slot-tag">{label} · Esc albo klik obok — gotowe</span>{editor}</div>;
  return <div className="ed-slot" role="button" tabIndex={0} onClick={(e) => { if ((e.target as HTMLElement).closest("a,button:not(.ed-slot)")) e.preventDefault(); open(); }} onKeyDown={(e) => { if (e.key === "Enter") open(); }} title={`Kliknij, żeby edytować: ${label}`}><span className="ed-slot-tag">{label}</span>{view}</div>;
}

/** Zapamiętuje kanoniczny zapis bloków po wczytaniu — blok bez zmian zapisze się jak w pliku. */
function markOrigins(p: ReturnType<typeof mdxToDoc>, doc: JSONContent) {
  for (const n of doc.content ?? []) { const o = n.attrs?.oid ? p.origins.get(n.attrs.oid as string) : undefined; if (o) o.canon = canon(n); }
}

export default function KartaEditor({ path, initial, slug }: { path: string; initial: string; slug: string }) {
  // tekst załadowany do edytora: plik (frontmatter + treść) i dokument ze źródłami bloków
  const [src, setSrc] = useState(() => { const file = splitFile(initial); return { file, parsed: mdxToDoc(file.body) }; });
  const { file, parsed } = src;
  const [data, setDataRaw] = useState<Data>(file.data);
  // ostatnie poprawne pola karty — widok strony nie znika, gdy pole jest chwilowo puste
  const [okData, setOkData] = useState(() => kodSchema.parse(file.data));
  const setData = useCallback((upd: Data | ((d: Data) => Data)) => {
    setDataRaw((d) => {
      const next = typeof upd === "function" ? upd(d) : upd;
      const r = kodSchema.safeParse(next);
      if (r.success) setOkData(r.data);
      return next;
    });
  }, []);
  const [rev, setRev] = useState(0);
  const [tab, setTab] = useState<Tab>("blok");
  const [inline, setInline] = useState<string | null>(null);
  const [view, setView] = useState<View>("edit");
  const pend = usePending();

  const extensions = useMemo(() => editorExtensions("Pisz treść artykułu… Nagłówki, ramki, tabele i programy dodasz z paska u góry."), []);
  const [startDoc] = useState(parsed.doc);
  const editor = useEditor({
    extensions,
    content: startDoc,
    immediatelyRender: false,
    editorProps: { attributes: { class: "grid gap-4 ed-pm", spellcheck: "true", lang: "pl" } },
    onCreate: ({ editor: e }) => markOrigins(parsed, e.getJSON()),
    onUpdate: () => setRev((r) => r + 1),
    onSelectionUpdate: () => setTab((t) => (t === "kontrola" ? t : "blok")),
  });

  // nowy tekst (wersja z serwera, szkic, przywrócona wersja) → nowy dokument w edytorze
  const loadText = useCallback((text: string) => {
    const f = splitFile(text);
    const p = mdxToDoc(f.body);
    setSrc({ file: f, parsed: p });
    setData(f.data);
    if (editor) { editor.commands.setContent(p.doc, { emitUpdate: false }); markOrigins(p, editor.getJSON()); }
    setRev((r) => r + 1);
  }, [editor, setData]);

  const body = useMemo(() => (editor ? docToMdx(editor.getJSON(), parsed) : file.body), [editor, parsed, file, rev]); // eslint-disable-line react-hooks/exhaustive-deps
  const current = useMemo(() => joinFile(file, data, body), [file, data, body]);

  const pendingRys = pend.pending.rys;
  const validate = useCallback(async (text: string) => {
    const { sprawdzKarte } = await import("@/lib/edytor/walidacja");
    const rysIds = new Set([...rysunki.map((r) => r.slug), ...Object.keys(pendingRys)]);
    return (await sprawdzKarte(path, text, { rysIds })).problems;
  }, [path, pendingRys]);
  const d = useDokument({ path, initial, current, extra: pend.files, extraLabels: pend.labels, loadText, validate, onPublished: pend.clear });

  // „Edytuj rysunek” ze strony: ?rysunek=diagram:<id> albo rys:<slug> — zaznacz blok i otwórz rysownik
  const asked = useRef(false);
  useEffect(() => {
    if (!editor || asked.current) return;
    const q = new URLSearchParams(window.location.search).get("rysunek");
    if (!q) return;
    asked.current = true;
    const [kind, id] = q.split(":");
    let pos = -1;
    editor.state.doc.forEach((n, p) => { if (pos < 0 && n.type.name === (kind === "rys" ? "rys" : "diagram") && n.attrs.id === id) pos = p; });
    if (pos < 0) return;
    editor.view.dispatch(editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, pos)).scrollIntoView());
    window.setTimeout(() => (editor.view.nodeDOM(pos) as HTMLElement | null)?.querySelector<HTMLButtonElement>(".ed-fig-edit")?.click(), 400);
  }, [editor]);

  const meta = useMemo(() => (editor ? articleMeta(editor.state.doc) : null), [editor, rev]); // eslint-disable-line react-hooks/exhaustive-deps
  const g = useMemo<GCode>(() => kodToGcode(okData, !!meta?.hasArticle), [okData, meta?.hasArticle]);

  const edit: EditSlot = (k, v) => {
    const inl = INLINE[k] ?? (k.startsWith("pitfalls.") ? { label: "Na co uważać" } : undefined);
    const key = k === "example" ? "example.src" : k;
    const isInline = !!(INLINE[key] || inl);
    const label = inl?.label ?? INLINE[key]?.label ?? PANEL_LABEL[k] ?? k;
    const open = () => {
      if (isInline) { setInline(key); return; }
      setTab("karta");
      window.setTimeout(() => { const el = document.getElementById(`f-${k}`); el?.scrollIntoView({ block: "start", behavior: "smooth" }); (el?.querySelector("input,textarea,select") as HTMLElement | null)?.focus(); }, 50);
    };
    return slotWrap({ label, view: v, open, active: isInline && inline === key,
      editor: <AutoArea value={String(getPath(data, key) ?? "")} mono={(INLINE[key] ?? inl)?.mono} onChange={(val) => setData((x) => setPath(x, key, val))} onDone={() => setInline(null)} /> });
  };

  if (!editor || !meta) return <div className="ed-shell"><p className="ed-loading">Wczytuję edytor…</p></div>;

  const articleNode: ReactNode = <EditorContent editor={editor} className="ed-content" />;
  const article = meta.hasArticle ? { node: articleNode, headings: meta.headings, hasDiagram: meta.hasDiagram, hasAddrTable: meta.hasAddrTable, programs: meta.programs } : null;
  const empty = !meta.hasArticle && (
    <section className="ed-empty-article"><p className="rys-tip">Ta karta nie ma artykułu — strona pokazuje opis z pól karty. Zacznij pisać tutaj, a artykuł zastąpi „Jak to działa”.</p><div className="article grid gap-4">{articleNode}</div></section>
  );

  return (
    <pend.Provider value={pend.ctx}>
      <EditorShell d={d} path={path} current={current} loadText={loadText} view={view} setView={setView}
        crumbs={<>Karty › <b>{g.code}</b> — {g.name}</>} liveHref={`/kody/${slug}`} defaultMessage={`Treść: ${g.code} — ${g.name}`}
        toolbar={<Toolbar editor={editor} />}
        page={<CardView g={g} article={article} edit={edit} emptyArticle={empty || undefined} />}
        panel={<Panel tab={tab} setTab={setTab} editor={editor} data={data} onData={setData} problems={d.problems} checking={d.checking} />}
        status={<><StatusCheck problems={d.problems} /><span>{meta.headings.length} sekcji</span>{pend.labels.length > 0 && <span>do publikacji także: {pend.labels.join(", ")}</span>}<span className="rys-hint">Klik w dowolny tekst na stronie — edycja w miejscu. Zaznacz tekst i użyj paska. Alt+↑/↓ przesuwa blok. Szkic zapisuje się sam.</span></>}
        overlay={pend.overlay} previewRys={pend.rysList} />
    </pend.Provider>
  );
}
