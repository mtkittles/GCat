"use client";
import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { api, ApiError, czas, diffLines, kopie, loginGithub, szkice, type Ja } from "@/lib/edytor/client";
import type { Problem } from "@/lib/edytor/walidacja";
import { HistoryDialog, PublishDialog, type PubState } from "./Dialogs";
import { ei } from "./icons";

/*
  Wspólna część edytorów treści (karta kodu, hasło słownika, …): wersja w repozytorium, szkic w przeglądarce,
  kontrola, publikacja z plikami dodatkowymi (rysunki, obrazy), historia i podgląd w ramce.
*/

export const PREVIEW_KEY = "gcat:edytor:podglad";
const NONE: unknown[] = [];
export type Extra = { path: string; text?: string; base64?: string };

export function useDokument({ path, initial, current, extra, extraLabels, loadText, validate, onPublished }: {
  path: string; initial: string; current: string; extra: Extra[]; extraLabels: string[];
  loadText: (text: string) => void; validate: (text: string) => Promise<Problem[]>; onPublished: () => void;
}) {
  const [base, setBase] = useState<{ text: string; sha: string | null }>({ text: initial, sha: null });
  const [ja, setJa] = useState<Ja | null>(null);
  const [note, setNote] = useState("");
  const [draft, setDraft] = useState<{ text: string; at: number } | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [checking, setChecking] = useState(false);
  const [pub, setPub] = useState<PubState>({ s: "idle" });
  const dirty = current !== base.text || extra.length > 0;

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

  // szkic w przeglądarce (po sekundzie bezczynności)
  useEffect(() => {
    const t = window.setTimeout(() => { if (current !== base.text) szkice.set(path, { text: current, base: base.sha ?? "", at: Date.now() }); else szkice.drop(path); }, 900);
    return () => window.clearTimeout(t);
  }, [current, path, base]);
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  // kontrola: te same reguły co build
  useEffect(() => {
    const t0 = window.setTimeout(() => setChecking(true), 0);
    const t = window.setTimeout(async () => { setProblems(await validate(current)); setChecking(false); }, 700);
    return () => { window.clearTimeout(t0); window.clearTimeout(t); };
  }, [current, validate]);

  const restore = useCallback((text: string, label: string) => {
    kopie.add(path, current, `przed przywróceniem: ${label}`);
    loadText(text);
    setNote(`Przywrócono ${label}. Opublikuj, żeby trafiła na stronę.`);
  }, [path, current, loadText]);

  const publish = async (message: string) => {
    setPub({ s: "busy", step: "Sprawdzam i zapisuję…" });
    kopie.add(path, base.text, "wersja opublikowana przed zmianą");
    try {
      const files = [...(current !== base.text ? [{ path, text: current }] : []), ...extra];
      const r = await api.zapisz(files, message, { [path]: base.sha });
      setBase({ text: current, sha: r.files.find((f) => f.path === path)?.sha ?? base.sha });
      szkice.drop(path);
      setDraft(null);
      onPublished();
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
  return { base, ja, note, setNote, draft, setDraft, problems, checking, pub, setPub, dirty, restore, publish, login, extraLabels };
}

export type Dokument = ReturnType<typeof useDokument>;
export type View = "edit" | "preview";
type Device = "desktop" | "tablet" | "phone";
const DEVICE_W: Record<Device, string> = { desktop: "100%", tablet: "820px", phone: "390px" };

/** Powłoka edytora: górny pasek, baner szkicu, warsztat (dzieci), okna historii i publikacji. */
export function EditorShell({ d, path, current, crumbs, liveHref, defaultMessage, loadText, view, setView, toolbar, page, panel, status, overlay, previewRys = NONE }: {
  d: Dokument; path: string; current: string; crumbs: ReactNode; liveHref: string; defaultMessage: string; loadText: (t: string) => void;
  view: View; setView: (v: View) => void; toolbar: ReactNode; page: ReactNode; panel: ReactNode; status: ReactNode; overlay?: ReactNode;
  /** rysunki jeszcze nieopublikowane — podgląd pokazuje je zamiast wersji ze strony */
  previewRys?: unknown[];
}) {
  const [histOpen, setHistOpen] = useState(false);
  const [pubOpen, setPubOpen] = useState(false);
  const [device, setDevice] = useState<Device>("desktop");
  const [previewOf, setPreviewOf] = useState<string | null>(null);

  // podgląd w ramce: ta sama treść przez localStorage (zdarzenie storage w ramce)
  useEffect(() => {
    if (view !== "preview") return;
    try { localStorage.setItem(PREVIEW_KEY, JSON.stringify({ path, text: previewOf ?? current, rys: previewRys, at: Date.now() })); } catch { /* brak miejsca */ }
  }, [view, current, path, previewOf, previewRys]);
  const openPreview = (text?: string) => { setPreviewOf(text ?? null); setView("preview"); };
  const diff = diffLines(d.base.text, current);

  return (
    <div className="ed-shell">
      <header className="rys-top ed-top">
        <Link href="/edytor" className="ed-back" title="Wszystkie treści">{ei.back}</Link>
        <h1>Edytor treści</h1>
        <span className="rys-sub">{crumbs}</span>
        <span className="rys-saved" role="status">{d.dirty ? "Niezapisane zmiany · szkic w przeglądarce" : "Bez zmian"}{d.note ? ` · ${d.note}` : ""}</span>
        <div className="rys-top-actions">
          <div className="rys-seg ed-viewseg" role="radiogroup" aria-label="Widok">
            <button type="button" role="radio" aria-checked={view === "edit"} onClick={() => { setPreviewOf(null); setView("edit"); }}>{ei.pen}Edycja</button>
            <button type="button" role="radio" aria-checked={view === "preview"} onClick={() => openPreview()}>{ei.eye}Podgląd</button>
          </div>
          <button type="button" className="btn ghost" onClick={() => setHistOpen(true)}>{ei.history}Historia</button>
          <a className="btn ghost" href={liveHref} target="_blank" rel="noreferrer">Na stronie ↗</a>
          <button type="button" className="btn" onClick={() => { d.setPub({ s: "idle" }); setPubOpen(true); }}>{ei.publish}{d.ja?.mode === "local" ? "Zapisz" : "Opublikuj"}</button>
        </div>
      </header>

      {d.draft && (
        <div className="ed-banner">
          Masz niezapisany szkic z {czas(d.draft.at)}.
          <button type="button" className="btn" onClick={() => { loadText(d.draft!.text); d.setDraft(null); d.setNote("Wczytano szkic z przeglądarki."); }}>Wczytaj szkic</button>
          <button type="button" className="btn ghost" onClick={() => { kopie.add(path, d.draft!.text, "odrzucony szkic"); szkice.drop(path); d.setDraft(null); }}>Odrzuć (zostanie w kopiach)</button>
        </div>
      )}

      <div className={`rys-ed ed-ws${view === "preview" ? " is-preview" : ""}`}>
        {view === "edit" ? toolbar : (
          <div className="rys-bar ed-bar">
            <div className="rys-seg ed-devices" role="radiogroup" aria-label="Szerokość podglądu">
              {(["desktop", "tablet", "phone"] as Device[]).map((v) => <button key={v} type="button" role="radio" aria-checked={device === v} onClick={() => setDevice(v)}>{ei[v]}{v === "desktop" ? "Komputer" : v === "tablet" ? "Tablet" : "Telefon"}</button>)}
            </div>
            <span className="rys-tip">{previewOf ? "Podgląd wybranej wersji z historii." : "Dokładnie tak, jak strona po publikacji — z tą samą kompilacją treści."}</span>
          </div>
        )}
        <div className="rys-stage ed-stage">
          {view === "edit" ? <div className="ed-page">{page}</div> : (
            <div className="ed-frame-wrap"><iframe className="ed-frame" title="Podgląd strony" src="/edytor/podglad" style={{ width: DEVICE_W[device] }} /></div>
          )}
        </div>
        {panel}
        <div className="rys-status ed-status">{status}</div>
      </div>

      <HistoryDialog open={histOpen} onClose={() => setHistOpen(false)} path={path} current={current} onRestore={d.restore} onPreview={(t) => { setHistOpen(false); openPreview(t); }} />
      <PublishDialog open={pubOpen} onClose={() => setPubOpen(false)} ja={d.ja} onLogin={d.login} diff={diff} problems={d.problems} onPublish={d.publish} state={d.pub}
        defaultMessage={defaultMessage} liveHref={liveHref} extra={d.extraLabels} />
      {overlay}
    </div>
  );
}

/** Stan kontroli w pasku stanu. */
export function StatusCheck({ problems }: { problems: Problem[] }) {
  return problems.length ? <span className="ed-st-bad">{problems.length} {problems.length === 1 ? "błąd" : "błędy"} — zakładka Kontrola</span> : <span className="ed-st-ok">{ei.check} treść poprawna</span>;
}
