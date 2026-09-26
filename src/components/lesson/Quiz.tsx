"use client";
import { useId, useState, type ReactNode } from "react";
import type { Question } from "@/lib/lesson";
import { rich } from "@/components/Rich";
import { PointGrid } from "./PointGrid";

/*
  Test na koniec lekcji: jedno pytanie na ekranie, ocena od razu z wyjaśnieniem,
  na końcu wynik i możliwość powtórzenia błędnych. Wynik nie jest nigdzie zapisywany.
*/

const num = (s: string) => Number(s.trim().replace(",", ".").replace(/[−–]/g, "-"));
const same = (a: string, b: string) => {
  const x = num(a), y = num(b);
  if (a.trim() !== "" && !Number.isNaN(x) && !Number.isNaN(y)) return Math.abs(x - y) < 1e-9;
  return a.trim().toUpperCase() === b.trim().toUpperCase();
};

type Ans = number | number[] | string[] | [number, number] | null;

function grade(q: Question, a: Ans) {
  if (a === null) return false;
  if (q.kind === "choice") return a === q.answer;
  if (q.kind === "gap") return q.answers.every((acc, i) => acc.some((v) => same((a as string[])[i] ?? "", v)));
  if (q.kind === "token") return a === q.answer;
  if (q.kind === "order") { const o = a as number[]; return o.length === q.answer.length && o.every((v, i) => v === q.answer[i]); }
  const p = a as [number, number]; return p[0] === q.target[0] && p[1] === q.target[1];
}

function GapInput({ template, values, onChange, disabled }: { template: string; values: string[]; onChange: (v: string[]) => void; disabled: boolean }) {
  const parts = template.split(/(\{\d+\})/);
  return (
    <div className="gap-line">
      {parts.map((p, i) => {
        const m = p.match(/^\{(\d+)\}$/);
        if (!m) return <span key={i}>{p}</span>;
        const k = Number(m[1]);
        return (
          <input key={i} inputMode="text" autoCapitalize="characters" spellCheck={false} autoComplete="off" aria-label={`Luka ${k + 1}`} disabled={disabled}
            value={values[k] ?? ""} onChange={(e) => { const v = [...values]; v[k] = e.target.value; onChange(v); }} />
        );
      })}
    </div>
  );
}

