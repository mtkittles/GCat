"use client";
import { memo, useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import { useTactileFeedback } from "@/lib/ui/useTactileFeedback";
import { FEED_DETENTS, FEED_MAX, FEED_MIN, snapFeed, stepFeed } from "@/components/simulator/transport";

/*
  Pokrętło override posuwu 0–150% z zapadkami co 10% (Etap 11). Obrót 270°, jak przełącznik
  na pulpicie operatora. Sterowanie: przeciąganie (w górę/w prawo — więcej), kółko myszy,
  strzałki (±10%), PageUp/PageDown (±50%), Home/End, dwuklik — 100%.
  Każda zapadka daje krótki „klik” (wibracja / dźwięk pulpitu), 100% — mocniejszy.
*/

const SWEEP = 270;
const A0 = -135; // kąt dla 0%
const PX_PER_STEP = 14;

const angleOf = (v: number) => A0 + ((v - FEED_MIN) / (FEED_MAX - FEED_MIN)) * SWEEP;
const polar = (r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [50 + r * Math.cos(a), 50 + r * Math.sin(a)] as const;
};
const r1 = (n: number) => Math.round(n * 100) / 100;

function OverrideKnob({ value, onChange, label = "Override posuwu", size = 48, className }: {
  value: number;
  onChange: (v: number) => void;
  label?: string;
  /** średnica w px */
  size?: number;
  className?: string;
}) {
  const feedback = useTactileFeedback();
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; v0: number; last: number } | null>(null);
  const val = useRef(value);
  useEffect(() => { val.current = value; }, [value]);

  const set = (n: number) => {
    const v = snapFeed(n);
    if (v === val.current) return;
    val.current = v;
    feedback(v === 100 ? 1 : 0.5);
    onChange(v);
  };

  // Kółko myszy: nasłuch natywny (React rejestruje wheel jako pasywny — bez preventDefault strona by się przewijała).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX) && Math.abs(e.deltaX) < 1) return;
      e.preventDefault();
      const d = (Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? -e.deltaY : e.deltaX) > 0 ? 1 : -1;
      set(stepFeed(val.current, d));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // set zależy tylko od refów i stabilnego feedback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, v0: val.current, last: val.current };
    e.currentTarget.focus({ preventScroll: true });
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const steps = Math.round(((e.clientX - d.x) - (e.clientY - d.y)) / PX_PER_STEP);
    set(stepFeed(d.v0, steps));
  };
  const end = () => { drag.current = null; };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const k = e.key;
    let n: number | null = null;
    if (k === "ArrowUp" || k === "ArrowRight") n = stepFeed(value, 1);
    else if (k === "ArrowDown" || k === "ArrowLeft") n = stepFeed(value, -1);
    else if (k === "PageUp") n = stepFeed(value, 5);
    else if (k === "PageDown") n = stepFeed(value, -5);
    else if (k === "Home") n = FEED_MIN;
    else if (k === "End") n = FEED_MAX;
    if (n === null) return;
    e.preventDefault();
    e.stopPropagation(); // strzałki symulatora (krok bloku) nie działają, gdy fokus jest na pokrętle
    set(n);
  };

  const ang = angleOf(snapFeed(value));
  const zero = value === 0;
  const over = value > 100;
  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={FEED_MIN}
      aria-valuemax={FEED_MAX}
      aria-valuenow={value}
      aria-valuetext={`${value}%`}
      title={`${label}: ${value}% — przeciągnij, kółko myszy lub strzałki; dwuklik: 100%`}
      className={`knob${zero ? " is-zero" : ""}${over ? " is-over" : ""}${className ? ` ${className}` : ""}`}
      style={{ width: size, height: size }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
      onDoubleClick={() => set(100)}
      onKeyDown={onKey}
    >
      <svg viewBox="0 0 100 100" aria-hidden>
        {/* podziałka: zapadki co 10%, dłuższe kreski na 0, 50, 100, 150 */}
        {FEED_DETENTS.map((d) => {
          const a = angleOf(d);
          const major = d % 50 === 0;
          const [x1, y1] = polar(major ? 40 : 43, a);
          const [x2, y2] = polar(48, a);
          return <line key={d} x1={r1(x1)} y1={r1(y1)} x2={r1(x2)} y2={r1(y2)} className={`knob-tick${major ? " is-major" : ""}${d <= value ? " is-lit" : ""}${d === 100 ? " is-100" : ""}`} />;
        })}
        <circle cx="50" cy="50" r="34" className="knob-body" />
        <circle cx="50" cy="50" r="27" className="knob-cap" />
        <g className="knob-rot" style={{ transform: `rotate(${ang}deg)` }}>
          <line x1="50" y1="19" x2="50" y2="30" className="knob-ptr" />
        </g>
      </svg>
      <span className="knob-val">{value}</span>
    </div>
  );
}

export default memo(OverrideKnob);
