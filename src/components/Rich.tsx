import Term from "@/components/ui/Term";

/**
 * Inline-markup treści: **pogrubienie**, `kod` oraz [[hasło]] i [[klucz|tekst]],
 * które zamieniają się w pojęcie z podpowiedzią.
 */
export function rich(s: string) {
  const out: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|`([^`]+)`|\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  let last = 0; let m: RegExpExecArray | null; let k = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    if (m[1]) out.push(<strong key={k++}>{m[1]}</strong>);
    else if (m[2]) out.push(<code key={k++} className="inline-code">{m[2]}</code>);
    else out.push(<Term key={k++} k={m[3]}>{m[4] ?? m[3]}</Term>);
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}
