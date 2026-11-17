"use client";
import { memo, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import StatusLed from "./StatusLed";
import { useTactileFeedback } from "@/lib/ui/useTactileFeedback";

/*
  Przełącznik trybów pulpitu: zagłębiona szyna, kapsuła przesuwana sprężyną (motion, layoutId)
  i dioda w aktywnym przycisku. Semantyka radiogroup, strzałki zmieniają wybór.
*/
export interface Segment<T extends string> { value: T; label: ReactNode; title?: string; led?: boolean }

function TactileSegmentedControl<T extends string>({ value, onChange, options, label, size = "md", full, className }: {
  value: T;
  onChange: (v: T) => void;
  options: Segment<T>[];
  /** nazwa grupy dla czytników ekranu */
  label: string;
  size?: "sm" | "md";
  /** rozciągnij na całą szerokość rodzica */
  full?: boolean;
  className?: string;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const feedback = useTactileFeedback();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const pick = (v: T) => { if (v !== value) { feedback(); onChange(v); } };
  const onKey = (e: KeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + options.length) % options.length;
    pick(options[n].value);
    refs.current[n]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={label} className={`tsc tsc-${size}${full ? " is-full" : ""}${className ? ` ${className}` : ""}`}>
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            title={o.title}
            className={`tsc-btn${on ? " is-on" : ""}`}
            onClick={() => pick(o.value)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {on && (
              <motion.span
                layoutId={`tsc-${id}`}
                className="tsc-cap"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 38, mass: 0.7 }}
                aria-hidden
              />
            )}
            <span className="tsc-in">
              {o.led !== false && <StatusLed state={on ? "on" : "idle"} pulse={false} />}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/*
  Bez ponownego renderu, gdy nic widocznego się nie zmieniło. Ważne w symulatorze: komponent nadrzędny
  renderuje się w każdej klatce odtwarzania, a kapsuła z layoutId mierzy układ przy każdym renderze.
  onChange pomijamy w porównaniu — rodzice przekazują funkcje o tym samym działaniu w każdym renderze.
*/
type Props = Parameters<typeof TactileSegmentedControl>[0];
const sameOpts = (a: Props["options"], b: Props["options"]) =>
  a.length === b.length && a.every((o, i) => {
    const p = b[i];
    if (o.value !== p.value || o.title !== p.title || o.led !== p.led) return false;
    return typeof o.label === "string" || typeof p.label === "string" ? o.label === p.label : typeof o.label === typeof p.label;
  });

export default memo(TactileSegmentedControl, (a, b) =>
  a.value === b.value && a.label === b.label && a.size === b.size && a.full === b.full && a.className === b.className && sameOpts(a.options, b.options),
) as typeof TactileSegmentedControl;
