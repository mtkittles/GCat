"use client";
import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import CardView, { type EditSlot } from "@/components/karta/CardView";
import { api, ApiError, czas, diffLines, kopie, loginGithub, szkice, type Ja } from "@/lib/edytor/client";
import { canon, docToMdx, mdxToDoc } from "@/lib/edytor/mdx";
import { joinFile, splitFile, type Data } from "@/lib/edytor/plik";
import type { Problem } from "@/lib/edytor/walidacja";
import type { GCode } from "@/lib/gcodes";
import { kodToGcode } from "@/lib/mdx/gcode";
import { kodSchema } from "@/lib/mdx/schema";
import { articleMeta } from "./blocks";
import { HistoryDialog, PublishDialog, type PubState } from "./Dialogs";
import { ei } from "./icons";
import Panel, { type Tab } from "./Panel";
import Toolbar from "./Toolbar";
import { editorExtensions } from "./views";

/*
  Edytor karty kodu: strona wygląda jak na żywo (wspólny widok CardView), artykuł edytuje się w miejscu,
  pola karty — klik w miejscu albo panel „Karta”. Szkic zapisuje się w przeglądarce na bieżąco, podgląd
  w ramce (komputer / tablet / telefon) pokazuje dokładny wynik kompilacji, historia przywraca dowolną wersję.
*/

export const PREVIEW_KEY = "gcat:edytor:podglad";
type Device = "desktop" | "tablet" | "phone";
const DEVICE_W: Record<Device, string> = { desktop: "100%", tablet: "820px", phone: "390px" };

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

function AutoArea({ value, onChange, onDone, mono }: { value: string; onChange: (v: string) => void; onDone: () => void; mono?: boolean }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { const t = ref.current; if (t) { t.focus(); t.style.height = "auto"; t.style.height = `${t.scrollHeight + 2}px`; } }, [value]);
  return <textarea ref={ref} className={`ed-slot-area${mono ? " is-mono" : ""}`} value={value} spellCheck={!mono} onChange={(e) => onChange(e.target.value)} onBlur={onDone}
    onKeyDown={(e) => { if (e.key === "Escape" || (e.key === "Enter" && (e.ctrlKey || e.metaKey))) { e.preventDefault(); onDone(); } }} />;
}

/** Zapamiętuje kanoniczny zapis bloków po wczytaniu — blok bez zmian zapisze się jak w pliku. */
function markOrigins(p: ReturnType<typeof mdxToDoc>, doc: JSONContent) {
  for (const n of doc.content ?? []) { const o = n.attrs?.oid ? p.origins.get(n.attrs.oid as string) : undefined; if (o) o.canon = canon(n); }
}

