/**
 * Klasa koloru dla żetonu kodu w tekście, który jest samym słowem ruchu: G00/G0 → is-g00, G01/G1 → is-g01,
 * G02/G2 i G03/G3 → is-g02 (kolory ruchu jak w symulatorze). Każdy inny kod w tekście jest neutralny.
 * Zwraca klasę ze spacją na początku albo pusty napis.
 */
export function motionClass(code: string): string {
  const m = /^G0?([0-3])$/i.exec(code.trim());
  return m ? (m[1] === "3" ? " is-g02" : ` is-g0${m[1]}`) : "";
}
