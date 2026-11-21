"use client";
import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { EditSlot } from "@/components/karta/CardView";
import { rysunki } from "@/components/rys/registry";
import TechArticleView from "@/components/technologia/TechArticleView";
import { canon, docToMdx, mdxToDoc } from "@/lib/edytor/mdx";
import { joinFile, splitFile, type Data } from "@/lib/edytor/plik";
import { artykulToEntry } from "@/lib/mdx/gcode";
import { artykulSchema, type Artykul } from "@/lib/mdx/schema";
import { firstThumb, readingMinutes } from "@/lib/mdx/tech-meta";
import { artsOf, dzialBySlug, type Dzial, type TechArt } from "@/lib/technologia";
import ArtykulPanel from "./ArtykulPanel";
import { articleMeta } from "./blocks";
import { AutoArea, slotWrap } from "./KartaEditor";
import Panel, { type Tab } from "./Panel";
import { usePending } from "./pending";
import { EditorShell, StatusCheck, useDokument, type View } from "./Shell";
import Toolbar from "./Toolbar";
import { editorExtensions } from "./views";

/*
  Edytor artykułu Technologii: strona wygląda jak na żywo (wspólny widok TechArticleView), treść edytuje się w miejscu,
  pola frontmattera — klik w miejscu (opis) albo panel „Artykuł”. Ten sam MDX ↔ TipTap co karty kodów, ta sama
  kontrola co build (sprawdzArtykul), publikacja przez gałąź tresci/… + PR jak dotąd. Nowy plik: `initial` z szablonu.
*/

const PANEL_LABEL: Record<string, string> = { head: "Nagłówek artykułu", powiazane: "Powiązane", sources: "Źródła" };

function markOrigins(p: ReturnType<typeof mdxToDoc>, doc: JSONContent) {
  for (const n of doc.content ?? []) { const o = n.attrs?.oid ? p.origins.get(n.attrs.oid as string) : undefined; if (o) o.canon = canon(n); }
}

/** Frontmatter + spis z edytora → wpis jak z npm run tresci (do widoku strony). */
const toArt = (d: Artykul, headings: { id: string; label: string }[], body: string, text: string): TechArt =>
  artykulToEntry({ data: d, meta: { headings }, thumb: firstThumb(body), minutes: readingMinutes(text) });

const stubDzial = (slug: string): Dzial => ({ slug, title: slug, short: "", zakres: "", icon: "frez", order: 999, big: false });

export default function ArtykulEditor({ path, initial, isNew = false }: { path: string; initial: string; isNew?: boolean }) {
  const [src, setSrc] = useState(() => { const file = splitFile(initial); return { file, parsed: mdxToDoc(file.body) }; });
  const { file, parsed } = src;
  const [data, setDataRaw] = useState<Data>(file.data);
  const [okData, setOkData] = useState(() => artykulSchema.parse(file.data));
  const setData = useCallback((upd: Data | ((d: Data) => Data)) => {
    setDataRaw((d) => {
      const next = typeof upd === "function" ? upd(d) : upd;
      const r = artykulSchema.safeParse(next);
      if (r.success) setOkData(r.data);
      return next;
    });
  }, []);
  const [rev, setRev] = useState(0);
  const [tab, setTab] = useState<Tab>(isNew ? "karta" : "blok");
  const [inline, setInline] = useState<string | null>(null);
  const [view, setView] = useState<View>("edit");
  const pend = usePending();

  const extensions = useMemo(() => editorExtensions("Pisz treść artykułu… Nagłówki, ramki, tabele, rysunki i programy dodasz z paska u góry."), []);
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
    const { sprawdzArtykul } = await import("@/lib/edytor/walidacja");
    const rysIds = new Set([...rysunki.map((r) => r.slug), ...Object.keys(pendingRys)]);
    return (await sprawdzArtykul(path, text, { rysIds })).problems;
  }, [path, pendingRys]);
  const d = useDokument({ path, initial, current, extra: pend.files, extraLabels: pend.labels, loadText, validate, onPublished: pend.clear, fresh: isNew });

  const meta = useMemo(() => (editor ? articleMeta(editor.state.doc) : null), [editor, rev]); // eslint-disable-line react-hooks/exhaustive-deps
  const text = useMemo(() => (editor ? editor.state.doc.textContent : ""), [editor, rev]); // eslint-disable-line react-hooks/exhaustive-deps
  const a = useMemo(() => toArt(okData, meta?.headings ?? [], body, text), [okData, meta, body, text]);
  const dzial = dzialBySlug(okData.dzial) ?? stubDzial(okData.dzial);

  const edit: EditSlot = (k, v) => {
    const isInline = k === "short";
    const open = () => {
      if (isInline) { setInline(k); return; }
      setTab("karta");
      window.setTimeout(() => { const el = document.getElementById(`f-${k}`); el?.scrollIntoView({ block: "start", behavior: "smooth" }); (el?.querySelector("input,textarea,select") as HTMLElement | null)?.focus(); }, 50);
    };
    return slotWrap({ label: isInline ? "Jedno zdanie pod tytułem" : PANEL_LABEL[k] ?? k, view: v, open, active: isInline && inline === k,
      editor: <AutoArea value={String(data[k] ?? "")} onChange={(val) => setData((x) => ({ ...x, [k]: val }))} onDone={() => setInline(null)} /> });
  };

  if (!editor || !meta) return <div className="ed-shell"><p className="ed-loading">Wczytuję edytor…</p></div>;

  const list = artsOf(okData.dzial).filter((x) => x.key !== a.key);
  const articleNode: ReactNode = <EditorContent editor={editor} className="ed-content" />;
  const live = `/technologia/${okData.dzial}/${okData.slug}`;

  return (
    <pend.Provider value={pend.ctx}>
      <EditorShell d={d} path={path} current={current} loadText={loadText} view={view} setView={setView}
        crumbs={<>Technologia › {dzial.title} › <b>{okData.title}</b>{isNew ? " · nowy" : ""}</>} liveHref={live} defaultMessage={`Technologia: ${okData.title}`}
        toolbar={<Toolbar editor={editor} />}
        page={<TechArticleView a={a} dzial={dzial} body={articleNode} edit={edit} nav={{ prev: list.filter((x) => x.order < a.order).at(-1), next: list.find((x) => x.order > a.order) }} />}
        panel={<Panel tab={tab} setTab={setTab} editor={editor} data={data} onData={setData} problems={d.problems} checking={d.checking}
          fields={{ label: "Artykuł", node: <ArtykulPanel data={data} onChange={setData} /> }} />}
        status={<><StatusCheck problems={d.problems} /><span>{meta.headings.length} sekcji · {a.minutes} min czytania</span>{pend.labels.length > 0 && <span>do publikacji także: {pend.labels.join(", ")}</span>}<span className="rys-hint">Klik w tekst na stronie — edycja w miejscu. Pola artykułu: zakładka „Artykuł”. Szkic zapisuje się sam.</span></>}
        overlay={pend.overlay} previewRys={pend.rysList} />
    </pend.Provider>
  );
}
