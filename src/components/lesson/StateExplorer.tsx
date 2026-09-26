"use client";
import { useMemo, useState } from "react";

/*
  Podgląd stanu modalnego: tapnięcie linii pokazuje, co jest aktywne po jej wykonaniu.
  Zmienione w tej linii grupy są wyróżnione, słowa jednorazowe pokazane osobno.
  Uproszczony odczyt tylko na potrzeby lekcji (bez pełnego parsera symulatora).
*/

type Key = "ruch" | "wymiary" | "plaszczyzna" | "jednostki" | "uklad" | "korekcja" | "F" | "S" | "wrzeciono" | "chlodziwo";
const LABEL: Record<Key, string> = {
  ruch: "Ruch", wymiary: "Wymiary", plaszczyzna: "Płaszczyzna", jednostki: "Jednostki", uklad: "Układ",
  korekcja: "Korekcja R", F: "Posuw F", S: "Obroty S", wrzeciono: "Wrzeciono", chlodziwo: "Chłodziwo",
};
const GROUP: Record<string, Key> = {
  G0: "ruch", G1: "ruch", G2: "ruch", G3: "ruch", G90: "wymiary", G91: "wymiary",
  G17: "plaszczyzna", G18: "plaszczyzna", G19: "plaszczyzna", G20: "jednostki", G21: "jednostki",
  G54: "uklad", G55: "uklad", G56: "uklad", G57: "uklad", G58: "uklad", G59: "uklad",
  G40: "korekcja", G41: "korekcja", G42: "korekcja", M3: "wrzeciono", M4: "wrzeciono", M5: "wrzeciono",
  M8: "chlodziwo", M9: "chlodziwo",
};
const ONESHOT = new Set(["G4", "G28", "G53", "G30"]);
const pad = (w: string) => w.replace(/^([GM])(\d)$/, "$10$2");

interface Row { raw: string; state: Record<Key, string>; changed: Set<Key>; once: string[]; pos: { X: number; Y: number; Z: number } }

function run(program: string): Row[] {
  const st: Record<Key, string> = { ruch: "—", wymiary: "G90", plaszczyzna: "G17", jednostki: "G21", uklad: "G54", korekcja: "G40", F: "—", S: "—", wrzeciono: "M05", chlodziwo: "M09" };
  const pos = { X: 0, Y: 0, Z: 0 };
  return program.split("\n").map((raw) => {
    const text = raw.replace(/\([^)]*\)/g, "").replace(/;.*$/, "").toUpperCase();
    const words = text.match(/[A-Z][-+]?\d*\.?\d+/g) ?? [];
    const changed = new Set<Key>(); const once: string[] = [];
    for (const w of words) {
      const L = w[0], v = Number(w.slice(1));
      if (L === "G" || L === "M") {
        const k = `${L}${v}`;
        if (ONESHOT.has(k)) once.push(pad(k));
        const g = GROUP[k];
        if (g) { st[g] = pad(k); changed.add(g); }
      } else if (L === "F" || L === "S") { st[L] = String(v); changed.add(L); }
    }
    if (!once.some((o) => ["G28", "G53", "G04"].includes(o))) for (const ax of ["X", "Y", "Z"] as const) {
      const w = words.find((x) => x[0] === ax);
      if (w) { const v = Number(w.slice(1)); pos[ax] = st.wymiary === "G91" ? pos[ax] + v : v; }
    }
    return { raw, state: { ...st }, changed, once, pos: { ...pos } };
  });
}

const fmt = (v: number) => (Math.round(v * 1000) / 1000).toString().replace("-", "−");

export default function StateExplorer({ program }: { program: string }) {
  const rows = useMemo(() => run(program), [program]);
  const [sel, setSel] = useState(Math.min(3, rows.length - 1));
  const r = rows[sel];
  const keys = Object.keys(LABEL) as Key[];
  return (
    <div className="se">
      <ol className="se-code">
        {rows.map((row, i) => (
          <li key={i}>
            <button type="button" className={i === sel ? "is-sel" : ""} aria-pressed={i === sel} onClick={() => setSel(i)}>
              <span className="se-n">{i + 1}</span><code>{row.raw || " "}</code>
            </button>
          </li>
        ))}
      </ol>
      <div className="se-panel" aria-live="polite">
        <div className="se-head">Stan po linii {sel + 1}</div>
        <div className="se-grid">
          {keys.map((k) => (
            <div key={k} className={r.changed.has(k) ? "se-cell is-new" : "se-cell"}>
              <span>{LABEL[k]}</span><b>{r.state[k]}</b>
            </div>
          ))}
        </div>
        <div className="se-pos">Pozycja: <b>X{fmt(r.pos.X)} Y{fmt(r.pos.Y)} Z{fmt(r.pos.Z)}</b></div>
        {r.once.length > 0 && <div className="se-once">Tylko w tym bloku: <b>{r.once.join(" ")}</b></div>}
        <p className="se-leg"><i /> zmienione w tej linii</p>
      </div>
    </div>
  );
}
