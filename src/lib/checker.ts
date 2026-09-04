import { parseProgram, pointAt, segmentLength, type Segment, type Vec3 } from "@/lib/parser";
import { validate } from "@/lib/parser/validate";

export interface CheckResult {
  passed: boolean;
  score: number;          // 0–100
  checks: { ok: boolean; label: string; detail?: string }[];
}

const dist = (a: Vec3, b: Vec3) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/** Próbkuje tor roboczy (bez szybkich przejazdów) co ~0,5 mm. */
function sampleCut(segments: Segment[], step = 0.5): Vec3[] {
  const out: Vec3[] = [];
  for (const sg of segments) {
    if (sg.kind === "rapid") continue;
    const len = segmentLength(sg);
    const n = Math.max(2, Math.ceil(len / step));
    for (let i = 0; i <= n; i++) out.push(pointAt(sg, i / n));
  }
  return out;
}

/** Największa odległość punktu z A od najbliższego punktu w B (odległość Hausdorffa, jednostronna). */
function maxDeviation(a: Vec3[], b: Vec3[]) {
  if (!a.length || !b.length) return Infinity;
  let worst = 0;
  for (const p of a) {
    let best = Infinity;
    for (const q of b) { const d = dist(p, q); if (d < best) best = d; if (best < 1e-6) break; }
    if (best > worst) worst = best;
  }
  return worst;
}

const cutLength = (segs: Segment[]) => segs.filter((s) => s.kind !== "rapid").reduce((a, s) => a + segmentLength(s), 0);

export interface ExerciseSpec {
  mode: "mill" | "lathe";
  reference: string;
  tolerance?: number;      // dopuszczalne odchylenie toru [mm]
  requireCodes?: string[]; // kody, które muszą wystąpić (np. ["G02","G41"])
  forbidCodes?: string[];
  maxCutLength?: number;   // margines na długość toru roboczego, w procentach
}

export function checkExercise(source: string, spec: ExerciseSpec): CheckResult {
  const tol = spec.tolerance ?? 0.05;
  const dia = spec.mode === "lathe";
  const user = parseProgram(source, { diameterX: dia });
  const ref = parseProgram(spec.reference, { diameterX: dia });
  const checks: CheckResult["checks"] = [];

  const errs = user.lines.flatMap((l) => l.errors);
  const issues = validate(user).filter((i) => i.level === "error");
  checks.push({ ok: errs.length === 0 && issues.length === 0, label: "Program bez błędów składni", detail: [...errs, ...issues.map((i) => i.msg)][0] });

  const uCut = user.segments.filter((s) => s.kind !== "rapid");
  checks.push({ ok: uCut.length > 0, label: "Program zawiera ruchy robocze" });

  if (uCut.length) {
    const a = sampleCut(user.segments), b = sampleCut(ref.segments);
    const devA = maxDeviation(a, b);   // czy nie skrawasz tam, gdzie nie trzeba
    const devB = maxDeviation(b, a);   // czy nie brakuje fragmentu konturu
    checks.push({ ok: devA <= tol, label: "Tor nie wychodzi poza zadany kontur", detail: devA <= tol ? undefined : `największe odchylenie ${devA.toFixed(2)} mm` });
    checks.push({ ok: devB <= tol, label: "Cały kontur został obrobiony", detail: devB <= tol ? undefined : `niepokryty fragment, odchylenie ${devB.toFixed(2)} mm` });

    if (spec.maxCutLength) {
      const lu = cutLength(user.segments), lr = cutLength(ref.segments);
      const ratio = lu / Math.max(1e-6, lr);
      checks.push({ ok: ratio <= 1 + spec.maxCutLength / 100, label: "Tor nie jest nadmiernie wydłużony", detail: ratio > 1 + spec.maxCutLength / 100 ? `${Math.round((ratio - 1) * 100)}% dłuższy niż wzorcowy` : undefined });
    }
  }

  const up = source.toUpperCase();
  const norm = (c: string) => new RegExp(`(^|[^0-9A-Z])${c[0]}0*${c.slice(1)}([^0-9]|$)`, "m");
  for (const c of spec.requireCodes ?? []) checks.push({ ok: norm(c).test(up), label: `Użyto ${c}` });
  for (const c of spec.forbidCodes ?? []) checks.push({ ok: !norm(c).test(up), label: `Nie użyto ${c}` });

  const passed = checks.every((c) => c.ok);
  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
  return { passed, score, checks };
}
