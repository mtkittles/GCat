import type { Block } from "@/lib/article";
import SimClient from "@/components/simulator/SimClient";
import { diagrams } from "@/components/diagrams";
import RijCalc from "@/components/RijCalc";
import ArcCalc from "@/components/ArcCalc";
import JogDemo from "@/components/lesson/JogDemo";
import { rich } from "@/components/Rich";
export { rich };

export const slugify = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");

export function tocItems(blocks: Block[]) {
  return blocks
    .filter((b): b is Extract<Block, { t: "h" }> => b.t === "h")
    .map((h) => ({ id: h.id ?? slugify(h.x), label: h.x }));
}

export function Toc({ blocks, sticky = false }: { blocks: Block[]; sticky?: boolean }) {
  const hs = blocks.filter((b): b is Extract<Block, { t: "h" }> => b.t === "h");
  if (hs.length < 3) return null;
  return (
    <nav className={`toc ${sticky ? "toc-sticky" : ""}`} aria-label="Spis treści artykułu">
      <span className="toc-title">W tym artykule</span>
      <ol>{hs.map((h) => <li key={h.x}><a href={`#${h.id ?? slugify(h.x)}`}>{h.x}</a></li>)}</ol>
    </nav>
  );
}

export default function Article({ blocks }: { blocks: Block[] }) {
  return (
    <div className="article grid gap-4">
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h": return <h2 key={i} id={b.id ?? slugify(b.x)}>{b.x}</h2>;
          case "p": return <p key={i}>{rich(b.x)}</p>;
          case "ul": return <ul key={i}>{b.items.map((x, j) => <li key={j}>{rich(x)}</li>)}</ul>;
          case "ol": return <ol key={i}>{b.items.map((x, j) => <li key={j}>{rich(x)}</li>)}</ol>;
          case "note": return <aside key={i} className={`note note-${b.kind}`}>{rich(b.x)}</aside>;
          case "code": return <figure key={i} className="grid gap-1"><pre className="syntax">{b.x}</pre>{b.caption && <figcaption className="cap">{rich(b.caption)}</figcaption>}</figure>;
          case "sim": return <figure key={i} className="grid gap-2">{b.caption && <figcaption className="cap">{rich(b.caption)}</figcaption>}<SimClient initial={b.src} mode={b.mode ?? "mill"} /></figure>;
          case "demo": return (
            <figure key={i} className="grid gap-2 demo-fig">
              {b.title && <figcaption className="demo-title">{rich(b.title)}</figcaption>}
              <SimClient initial={b.src} mode={b.mode ?? "mill"} showcase autoplay editable={false} />
              {b.caption && <figcaption className="cap">{rich(b.caption)}</figcaption>}
            </figure>
          );
          case "table": return (
            <figure key={i} className="grid gap-1"><div className="overflow-x-auto"><table className="code-table">
              <thead><tr>{b.head.map((h) => <th key={h}>{rich(h)}</th>)}</tr></thead>
              <tbody>{b.rows.map((r, j) => <tr key={j}>{r.map((c, k2) => <td key={k2}>{rich(c)}</td>)}</tr>)}</tbody>
            </table></div>{b.caption && <figcaption className="cap">{rich(b.caption)}</figcaption>}</figure>
          );
          case "diagram": return <div key={i}>{diagrams[b.id]?.()}</div>;
          case "widget": return b.id === "jog" ? <JogDemo key={i} /> : <div key={i} id="kalkulator-zamiany-r-i-j">{b.id === "arc" ? <ArcCalc /> : <RijCalc />}</div>;
        }
      })}
    </div>
  );
}
