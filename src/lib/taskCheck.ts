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
const fmt = (n: number) => +n.toFixed(3);
const isFeedMove = (s: Segment) => s.kind === "linear" || s.kind === "arc";
const isPlunge = (s: Segment) => s.kind === "linear" && near(s.from.x, s.to.x) && near(s.from.y, s.to.y) && s.to.z < s.from.z - 0.001;
const hasXY = (s: Segment) => (s.kind === "linear" || s.kind === "arc") && (!near(s.from.x, s.to.x) || !near(s.from.y, s.to.y));

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
    } else if (c.t === "feed") {
      // Stan wykonania: jaki F jest aktywny na każdym ruchu danego rodzaju — dopisanie
      // właściwej wartości w innym miejscu programu nie wystarcza.
      const hits = prog.lines.flatMap((l) => l.segments.filter(c.on === "plunge" ? isPlunge : hasXY).map((s) => ({ l, s })));
      const bad = hits.find(({ l }) => l.state.feed === null || Math.abs(l.state.feed - c.f) > 0.001);
      const ok = hits.length > 0 && !bad;
      out.push({ ok, label: c.label, detail: ok ? undefined : bad ? `linia ${bad.l.index + 1}: aktywne F${bad.l.state.feed ?? "—"}` : "brak takiego ruchu w programie" });
    } else if (c.t === "coolant") {
      const cuts = prog.lines.flatMap((l) => l.segments.filter(isFeedMove).map(() => l));
      const dry = cuts.find((l) => !l.state.coolant);
      const ok = cuts.length > 0 && !dry;
      out.push({ ok, label: c.label, detail: ok ? undefined : dry ? `linia ${dry.index + 1}: ruch roboczy bez chłodziwa` : "brak ruchów roboczych" });
      if (c.offBeforeStop) {
        const stop = prog.lines.find((l, i) => i > 0 && l.state.spindleOn === "off" && prog.lines[i - 1].state.spindleOn !== "off");
        const okStop = !!stop && !stop.state.coolant && prog.lines.some((l) => l.index < stop.index && l.state.coolant);
        out.push({ ok: okStop, label: "Chłodziwo wyłączone (M09) przed zatrzymaniem wrzeciona", detail: okStop ? undefined : stop ? `linia ${stop.index + 1}: wrzeciono staje przy włączonym chłodziwie` : "brak zatrzymania wrzeciona" });
      }
    } else if (c.t === "tapFeed") {
      const taps = prog.lines.filter((l) => l.state.cycle?.code === 84 && l.segments.some(isFeedMove));
      const bad = taps.find((l) => {
        const f = l.state.feed, s = l.state.spindle;
        if (f === null) return true;
        if (l.state.feedMode === 95) return Math.abs(f - c.pitch) > 0.001;
        return s === null || Math.abs(f - s * c.pitch) > 0.5;
      });
      const ok = taps.length > 0 && !bad;
      out.push({
        ok, label: c.label,
        detail: ok ? undefined : bad ? `linia ${bad.index + 1}: F${bad.state.feed ?? "—"} przy S${bad.state.spindle ?? "—"} (G${bad.state.feedMode}), skok ${c.pitch}` : "brak ruchów cyklu G84",
      });
    } else if (c.t === "rapidAbove") {
      const lo = Math.min(c.x0, c.x1), hi = Math.max(c.x0, c.x1);
      const low = prog.lines.flatMap((l) => l.segments.filter((s) => s.kind === "rapid").map((s) => ({ l, s }))).find(({ s }) => {
        const a = Math.min(s.from.x, s.to.x), b = Math.max(s.from.x, s.to.x);
        const crosses = b > lo + 0.001 && a < hi - 0.001;
        return crosses && Math.min(s.from.z, s.to.z) <= c.z + 0.001;
      });
      out.push({ ok: !low, label: c.label, detail: low ? `linia ${low.l.index + 1}: przejazd na Z${fmt(Math.min(low.s.from.z, low.s.to.z))}` : undefined });
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