export default function KartaEditor({ path, initial, slug }: { path: string; initial: string; slug: string }) {
  const [base, setBase] = useState<{ text: string; sha: string | null }>({ text: initial, sha: null });
  // tekst załadowany do edytora: plik (frontmatter + treść) i dokument ze źródłami bloków
  const [src, setSrc] = useState(() => { const file = splitFile(initial); return { file, parsed: mdxToDoc(file.body) }; });
  const { file, parsed } = src;
  const [ja, setJa] = useState<Ja | null>(null);
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState<{ text: string; at: number } | null>(null);
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
  const [view, setView] = useState<"edit" | "preview">("edit");
  const [device, setDevice] = useState<Device>("desktop");
  const [problems, setProblems] = useState<Problem[]>([]);
  const [checking, setChecking] = useState(false);
  const [histOpen, setHistOpen] = useState(false);
  const [pubOpen, setPubOpen] = useState(false);
  const [pub, setPub] = useState<PubState>({ s: "idle" });
  const [previewOf, setPreviewOf] = useState<string | null>(null);


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
  const dirty = current !== base.text;

  // start: tryb, najnowsza wersja pliku, szkic z przeglądarki
  useEffect(() => {
    api.ja().then(setJa, () => setJa({ mode: "github", canWrite: false, user: null }));
    api.plik(path).then((f) => {
      setBase({ text: f.text, sha: f.sha });
      const d = szkice.get(path);
      if (d && d.text !== f.text) setDraft({ text: d.text, at: d.at });
      if (f.text !== initial) { loadText(f.text); setNote("Wczytano najnowszą wersję z repozytorium (strona jeszcze się przebudowuje)."); }
    }, () => {
      const d = szkice.get(path);
      if (d && d.text !== initial) setDraft({ text: d.text, at: d.at });
    });
  }, [path, initial, loadText]);

  // szkic w przeglądarce (co sekundę bezczynności)
  useEffect(() => {
    const t = window.setTimeout(() => { if (dirty) szkice.set(path, { text: current, base: base.sha ?? "", at: Date.now() }); else szkice.drop(path); }, 900);
    return () => window.clearTimeout(t);
  }, [current, dirty, path, base.sha]);
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  // kontrola: te same reguły co build
  useEffect(() => {
    const t0 = window.setTimeout(() => setChecking(true), 0);
    const t = window.setTimeout(async () => {
      const { sprawdzKarte } = await import("@/lib/edytor/walidacja");
      const r = await sprawdzKarte(path, current);
      setProblems(r.problems);
      setChecking(false);
    }, 700);
    return () => { window.clearTimeout(t0); window.clearTimeout(t); };
  }, [current, path]);

  // podgląd w ramce: ta sama treść przez localStorage (zdarzenie storage w ramce)
  useEffect(() => {
    if (view !== "preview") return;
    const text = previewOf ?? current;
    try { localStorage.setItem(PREVIEW_KEY, JSON.stringify({ path, text, at: Date.now() })); } catch { /* brak miejsca */ }
  }, [view, current, path, previewOf]);

  const meta = useMemo(() => (editor ? articleMeta(editor.state.doc) : null), [editor, rev]); // eslint-disable-line react-hooks/exhaustive-deps
  const g = useMemo<GCode>(() => kodToGcode(okData, !!meta?.hasArticle), [okData, meta?.hasArticle]);

  const edit: EditSlot = (k, v) => {
    const inl = INLINE[k] ?? (k.startsWith("pitfalls.") ? { label: "Na co uważać" } : undefined);
    const key = k === "example" ? "example.src" : k;
    if (inline === key && (INLINE[key] || inl)) {
      return <div className="ed-slot is-edit"><span className="ed-slot-tag">{(INLINE[key] ?? inl)!.label} · Esc albo klik obok — gotowe</span>
        <AutoArea value={String(getPath(data, key) ?? "")} mono={(INLINE[key] ?? inl)!.mono} onChange={(val) => setData((d) => setPath(d, key, val))} onDone={() => setInline(null)} /></div>;
    }
    const label = inl?.label ?? INLINE[key]?.label ?? PANEL_LABEL[k] ?? k;
    const open = () => {
      if (INLINE[key] || inl) { setInline(key); return; }
      setTab("karta");
      window.setTimeout(() => { const el = document.getElementById(`f-${k}`); el?.scrollIntoView({ block: "start", behavior: "smooth" }); (el?.querySelector("input,textarea,select") as HTMLElement | null)?.focus(); }, 50);
    };
    return <div className="ed-slot" role="button" tabIndex={0} onClick={(e) => { if ((e.target as HTMLElement).closest("a,button:not(.ed-slot)")) e.preventDefault(); open(); }} onKeyDown={(e) => { if (e.key === "Enter") open(); }} title={`Kliknij, żeby edytować: ${label}`}><span className="ed-slot-tag">{label}</span>{v}</div>;
  };

  const restore = (text: string, label: string) => {
    kopie.add(path, current, `przed przywróceniem: ${label}`);
    loadText(text);
    setNote(`Przywrócono ${label}. Opublikuj, żeby trafiła na stronę.`);
  };

  const publish = async (message: string) => {
    setPub({ s: "busy", step: "Sprawdzam i zapisuję…" });
    kopie.add(path, base.text, "wersja opublikowana przed zmianą");
    try {
      const r = await api.zapisz([{ path, text: current }], message, { [path]: base.sha });
      setBase({ text: current, sha: r.files[0]?.sha ?? null });
      szkice.drop(path);
      setDraft(null);
      setPub({ s: "done", local: r.mode === "local", merged: r.merged, pr: r.pr, compare: r.compare, note: r.note });
      setNote(r.mode === "local" ? `Zapisano na dysku ${czas(Date.now())}.` : r.merged ? "Opublikowano — strona się przebudowuje." : "Zapisano na gałęzi — potrzebne scalenie PR.");
      if (r.mode === "github" && r.merged && r.commit) {
        const want = r.commit;
        for (let i = 0; i < 40; i++) {
          await new Promise((res) => setTimeout(res, 15000));
          const live = await api.strona().catch(() => null);
          if (live === want) { setPub((p) => (p.s === "done" ? { ...p, live: true } : p)); setNote("Zmiana jest już na stronie."); break; }
        }
      }
    } catch (e) {
      if (e instanceof ApiError) setPub({ s: "error", msg: e.message, problems: e.data.problems, login: e.data.login });
      else setPub({ s: "error", msg: e instanceof Error ? e.message : String(e) });
      if (e instanceof ApiError && e.data.login) setJa((j) => (j ? { ...j, user: null } : j));
    }
  };

  const login = async () => { await loginGithub(); setJa(await api.ja().catch(() => null)); setPub({ s: "idle" }); };

  const openPreview = (text?: string) => { setPreviewOf(text ?? null); setView("preview"); };

  if (!editor || !meta) return <div className="ed-shell"><p className="ed-loading">Wczytuję edytor…</p></div>;

  const articleNode: ReactNode = <EditorContent editor={editor} className="ed-content" />;
  const article = meta.hasArticle ? { node: articleNode, headings: meta.headings, hasDiagram: meta.hasDiagram, hasAddrTable: meta.hasAddrTable, programs: meta.programs } : null;
  const empty = !meta.hasArticle && (
    <section className="ed-empty-article"><p className="rys-tip">Ta karta nie ma artykułu — strona pokazuje opis z pól karty. Zacznij pisać tutaj, a artykuł zastąpi „Jak to działa”.</p><div className="article grid gap-4">{articleNode}</div></section>
  );
  const diff = diffLines(base.text, current);
  const status = problems.length ? <span className="ed-st-bad">{problems.length} {problems.length === 1 ? "błąd" : "błędy"} — zakładka Kontrola</span> : <span className="ed-st-ok">{ei.check} treść poprawna</span>;

  return (
    <div className="ed-shell">
      <header className="rys-top ed-top">
        <Link href="/edytor" className="ed-back" title="Wszystkie treści">{ei.back}</Link>
        <h1>Edytor treści</h1>
        <span className="rys-sub">Karty › <b>{g.code}</b> — {g.name}</span>
        <span className="rys-saved" role="status">{dirty ? `Niezapisane zmiany${draft ? "" : " · szkic w przeglądarce"}` : "Bez zmian"}{note ? ` · ${note}` : ""}</span>
        <div className="rys-top-actions">
          <div className="rys-seg ed-viewseg" role="radiogroup" aria-label="Widok">
            <button type="button" role="radio" aria-checked={view === "edit"} onClick={() => { setPreviewOf(null); setView("edit"); }}>{ei.pen}Edycja</button>
            <button type="button" role="radio" aria-checked={view === "preview"} onClick={() => openPreview()}>{ei.eye}Podgląd</button>
          </div>
          <button type="button" className="btn ghost" onClick={() => setHistOpen(true)}>{ei.history}Historia</button>
          <a className="btn ghost" href={`/kody/${slug}`} target="_blank" rel="noreferrer">Na stronie ↗</a>
          <button type="button" className="btn" onClick={() => { setPub({ s: "idle" }); setPubOpen(true); }}>{ei.publish}{ja?.mode === "local" ? "Zapisz" : "Opublikuj"}</button>
        </div>
      </header>

      {draft && (
        <div className="ed-banner">
          Masz niezapisany szkic z {czas(draft.at)}.
          <button type="button" className="btn" onClick={() => { loadText(draft.text); setDraft(null); setNote("Wczytano szkic z przeglądarki."); }}>Wczytaj szkic</button>
          <button type="button" className="btn ghost" onClick={() => { kopie.add(path, draft.text, "odrzucony szkic"); szkice.drop(path); setDraft(null); }}>Odrzuć (zostanie w kopiach)</button>
        </div>
      )}

      <div className={`rys-ed ed-ws${view === "preview" ? " is-preview" : ""}`}>
        {view === "edit" ? <Toolbar editor={editor} /> : (
          <div className="rys-bar ed-bar">
            <div className="rys-seg ed-devices" role="radiogroup" aria-label="Szerokość podglądu">
              {(["desktop", "tablet", "phone"] as Device[]).map((d) => <button key={d} type="button" role="radio" aria-checked={device === d} onClick={() => setDevice(d)}>{ei[d]}{d === "desktop" ? "Komputer" : d === "tablet" ? "Tablet" : "Telefon"}</button>)}
            </div>
            <span className="rys-tip">{previewOf ? "Podgląd wybranej wersji z historii." : "Dokładnie tak, jak strona po publikacji — z tą samą kompilacją treści."}</span>
          </div>
        )}
        <div className="rys-stage ed-stage">
          {view === "edit" ? (
            <div className="ed-page"><CardView g={g} article={article} edit={edit} emptyArticle={empty || undefined} /></div>
          ) : (
            <div className="ed-frame-wrap"><iframe className="ed-frame" title="Podgląd strony" src="/edytor/podglad" style={{ width: DEVICE_W[device] }} /></div>
          )}
        </div>
        <Panel tab={tab} setTab={setTab} editor={editor} data={data} onData={setData} problems={problems} checking={checking} />
        <div className="rys-status ed-status">
          {status}
          <span>{meta.headings.length} sekcji</span>
          <span className="rys-hint">Klik w dowolny tekst na stronie — edycja w miejscu. Zaznacz tekst i użyj paska. Alt+↑/↓ przesuwa blok. Szkic zapisuje się sam.</span>
        </div>
      </div>

      <HistoryDialog open={histOpen} onClose={() => setHistOpen(false)} path={path} current={current} onRestore={restore} onPreview={(t) => { setHistOpen(false); openPreview(t); }} />
      <PublishDialog open={pubOpen} onClose={() => setPubOpen(false)} ja={ja} onLogin={login} diff={diff} problems={problems} onPublish={publish} state={pub}
        defaultMessage={`Treść: ${g.code} — ${g.name}`} liveHref={`/kody/${slug}`} />
    </div>
  );
}
