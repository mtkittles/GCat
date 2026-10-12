import { parseProgram, pointAt, segmentLength, type ParsedLine, type Segment } from "@/lib/parser";
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
const codeRe = (code: string) => new RegExp(`(^|[^0-9A-Z])${code[0]}0*${code.slice(1)}([^0-9]|$)`, "m");
const bare = (raw: string) => raw.toUpperCase().replace(/\([^)]*\)/g, "").replace(/;.*$/, "");
const hasWord = (l: ParsedLine, letter: string, value?: number) => l.words.some((w) => w.letter === letter && (value === undefined || Math.abs(w.value - value) < 1e-6));

/**
 * Stan wykonania, którego parser nie trzyma: narzędzie we wrzecionie (T wybiera, M06 wymienia)
 * i rejestr H aktywnej korekcji długości (G43 H…, G49 kasuje). Wartość po wykonaniu linii i.
 */
function execContext(lines: ParsedLine[]) {
  let selected: number | null = null, inSpindle: number | null = null, h: number | null = null;
  return lines.map((l) => {
    const t = l.words.find((w) => w.letter === "T");
    if (t) selected = t.value;
    if (hasWord(l, "M", 6)) inSpindle = selected;
    if (hasWord(l, "G", 49)) h = null;
    if (hasWord(l, "G", 43)) { const hw = l.words.find((w) => w.letter === "H"); h = hw ? hw.value : h; }
    return { tool: inSpindle, h };
  });
}