export default function Quiz({ questions, figs = {}, drill = false }: { questions: Question[]; figs?: Record<string, ReactNode>; drill?: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [order, setOrder] = useState(() => questions.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [ans, setAns] = useState<Ans>(null);
  const [checked, setChecked] = useState(false);
  const [wrong, setWrong] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  const qi = order[pos];
  const q = questions[qi];

  const restart = (idx: number[]) => { setOrder(idx); setPos(0); setAns(null); setChecked(false); setWrong([]); setScore(0); };

  if (!q) {
    const total = order.length;
    return (
      <div className="quiz quiz-end">
        {drill ? <p className="quiz-drill-done">Zadania zakończone: {score} z {total} za pierwszym razem.</p> : <p className="quiz-score"><b>{score}</b> / {total}</p>}
        {!drill && <p>{score === total ? "Komplet. Możesz przejść dalej." : "Wróć do teorii przy pytaniach, które poszły źle, i spróbuj jeszcze raz."}</p>}
        <div className="quiz-actions">
          {wrong.length > 0 && <button type="button" className="btn" onClick={() => restart(wrong)}>Powtórz błędne ({wrong.length})</button>}
          <button type="button" className="btn ghost" onClick={() => restart(questions.map((_, i) => i))}>Cały test od nowa</button>
        </div>
      </div>
    );
  }

  const ok = checked && grade(q, ans);
  const ready = q.kind === "order" ? Array.isArray(ans) && (ans as number[]).length === q.items.length : q.kind === "gap" ? Array.isArray(ans) && (ans as string[]).filter((v) => v?.trim()).length === q.answers.length : ans !== null;

  const check = () => {
    setChecked(true);
    if (grade(q, ans)) setScore((s) => s + 1); else setWrong((w) => [...w, qi]);
  };
  const next = () => { setPos(pos + 1); setAns(null); setChecked(false); };

  return (
    <div className="quiz">
      <div className="quiz-head">
        <span className="quiz-n">{drill ? "Zadanie" : "Pytanie"} {pos + 1} z {order.length}</span>
        {q.review && <span className="chip chip-info">powtórka z {q.review}</span>}
      </div>
      <div className="quiz-bar" aria-hidden><i style={{ width: `${(pos / order.length) * 100}%` }} /></div>
      <p className="quiz-q">{rich(q.q)}</p>
      {q.kind === "choice" && q.fig && figs[q.fig]}

      {q.kind === "choice" && (
        <div className="quiz-opts" role="radiogroup">
          {q.options.map((o, i) => {
            const state = checked ? (i === q.answer ? "is-ok" : i === ans ? "is-bad" : "") : ans === i ? "is-sel" : "";
            return (
              <button key={i} type="button" role="radio" aria-checked={ans === i} disabled={checked}
                className={`quiz-opt ${state}`} onClick={() => setAns(i)}>
                <span className="quiz-letter">{"ABCD"[i]}</span><span>{rich(o)}</span>
              </button>
            );
          })}
        </div>
      )}
      {q.kind === "gap" && (
        <GapInput template={q.template} values={(ans as string[]) ?? []} onChange={(v) => setAns(v)} disabled={checked} />
      )}
      {q.kind === "token" && (
        <div className="tok-line" role="radiogroup">
          {(q.block.includes("|") ? q.block.split("|").map((x) => x.trim()) : q.block.split(/\s+/)).map((w, i) => {
            const state = checked ? (i === q.answer ? "is-ok" : i === ans ? "is-bad" : "") : ans === i ? "is-sel" : "";
            return <button key={i} type="button" role="radio" aria-checked={ans === i} disabled={checked} className={`tok ${state}`} onClick={() => setAns(i)}>{w}</button>;
          })}
        </div>
      )}
      {q.kind === "order" && (() => {
        const seq = (ans as number[] | null) ?? [];
        const pool = q.items.map((_, i) => i).filter((i) => !seq.includes(i));
        return (
          <div className="ord">
            <ol className="ord-seq">
              {seq.length === 0 && <li className="ord-empty">Tapnij elementy poniżej w kolejności wykonania.</li>}
              {seq.map((i, k) => {
                const st = checked ? (q.answer[k] === i ? "is-ok" : "is-bad") : "";
                return <li key={i}><button type="button" disabled={checked} className={`ord-item ${st}`} onClick={() => setAns(seq.filter((x) => x !== i))}>
                  <span className="ord-n">{k + 1}</span><code>{q.items[i]}</code></button></li>;
              })}
            </ol>
            {pool.length > 0 && (
              <div className="ord-pool">
                {pool.map((i) => <button key={i} type="button" className="tok" disabled={checked} onClick={() => setAns([...seq, i])}>{q.items[i]}</button>)}
              </div>
            )}
          </div>
        );
      })()}
      {q.kind === "point" && (
        <PointGrid id={`q${uid}${qi}`} title="Tapnij, aby zaznaczyć" picked={ans as [number, number] | null}
          onPick={(p) => setAns(p)} target={q.target} reveal={checked} locked={checked} />
      )}

      {checked && (
        <div className={`fb ${ok ? "is-ok" : "is-bad"}`}>
          <b>{ok ? "Dobrze." : "Nie tym razem."}</b>{" "}
          {!ok && q.kind === "order" && <>Poprawnie: {q.answer.map((i) => q.items[i]).join(" → ")}. </>}
          {!ok && q.kind === "gap" && <>Poprawnie: <code className="inline-code">{q.template.replace(/\{(\d+)\}/g, (_, k) => q.answers[+k][0])}</code>. </>}
          {rich(q.why)}
        </div>
      )}
      <div className="quiz-actions">
        {!checked
          ? <button type="button" className="btn" disabled={!ready} onClick={check}>Sprawdź</button>
          : <button type="button" className="btn" onClick={next}>{pos + 1 < order.length ? (drill ? "Następne zadanie" : "Następne pytanie") : (drill ? "Zakończ" : "Zobacz wynik")}</button>}
      </div>
    </div>
  );
}
