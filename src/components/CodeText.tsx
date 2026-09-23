import Term from "./ui/Term";
import { gcodes } from "@/lib/gcodes";

/*
  Jednolity tekst kart: **pogrubienie**, `kod`, [[pojęcie]] / [[klucz|tekst]]
  oraz automatyczne odnośniki: każdy kod G/M, który ma własną kartę, staje się
  linkiem z podpowiedzią. Kody bieżącej karty (self) są tylko wyróżnione.
*/

const KNOWN = new Set<string>();
for (const g of gcodes) for (const c of g.code.toUpperCase().split(/[\s/–-]+/)) if (/^[GM]\d/.test(c)) KNOWN.add(c);

const norm = (c: string) => c.toUpperCase().replace(/^([GM])(\d)$/, "$10$2");

function codes(s: string, self: Set<string>, key: { k: number }) {
  const out: React.ReactNode[] = [];
  const re = /\b([GM]\d{1,3}(?:\.\d)?)\b/g;
  let last = 0; let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const c = norm(m[1]);
    if (self.has(c) || !KNOWN.has(c)) out.push(<code key={key.k++} className="inline-code">{m[1]}</code>);
    else out.push(<Term key={key.k++} k={c}><code className="inline-code is-link">{m[1]}</code></Term>);
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}

export default function CodeText({ text, self = [] }: { text: string; self?: string[] }) {
  const selfSet = new Set(self.map(norm));
  const key = { k: 0 };
  const out: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|`([^`]+)`|\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  let last = 0; let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(...codes(text.slice(last, m.index), selfSet, key));
    if (m[1]) out.push(<strong key={key.k++}>{codes(m[1], selfSet, key)}</strong>);
    else if (m[2]) out.push(<code key={key.k++} className="inline-code">{m[2]}</code>);
    else out.push(<Term key={key.k++} k={m[3]}>{m[4] ?? m[3]}</Term>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(...codes(text.slice(last), selfSet, key));
  return <>{out}</>;
}
