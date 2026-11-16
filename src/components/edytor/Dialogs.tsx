"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { api, czas, diffLines, kopie, type DiffLine, type Ja, type Wersja } from "@/lib/edytor/client";
import type { Problem } from "@/lib/edytor/walidacja";
import { ei } from "./icons";

/* Okna edytora: historia wersji (porównanie, podgląd, przywrócenie) i publikacja. */

function useModal(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const c = () => onClose();
    d.addEventListener("close", c);
    return () => d.removeEventListener("close", c);
  }, [onClose]);
  return ref;
}

/** Różnice z kontekstem: tylko zmienione miejsca i po 2 linie wokół. */
export function DiffView({ lines, empty = "Bez różnic." }: { lines: DiffLine[]; empty?: string }) {
  const keep = useMemo(() => {
    const k = new Set<number>();
    lines.forEach((l, i) => { if (l.t !== "=") for (let j = i - 2; j <= i + 2; j++) k.add(j); });
    return k;
  }, [lines]);
  if (!keep.size) return <p className="rys-tip">{empty}</p>;
  const out: React.ReactNode[] = [];
  let gap = false;
  lines.forEach((l, i) => {
    if (!keep.has(i)) { if (!gap) out.push(<div key={`g${i}`} className="ed-diff-gap">⋯</div>); gap = true; return; }
    gap = false;
    out.push(<div key={i} className={`ed-diff-l is-${l.t === "+" ? "add" : l.t === "-" ? "del" : "eq"}`}><i>{l.t === "=" ? " " : l.t}</i>{l.s || " "}</div>);
  });
  return <div className="ed-diff">{out}</div>;
}

type Pick = { kind: "git"; v: Wersja } | { kind: "kopia"; at: number; label: string; text: string };

export function HistoryDialog(p: {
  open: boolean; onClose: () => void; path: string; current: string;
  onRestore: (text: string, label: string) => void; onPreview: (text: string) => void;
}) {
  const ref = useModal(p.open, p.onClose);
  return (
    <dialog ref={ref} className="ed-dialog ed-history" aria-label="Historia wersji">
      <header><h2>Historia wersji</h2><button type="button" className="btn ghost" onClick={p.onClose}>Zamknij</button></header>
      {p.open && <HistoryBody {...p} />}
    </dialog>
  );
}

/** Treść okna historii — montowana przy każdym otwarciu (świeża lista wersji). */
function HistoryBody({ onClose, path, current, onRestore, onPreview }: { onClose: () => void; path: string; current: string; onRestore: (text: string, label: string) => void; onPreview: (text: string) => void }) {
  const [list, setList] = useState<Wersja[] | null>(null);
  const [err, setErr] = useState("");
  const [pick, setPick] = useState<Pick | null>(null);
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [local] = useState(() => kopie.list(path));
  useEffect(() => {
    api.historia(path).then(setList, (e: Error) => { setErr(e.message); setList([]); });
  }, [path]);
  const sha = pick?.kind === "git" ? pick.v.sha : null;
  useEffect(() => {
    if (!sha || texts[sha] !== undefined) return;
    api.wersja(path, sha).then((t) => setTexts((m) => ({ ...m, [sha]: t })), (e: Error) => setErr(e.message));
  }, [sha, path, texts]);
  const text = pick ? (pick.kind === "kopia" ? pick.text : texts[pick.v.sha] ?? null) : null;
  const diff = useMemo(() => (text === null ? null : diffLines(current, text)), [current, text]);
  const label = pick?.kind === "git" ? `wersja z ${czas(pick.v.date)}` : pick ? `kopia z ${czas(pick.at)}` : "";
  return (
      <div className="ed-hist-body">
        <nav className="ed-hist-list" aria-label="Wersje">
          <h3>Opublikowane</h3>
          {list === null && <p className="rys-tip">Wczytuję…</p>}
          {err && <p className="ed-err">{err}</p>}
          {list?.map((v) => (
            <button key={v.sha} type="button" aria-pressed={pick?.kind === "git" && pick.v.sha === v.sha} onClick={() => setPick({ kind: "git", v })}>
              <b>{czas(v.date)}</b><span>{v.message}</span><small>{v.author} · {v.sha.slice(0, 7)}</small>
            </button>
          ))}
          {list?.length === 0 && !err && <p className="rys-tip">Brak zapisanych wersji.</p>}
          <h3>Kopie w tej przeglądarce</h3>
          {local.map((k) => (
            <button key={k.at} type="button" aria-pressed={pick?.kind === "kopia" && pick.at === k.at} onClick={() => setPick({ kind: "kopia", ...k })}>
              <b>{czas(k.at)}</b><span>{k.label}</span>
            </button>
          ))}
          {!local.length && <p className="rys-tip">Kopie powstają przy każdej publikacji i przed przywróceniem wersji.</p>}
        </nav>
        <section className="ed-hist-view">
          {!pick && <p className="rys-tip">Wybierz wersję z listy — zobaczysz, co różni ją od tego, co masz teraz w edytorze, i możesz ją przywrócić.</p>}
          {pick && text === null && !err && <p className="rys-tip">Wczytuję wersję…</p>}
          {pick && diff && (
            <>
              <div className="ed-hist-acts">
                <span className="rys-tip"><span className="ed-del-k">−</span> teraz w edytorze · <span className="ed-add-k">+</span> {label}</span>
                <button type="button" className="btn ghost" onClick={() => onPreview(text!)}>{ei.eye}Podgląd tej wersji</button>
                <button type="button" className="btn" onClick={() => { onRestore(text!, label); onClose(); }}>{ei.history}Przywróć tę wersję</button>
              </div>
              <DiffView lines={diff} empty="Ta wersja jest taka sama jak treść w edytorze." />
            </>
          )}
        </section>
      </div>
  );
}

