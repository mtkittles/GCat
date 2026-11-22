import Term from "@/components/ui/Term";
import { motionClass } from "@/lib/motionClass";
import { tex } from "@/components/Wzor";

/**
 * Inline-markup treści: **pogrubienie**, `kod` oraz [[hasło]] i [[klucz|tekst]],
 * które zamieniają się w pojęcie z podpowiedzią, i wzór w zdaniu \(…\) — LaTeX, skład KaTeX
 * (standard treści: ułamek jako licznik i mianownik także w przykładzie liczbowym, np. \(\frac{1000 \cdot 80}{\pi \cdot 10}\);
 * skład jak we wzorze w ramce — \displaystyle, żeby ułamek nie malał w zdaniu).
 */
export const INLINE_MATH = /\\\((.+?)\\\)/g;
export function rich(s: string) {
  const out: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|`([^`]+)`|\[\[([^\]|]+)(?:\|([^\]]+))?\]\]|\\\((.+?)\\\)/g;
  let last = 0; let m: RegExpExecArray | null; let k = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    if (m[5]) out.push(<span key={k++} className="m-inline" dangerouslySetInnerHTML={{ __html: tex(`\\displaystyle ${m[5]}`, false) }} />);
    else if (m[1]) out.push(<strong key={k++}>{m[1]}</strong>);
    else if (m[2]) out.push(<code key={k++} className={`inline-code${motionClass(m[2])}`}>{m[2]}</code>);
    else out.push(<Term key={k++} k={m[3]}>{m[4] ?? m[3]}</Term>);
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}