export function runTaskChecks(src: string, checks: TaskCheck[], mode: "mill" | "lathe") {
  const lathe = mode === "lathe";
  const prog = parseProgram(src, { diameterX: lathe });
  const out: { ok: boolean; label: string; detail?: string }[] = [];
  const errs = [...prog.lines.flatMap((l) => l.errors), ...validate(prog).filter((i) => i.level === "error").map((i) => i.msg)];
  out.push({ ok: errs.length === 0, label: "Program bez błędów składni", detail: errs[0] });
  const moves = prog.segments.filter((s) => s.kind !== "dwell");
  const last = moves.length ? moves[moves.length - 1].to : null;
  const end = last && lathe ? { ...last, x: last.x * 2 } : last;
  const ctx = execContext(prog.lines);
  for (const c of checks) {
    if (c.t === "end") {
      const ok = !!end && (c.x === undefined || near(end.x, c.x)) && (c.y === undefined || near(end.y, c.y)) && (c.z === undefined || near(end.z, c.z));
      out.push({ ok, label: c.label, detail: ok || !end ? undefined : `narzędzie kończy w X${+end.x.toFixed(3)} Y${+end.y.toFixed(3)} Z${+end.z.toFixed(3)}` });
    } else if (c.t === "approach") {
      // Para: przejazd nad punkt wysoko + sam zjazd w Z. Przed zjazdem żaden ruch szybki nie może
      // łączyć XY ze zmianą Z — poprawna para dopisana po błędnym najeździe nie wystarcza.
      const r = lastRapids(prog.segments);
      let hit = -1;
      for (let i = 1; i < r.length && hit < 0; i++) {
        const a = r[i - 1], b = r[i];
        if (near(a.to.x, c.x) && near(a.to.y, c.y) && a.to.z > c.z + 0.5 && near(b.to.x, c.x) && near(b.to.y, c.y) && near(b.to.z, c.z) && near(b.from.x, c.x) && near(b.from.y, c.y)) hit = i;
      }
      const mixed = r.slice(0, hit < 0 ? r.length : hit).find((s) => (!near(s.from.x, s.to.x) || !near(s.from.y, s.to.y)) && !near(s.from.z, s.to.z));
      const ok = hit >= 0 && !mixed;
      out.push({ ok, label: c.label, detail: mixed ? `linia ${mixed.line + 1}: ruch szybki łączy XY ze zmianą Z` : hit < 0 ? "brak przejazdu nad punkt i osobnego zjazdu w Z" : undefined });
    } else if (c.t === "cut") {
      const res = checkExercise(src, { mode, reference: c.reference, tolerance: c.tolerance ?? 0.05 });
      res.checks.slice(1).forEach((k) => out.push(k));
    } else if (c.t === "feed") {
      // Stan wykonania: jaki F jest aktywny na każdym ruchu danego rodzaju — dopisanie
      // właściwej wartości w innym miejscu programu nie wystarcza.
      const hits = prog.lines.flatMap((l) => l.segments.filter(c.on === "plunge" ? isPlunge : hasXY).map((s) => ({ l, s })));
      const tol = c.tol ?? 0.001;
      const bad = hits.find(({ l }) => l.state.feed === null || Math.abs(l.state.feed - c.f) > tol);
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
    } else if (c.t === "require" && c.before === "move") {
      // Kody ustawione, zanim maszyna wykona pierwszy ruch — nie gdziekolwiek w pliku.
      const first = prog.lines.findIndex((l) => l.segments.some((s) => s.kind !== "dwell"));
      const head = prog.lines.slice(0, first < 0 ? prog.lines.length : first).map((l) => bare(l.raw)).join("\n");
      for (const code of c.codes) {
        const ok = codeRe(code).test(head);
        out.push({ ok, label: `${code} przed pierwszym ruchem`, detail: ok ? undefined : codeRe(code).test(bare(src)) ? "stoi dopiero po rozpoczęciu ruchów" : undefined });
      }
    } else if (c.t === "require" || c.t === "forbid") {
      const up = bare(src);
      for (const code of c.codes) {
        const has = codeRe(code).test(up);
        out.push({ ok: c.t === "require" ? has : !has, label: c.t === "require" ? `Użyto ${code}` : `Nie użyto ${code}` });
      }
    } else if (c.t === "state") {
      const hits = prog.lines.flatMap((l, i) => l.segments.filter((s) => isFeedMove(s) && (c.on !== "xy" || hasXY(s)) && (!c.at || (near(s.to.x, c.at.x) && near(s.to.y, c.at.y)))).map(() => ({ l, x: ctx[i] })));
      const why = (h: (typeof hits)[number]) => {
        const st = h.l.state;
        if (c.tool !== undefined && h.x.tool !== c.tool) return `we wrzecionie ${h.x.tool === null ? "brak narzędzia" : `T${h.x.tool}`} zamiast T${c.tool}`;
        if (c.h !== undefined && h.x.h !== c.h) return `aktywna korekcja ${h.x.h === null ? "wyłączona" : `H${h.x.h}`} zamiast H${c.h}`;
        if (c.s !== undefined && (st.spindle === null || Math.abs(st.spindle - c.s) > 0.5)) return `S${st.spindle ?? "—"} zamiast S${c.s}`;
        if (c.dir !== undefined && st.spindleOn !== c.dir) return st.spindleOn === "off" ? "wrzeciono stoi" : `obroty ${st.spindleOn === "cw" ? "w prawo" : "w lewo"}`;
        if (c.abs !== undefined && st.absolute !== c.abs) return st.absolute ? "aktywne G90" : "aktywne G91";
        return null;
      };
      const bad = hits.find((h) => why(h) !== null);
      const ok = hits.length > 0 && !bad;
      out.push({ ok, label: c.label, detail: ok ? undefined : bad ? `linia ${bad.l.index + 1}: ${why(bad)}` : "brak takiego ruchu roboczego" });
    } else if (c.t === "stopBeforeChange") {
      const bad = prog.lines.find((l, i) => hasWord(l, "M", 6) && i > 0 && prog.lines[i - 1].state.spindleOn !== "off");
      out.push({ ok: !bad, label: c.label, detail: bad ? `linia ${bad.index + 1}: M06 przy obracającym się wrzecionie` : undefined });
    } else if (c.t === "dwell") {
      const dw = prog.segments.filter((s): s is Extract<Segment, { kind: "dwell" }> => s.kind === "dwell");
      const here = dw.filter((s) => near(s.to.x, c.x) && near(s.to.y, c.y) && near(s.to.z, c.z));
      const ok = here.some((s) => s.seconds >= c.min - 1e-6);
      const any = here[0] ?? dw[0];
      out.push({ ok, label: c.label, detail: ok ? undefined : any ? `postój ${fmt(any.seconds)} s w X${fmt(any.to.x)} Y${fmt(any.to.y)} Z${fmt(any.to.z)}` : "brak postoju G04" });
    } else if (c.t === "arcFormat") {
      const arcs = prog.lines.filter((l) => l.segments.some((s) => s.kind === "arc"));
      const bad = arcs.find((l) => c.fmt === "R" ? !hasWord(l, "R") : (hasWord(l, "R") || !(hasWord(l, "I") || hasWord(l, "J"))));
      const ok = arcs.length > 0 && !bad;
      out.push({ ok, label: c.label, detail: ok ? undefined : bad ? `linia ${bad.index + 1}: łuk zapisany ${hasWord(bad, "R") ? "przez R" : "przez I/J"}` : "brak łuków G02/G03" });
    } else if (c.t === "winding") {
      // Pole ze wzoru Gaussa na łamanej z próbek ruchów roboczych w XY: ujemne — zgodnie z zegarem.
      const pts = prog.segments.filter(hasXY).flatMap((s) => {
        const n = s.kind === "arc" ? Math.max(4, Math.ceil(segmentLength(s) / 2)) : 1;
        return Array.from({ length: n + 1 }, (_, i) => pointAt(s, i / n));
      });
      let area = 0;
      for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; area += a.x * b.y - b.x * a.y; }
      const dir = area < -1e-6 ? "cw" : area > 1e-6 ? "ccw" : null;
      out.push({ ok: dir === c.dir, label: c.label, detail: dir === c.dir ? undefined : dir ? `obieg ${dir === "cw" ? "zgodnie z ruchem" : "przeciwnie do ruchu"} wskazówek zegara` : "brak zamkniętego obiegu w XY" });
    }
  }
  return { passed: out.every((o) => o.ok), checks: out };
}