export type PubState =
  | { s: "idle" } | { s: "busy"; step: string } | { s: "error"; msg: string; problems?: Problem[]; login?: boolean }
  | { s: "done"; local: boolean; merged: boolean; pr?: { number: number; url: string }; compare?: string; note?: string; live?: boolean };

type PubProps = {
  open: boolean; onClose: () => void; ja: Ja | null; onLogin: () => void; diff: DiffLine[]; problems: Problem[];
  onPublish: (message: string) => void; state: PubState; defaultMessage: string; liveHref: string;
  /** pliki dołączane do publikacji (rysunki, obrazy) */
  extra?: string[];
};
export function PublishDialog(p: PubProps) {
  const ref = useModal(p.open, p.onClose);
  return (
    <dialog ref={ref} className="ed-dialog ed-publish" aria-label="Publikacja">
      <header><h2>{p.ja?.mode === "local" ? "Zapisz na dysk" : "Opublikuj na stronie"}</h2><button type="button" className="btn ghost" onClick={p.onClose}>Zamknij</button></header>
      {p.open && <PublishBody {...p} />}
    </dialog>
  );
}

function PublishBody({ ja, onLogin, diff, problems, onPublish, state, defaultMessage, liveHref, extra = [] }: PubProps) {
  const [msg, setMsg] = useState(defaultMessage);
  const local = ja?.mode === "local";
  const needLogin = !local && !ja?.user;
  const changes = diff.filter((l) => l.t !== "=").length;
  return (
      <div className="ed-pub-body">
        {state.s === "done" ? (
          <div className="ed-pub-done">
            {state.local ? <p className="ed-ok">{ei.check} Zapisano plik na dysku. Odśwież stronę karty, żeby zobaczyć zmianę.</p>
              : state.merged ? (
                <>
                  <p className="ed-ok">{ei.check} Zmiany są w repozytorium{state.pr ? <> (PR <a href={state.pr.url} target="_blank" rel="noreferrer">#{state.pr.number}</a> scalony)</> : null}.</p>
                  <p className={state.live ? "ed-ok" : "rys-tip"}>{state.live ? <>{ei.check} Strona jest już zaktualizowana — <a href={liveHref} target="_blank" rel="noreferrer">zobacz kartę</a>.</> : "Strona się przebudowuje — zwykle 2–3 minuty. To okno samo pokaże, kiedy zmiana będzie widoczna."}</p>
                </>
              ) : (
                <>
                  <p className="ed-warn">Zmiany są zapisane na gałęzi, ale jeszcze nie na stronie.</p>
                  {state.note && <p className="rys-tip">{state.note}</p>}
                  {state.pr ? <a className="btn" href={state.pr.url} target="_blank" rel="noreferrer">Otwórz PR #{state.pr.number} na GitHubie</a>
                    : state.compare ? <a className="btn" href={state.compare} target="_blank" rel="noreferrer">Utwórz PR na GitHubie</a> : null}
                </>
              )}
          </div>
        ) : (
          <>
            {needLogin && (
              <div className="ed-login">
                <p>Publikacja zapisuje zmiany w repozytorium strony na GitHubie. Zaloguj się kontem, które ma prawo zapisu.</p>
                <button type="button" className="btn" onClick={onLogin}>Zaloguj przez GitHub</button>
              </div>
            )}
            {!local && ja?.user && !ja.canWrite && <p className="ed-err">Konto {ja.user.login} nie ma prawa zapisu do repozytorium strony.</p>}
            {problems.length > 0 && (
              <div className="ed-err"><b>Najpierw popraw błędy ({problems.length})</b> — zakładka „Kontrola” w panelu. Z błędami strona by się nie zbudowała.</div>
            )}
            <label className="ed-field"><span>Opis zmiany (widoczny w historii wersji)</span><input value={msg} onChange={(e) => setMsg(e.target.value)} /></label>
            {extra.length > 0 && <p className="rys-tip">Razem z treścią: {extra.join(", ")}.</p>}
            <details className="ed-pub-diff" open={changes <= 30}>
              <summary>Zmienione linie pliku: {changes}</summary>
              <DiffView lines={diff} empty="Brak zmian względem opublikowanej wersji." />
            </details>
            {state.s === "error" && (
              <div className="ed-err">
                <b>{state.msg}</b>
                {state.problems && <ul>{state.problems.map((p, i) => <li key={i}>{p.where}: {p.message}</li>)}</ul>}
              </div>
            )}
            <div className="ed-pub-acts">
              <button type="button" className="btn" disabled={needLogin || (!local && !ja?.canWrite) || problems.length > 0 || (changes === 0 && !extra.length) || state.s === "busy"} onClick={() => onPublish(msg)}>
                {ei.publish}{state.s === "busy" ? state.step : local ? "Zapisz na dysk" : "Opublikuj"}
              </button>
              {!local && <span className="rys-tip">Zapis idzie przez gałąź tresci/… i PR (reguła repozytorium), a potem od razu do strony.</span>}
            </div>
          </>
        )}
      </div>
  );
}
