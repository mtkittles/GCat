/*
  Kolorowanie bloku G-kodu w widżetach pulpitu (Fanuc i Sinumerik): kolory ruchu jak w symulatorze
  (G00 bursztyn, G01 zieleń, G02/G03 błękit), reszta wg zmiennych --cm-* edytora.
*/
const PATTERN = /(MCALL|CYCLE\d+(?:\s*\([^)]*\))?)|(\([^)]*\)|;.*$)|([A-Z]{1,2})(=?)(-?\d*\.?\d*)|(\s+)|(.)/g;

function cls(letter: string, num: string): string {
  if (letter === "G") {
    const n = Number(num);
    return n === 0 ? "tk-g00" : n === 1 ? "tk-g01" : n === 2 || n === 3 ? "tk-g02" : "tk-g";
  }
  if (letter === "M") return "tk-m";
  if (letter === "T" || letter === "D" || letter === "H") return "tk-t";
  if (letter === "F" || letter === "S") return "tk-fs";
  if (letter === "I" || letter === "J" || letter === "K" || letter === "R" || letter === "CR" || letter === "Q") return "tk-ij";
  if (letter === "N") return "tk-cm";
  return "tk-ax";
}

export default function GcodeLine({ raw }: { raw: string }) {
  const out: React.ReactNode[] = [];
  let i = 0;
  for (const m of raw.matchAll(PATTERN)) {
    if (m[0] === "") continue;
    if (m[1]) out.push(<span key={i++} className="tk-kw">{m[1]}</span>);
    else if (m[2]) out.push(<span key={i++} className="tk-cm">{m[2]}</span>);
    else if (m[3]) out.push(<span key={i++} className={cls(m[3], m[5])}>{m[3]}{m[4]}{m[5]}</span>);
    else out.push(m[6] ?? m[7]);
  }
  return <>{out}</>;
}
