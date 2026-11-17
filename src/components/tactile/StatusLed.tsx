/*
  Dioda statusu pulpitu: 6–8 px, poświata w kolorze stanu (tokeny motywu), powolne „oddychanie”
  dla stanu ready. Kolory: ready → --green, on → --accent, warning → --amber, error → --red, idle → --line-strong.
*/
export type LedState = "ready" | "on" | "warning" | "error" | "idle";

export default function StatusLed({ state = "ready", size = 6, pulse, label, className }: {
  state?: LedState; size?: 6 | 7 | 8; pulse?: boolean; label?: string; className?: string;
}) {
  const breathe = pulse ?? state === "ready";
  return (
    <span
      className={`led led-${state}${breathe ? " is-pulse" : ""}${className ? ` ${className}` : ""}`}
      style={{ width: size, height: size }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
