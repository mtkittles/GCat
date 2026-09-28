import { parseProgram, type Segment } from "@/lib/parser";
import { validate } from "@/lib/parser/validate";
import { checkExercise } from "@/lib/checker";
import type { TaskCheck } from "@/lib/lesson";

/*
  Sprawdzanie zadań „dopisz do programu”. Porównywana jest geometria i położenia,
  a nie identyczny zapis. Wydzielone z komponentu, żeby dało się je testować.
*/

const near = (a: number, b: number) => Math.abs(a - b) < 0.011;
const lastRapids = (segs: Segment[]) => segs.filter((s) => s.kind === "rapid");

export function runTaskChecks(src: string, checks: TaskCheck[], mode: "mill" | "lathe") {
  const lathe = mode === "lathe";
  const prog = parseProgram(src, { diameterX: lathe });
  const out: { ok: boolean; label: string; detail?: string }[] = [];
  const errs = [...prog.lines.flatMap((l) => l.errors), ...validate(prog).filter((i) => i.level === "error").map((i) => i.msg)];
  out.push({ ok: errs.length === 0, label: "Program bez błędów składni", detail: errs[0] });
  const moves = prog.segments.filter((s) => s.kind !== "dwell");
  const last = moves.length ? moves[moves.length - 1].to : null;
  const end = last && lathe ? { ...last, x: last.x * 2 } : last;
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
      const res = checkExercise(src, { mode, reference: c.reference, tolerance: c.tolerance ?? 0.05 });
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

