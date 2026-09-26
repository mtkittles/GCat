"use client";
import { useState } from "react";
import Simulator from "@/components/simulator/Simulator";
import { parseProgram, type Segment } from "@/lib/parser";
import { validate } from "@/lib/parser/validate";
import { checkExercise } from "@/lib/checker";
import type { TaskCheck } from "@/lib/lesson";

/*
  Zadanie „dopisz do programu”: edytor z symulatorem, sprawdzanie według listy warunków.
  Porównywana jest geometria i położenia, a nie identyczny zapis.
*/

const near = (a: number, b: number) => Math.abs(a - b) < 0.011;
const lastRapids = (segs: Segment[]) => segs.filter((s) => s.kind === "rapid");

function run(src: string, checks: TaskCheck[]) {
  const prog = parseProgram(src);
  const out: { ok: boolean; label: string; detail?: string }[] = [];
  const errs = [...prog.lines.flatMap((l) => l.errors), ...validate(prog).filter((i) => i.level === "error").map((i) => i.msg)];
  out.push({ ok: errs.length === 0, label: "Program bez błędów składni", detail: errs[0] });
  const moves = prog.segments.filter((s) => s.kind !== "dwell");
  const end = moves.length ? moves[moves.length - 1].to : null;
  for (const c of checks) {
    if (c.t === "end") {
      const ok = !!end && (c.x === undefined || near(end.x, c.x)) && (c.y === undefined || near(end.y, c.y)) && (c.z === undefined || near(end.z, c.z));
      out.push({ ok, label: c.label, detail: ok || !end ? undefined : `narzędzie kończy w X${+end.x.toFixed(3)} Y${+end.y.toFixed(3)} Z${+end.z.toFixed(3)}` });
    } else if (c.t === "approach") {
      const r = lastRapids(prog.segments);
      let ok = false;
      for (let i = 1; i < r.length; i++) {
        const a = r[i - 1], b = r[i];
        if (near(a.to.x, c.x) && near(a.to.y, c.y) && a.to.z > c.z + 0.5 && near(b.to.x, c.x) && near(b.to.y, c.y) && near(b.to.z, c.z) && near(b.from.x, c.x) && near(b.from.y, c.y)) ok = true;
      }
      out.push({ ok, label: c.label });
    } else if (c.t === "cut") {
      const res = checkExercise(src, { mode: "mill", reference: c.reference, tolerance: c.tolerance ?? 0.05 });
      res.checks.slice(1).forEach((k) => out.push(k));
    } else if (c.t === "require" || c.t === "forbid") {
      const up = src.toUpperCase().replace(/\([^)]*\)/g, "");
      for (const code of c.codes) {
        const has = new RegExp(`(^|[^0-9A-Z])${code[0]}0*${code.slice(1)}([^0-9]|$)`, "m").test(up);
        out.push({ ok: c.t === "require" ? has : !has, label: c.t === "require" ? `Użyto ${code}` : `Nie użyto ${code}` });
      }
    }
  }
  return { passed: out.every((o) => o.ok), checks: out };
}

export default function ProgramTask({ starter, checks, hints = [], solution }: { starter: string; checks: TaskCheck[]; hints?: string[]; solution: string }) {
  const [src, setSrc] = useState(starter);
  const [res, setRes] = useState<ReturnType<typeof run> | null>(null);
  const [hint, setHint] = useState(0);
  const [showSol, setShowSol] = useState(false);
  return (
    <div className="ptask">
      <Simulator source={src} onSourceChange={(v) => { setSrc(v); setRes(null); }} mode="mill"
        stock={{ x: 80, y: 50, z: 20, ox: 0, oy: 0, oz: 20 }} />
      <div className="ptask-actions">
        <button type="button" className="btn" onClick={() => setRes(run(src, checks))}>Sprawdź program</button>
        <button type="button" className="btn ghost" onClick={() => { setSrc(starter); setRes(null); }}>Od nowa</button>
        {hint < hints.length && <button type="button" className="btn ghost" onClick={() => setHint(hint + 1)}>Podpowiedź {hint + 1}/{hints.length}</button>}
        <button type="button" className="btn ghost" onClick={() => setShowSol(!showSol)}>{showSol ? "Ukryj rozwiązanie" : "Rozwiązanie"}</button>
      </div>
      {hint > 0 && <ul className="grid gap-2">{hints.slice(0, hint).map((h, i) => <li key={i} className="note note-info">{h}</li>)}</ul>}
      {res && (
        <div className={`result ${res.passed ? "ok" : "bad"}`}>
          <div className="result-head">{res.passed ? "Zaliczone" : "Jeszcze nie"}</div>
          <ul>{res.checks.map((c, i) => <li key={i} className={c.ok ? "ok" : "bad"}><span aria-hidden>{c.ok ? "✓" : "✗"}</span> {c.label}{c.detail ? ` — ${c.detail}` : ""}</li>)}</ul>
        </div>
      )}
      {showSol && (
        <div className="grid gap-2">
          <pre className="syntax">{solution}</pre>
          <button type="button" className="btn ghost w-fit" onClick={() => { setSrc(solution); setRes(null); }}>Wczytaj do edytora</button>
        </div>
      )}
    </div>
  );
}
