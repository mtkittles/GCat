"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import NumberFlow from "@number-flow/react";
import { useProgress } from "@/lib/progress";
import { activityByDay, level, mapGrid, streak, summary, type MapCell } from "@/lib/activity";
import { pl } from "@/lib/plural";

/*
  Mapa nauki (Etap 12c): dni z nauką jak wykres aktywności GitHuba — kolumna to tydzień (pn–nd),
  odcień to liczba lekcji tego dnia. Tylko dane z zapisu postępu w tej przeglądarce; pusty zapis to pusta mapa.
  Liczba tygodni dopasowana do szerokości. Siatka rysowana dopiero po hydratacji (data „dziś” jest z przeglądarki).
  V3: bez żadnego dnia nauki (i przed hydratacją) mapa jest zwinięta do jednego rzędu z opisem i przyciskiem
  do pierwszej lekcji — zamiast trzech zer i pustej siatki na cały ekran.
*/
export type MapLesson = { track: "frezowanie" | "toczenie"; id: string; title: string };

const CELL = 13, GAP = 3, LABELS = 26;
const MONTHS = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
const DAYS = ["pn", "wt", "śr", "cz", "pt", "so", "nd"];
const hydrated = () => true;
const noop = () => () => {};

function describe(c: MapCell, names: Map<string, string>): string {
  const d = `${DAYS[(c.date.getDay() + 6) % 7]} ${c.date.getDate()} ${MONTHS[c.date.getMonth()]}`;
  if (!c.a) return `${d}: bez nauki`;
  const ids = c.a.lessons.map((k) => names.get(k) ?? k.split("/")[1]);
  const extra = [c.a.tests ? pl(c.a.tests, "test", "testy", "testów") : "", c.a.done ? `ukończone: ${c.a.done}` : ""].filter(Boolean);
  return `${d}: ${pl(ids.length, "lekcja", "lekcje", "lekcji")} (${ids.join(", ")})${extra.length ? ` · ${extra.join(" · ")}` : ""}`;
}

export default function LearnMap({ lessons, first }: { lessons: MapLesson[]; first: string }) {
  const store = useProgress();
  const live = useSyncExternalStore(noop, hydrated, () => false);
  const boxRef = useRef<HTMLDivElement>(null);
  const [weeks, setWeeks] = useState(26);
  const [cell, setCell] = useState(CELL);
  const [pick, setPick] = useState<MapCell | null>(null);

  const names = useMemo(() => new Map(lessons.map((l) => [`${l.track}/${l.id}`, l.id])), [lessons]);
  // tylko lekcje z planu kursu — klucze ze starszych wersji serwisu nie zawyżają mapy
  const mine = useMemo(() => Object.fromEntries(Object.entries(store).filter(([k]) => names.has(k))), [store, names]);
  const by = useMemo(() => activityByDay(mine), [mine]);
  const today = useMemo(() => (live ? new Date() : null), [live]);
  const cols = useMemo(() => (today ? mapGrid(by, today, weeks) : []), [by, today, weeks]);
  const sum = useMemo(() => summary(cols, mine), [cols, mine]);
  const run = today ? streak(by, today) : 0;
  const empty = live && by.size === 0;
  const full = live && !empty;

  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    // tyle tygodni, ile się zmieści (12–53); przy pełnym roku komórki rosną do 18 px, żeby wypełnić szerokość
    const fit = () => {
      const w = el.clientWidth - LABELS + GAP;
      const n = Math.max(12, Math.min(53, Math.floor(w / (CELL + GAP))));
      setWeeks(n);
      setCell(n === 53 ? Math.max(CELL, Math.min(18, Math.floor(w / 53) - GAP)) : CELL);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [full]);

  // podpisy miesięcy nad kolumną, w której zaczyna się miesiąc (pierwszy poniedziałek miesiąca albo pierwsza kolumna)
  const months = cols.map((c, i) => {
    const m = c[0].date.getMonth();
    return i === 0 ? (c[0].date.getDate() <= 7 ? MONTHS[m] : "") : m !== cols[i - 1][0].date.getMonth() ? MONTHS[m] : "";
  });

  const label = !live ? "Mapa nauki"
    : `Mapa nauki z ostatnich ${weeks} tygodni: ${pl(sum.days, "dzień", "dni", "dni")} z nauką, seria ${pl(run, "dzień", "dni", "dni")}.`;

  if (!full) {
    return (
      <div className="nm nm-empty" aria-busy={!live || undefined}>
        <div className="nm-empty-t">
          <p className="nm-empty-h">{live ? "Zapełni się po pierwszej lekcji" : "Mapa nauki"}</p>
          <p className="nm-info">Dni nauki, seria i ukończone lekcje. Zapis zostaje w tej przeglądarce.</p>
        </div>
        <span className="nm-mini" aria-hidden>{Array.from({ length: 80 }, (_, i) => <i key={i} />)}</span>
        <Link href={first} className="btn ghost nm-go">Otwórz pierwszą lekcję</Link>
      </div>
    );
  }

  return (
    <div className="nm">
      <dl className="rp-dro nm-dro">
        <div><dt>Dni z nauką{live ? ` · ${weeks} tyg.` : ""}</dt><dd><NumberFlow value={live ? sum.days : 0} /></dd></div>
        <div><dt>Seria</dt><dd><NumberFlow value={live ? run : 0} /><small>{run === 1 ? "dzień" : "dni"}</small></dd></div>
        <div><dt>Ukończone lekcje</dt><dd><NumberFlow value={live ? sum.finished : 0} /><small>/ {lessons.length}</small></dd></div>
      </dl>

      <div ref={boxRef} className="nm-box">
        {!live ? <div className="nm-skel skel" aria-hidden /> : (
          <div className="nm-grid" role="img" aria-label={label} style={{ ["--w" as string]: weeks, ["--c" as string]: `${cell}px` }}
            onPointerLeave={() => setPick(null)}>
            <span className="nm-corner" aria-hidden />
            {months.map((m, i) => <span key={`m${i}`} className="nm-month" aria-hidden style={{ gridColumn: i + 2 }}>{m}</span>)}
            {[0, 2, 4].map((d) => <span key={`d${d}`} className="nm-dow" aria-hidden style={{ gridRow: d + 2 }}>{DAYS[d]}</span>)}
            {cols.map((col, ci) => col.map((c, di) => (
              <span key={c.day} aria-hidden
                className={`nm-c nm-l${c.future ? "x" : level(c.a?.lessons.length ?? 0)}${pick?.day === c.day ? " is-pick" : ""}${c.a?.done ? " is-done" : ""}`}
                style={{ gridColumn: ci + 2, gridRow: di + 2 }} title={c.future ? undefined : describe(c, names)}
                onPointerEnter={(e) => { if (e.pointerType === "mouse" && !c.future) setPick(c); }}
                onClick={() => { if (!c.future) setPick(c); }} />
            )))}
          </div>
        )}
      </div>

      <div className="nm-foot">
        <p className="nm-info" aria-live="polite">
          {!live ? " "
            : pick ? describe(pick, names)
            : "Wskaż dzień, żeby zobaczyć lekcje. Odcień — liczba lekcji tego dnia; kropka — ukończenie."}
        </p>
        <span className="nm-legend" aria-hidden>mniej<i className="nm-c nm-l0" /><i className="nm-c nm-l1" /><i className="nm-c nm-l2" /><i className="nm-c nm-l3" /><i className="nm-c nm-l4" />więcej</span>
      </div>
    </div>
  );
}
