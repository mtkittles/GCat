"use client";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Drawer } from "vaul";
import { toast } from "sonner";
import { ArrowRight, Code2, Copy, Play, X } from "lucide-react";
import SpotlightCard from "@/components/tactile/SpotlightCard";
import GcodeLine from "@/components/pulpit/gcodeTokens";
import { useMedia } from "@/lib/ui/prefs";

/*
  Siatka gotowych programów: karta z miniaturą detalu na siatce współrzędnych, plakietkami narzędzi
  (T01, T0101…), „Podgląd kodu i narzędzi” (panel Vaul: tabela narzędzi i pełny program z kopiowaniem)
  i „Otwórz w symulatorze” (/symulator?program=… — symulator ustawia wtedy narzędzia i półfabrykat programu).
*/
export type GridTool = { t: string; name: string; kind: string };
export type GridProgram = {
  slug: string; title: string; mode: "mill" | "lathe"; category: string; level: string; summary: string;
  features: string[]; tools: GridTool[]; ops: number; blocks: number; src: string; profile: string;
};
export type GridGroup = { key: string; title: string; count: number; cats: { c: string; id: string; items: GridProgram[] }[] };

async function copy(text: string) {
  try { await navigator.clipboard.writeText(text); toast.success("Skopiowano program"); }
  catch { toast.error("Przeglądarka nie pozwoliła skopiować — zaznacz tekst ręcznie."); }
}

export default function ProgramGrid({ groups, previews }: { groups: GridGroup[]; previews: Record<string, ReactNode> }) {
  const [sel, setSel] = useState<GridProgram | null>(null);
  const [open, setOpen] = useState(false);
  const wide = useMedia("(min-width: 768px)", true);

  return (
    <>
      {groups.map((g) => (
        <section key={g.key} id={g.key} className="grid gap-5">
          <h2 className="pg-h">{g.title} <span className="pg-count">{g.count}</span></h2>
          {g.cats.map((c) => (
            <div key={c.id} id={c.id} className="grid gap-3 pgx-cat">
              <h3 className="kc-h">{c.c} <small>{c.items.length}</small></h3>
              <ul className="pgx-grid">
                {c.items.map((p) => (
                  <li key={p.slug}>
                    <SpotlightCard as="article" className="pgx-card" aria-labelledby={`pgx-${p.slug}`}>
                      <Link href={`/programy/${p.slug}`} className="pgx-fig bg-cnc-grid" tabIndex={-1} aria-hidden>{previews[p.slug]}</Link>
                      <div className="pgx-body">
                        <span className="pgx-meta">{p.category} · {p.level}</span>
                        <h4 id={`pgx-${p.slug}`} className="pgx-title"><Link href={`/programy/${p.slug}`}>{p.title}</Link></h4>
                        <p className="pgx-sum">{p.summary}</p>
                        <span className="pgx-tools" aria-label="Narzędzia">
                          {p.tools.map((t) => <code key={t.t} title={t.name}>{t.t}</code>)}
                          <span className="pgx-stat">{p.ops ? `${p.ops} zabiegów · ` : ""}{p.blocks} bloków</span>
                        </span>
                        <div className="pgx-acts">
                          <button type="button" className="cd-copy" onClick={() => { setSel(p); setOpen(true); }} aria-haspopup="dialog"><Code2 aria-hidden /> Podgląd kodu i narzędzi</button>
                          <Link href={`/symulator?program=${p.slug}`} className="btn pgx-sim"><Play aria-hidden /> Otwórz w symulatorze</Link>
                        </div>
                      </div>
                    </SpotlightCard>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}

      <Drawer.Root open={open && !!sel} onOpenChange={(v) => { if (!v) setOpen(false); }} direction={wide ? "right" : "bottom"}>
        <Drawer.Portal>
          <Drawer.Overlay className="vd-overlay" />
          <Drawer.Content className={`vd ${wide ? "vd-right" : "vd-bottom"} cd`} aria-describedby={undefined}>
            {!wide && <div className="vd-handle" aria-hidden />}
            {sel && (
              <>
                <header className="cd-head">
                  <div className="cd-head-top">
                    <span className="cp-k">{sel.mode === "mill" ? "Frezowanie" : "Toczenie"} · {sel.category}</span>
                    <Drawer.Close className="cd-x" aria-label="Zamknij"><X aria-hidden /></Drawer.Close>
                  </div>
                  <Drawer.Title className="cd-title">{sel.title}</Drawer.Title>
                  <p className="cd-meta">{sel.profile}</p>
                </header>
                <div className="cd-body" data-vaul-no-drag={wide ? "" : undefined}>
                  <section className="cd-sec" aria-label="Narzędzia">
                    <h3 className="cp-k">Narzędzia</h3>
                    <table className="task-tools">
                      <thead><tr><th scope="col">T</th><th scope="col">Narzędzie</th><th scope="col">Rodzaj</th></tr></thead>
                      <tbody>{sel.tools.map((t) => <tr key={t.t}><th scope="row"><code>{t.t}</code></th><td>{t.name}</td><td>{t.kind}</td></tr>)}</tbody>
                    </table>
                  </section>
                  <section className="cd-sec" aria-label="Program">
                    <div className="cd-ex-head">
                      <h3 className="cp-k">Program · {sel.blocks} bloków</h3>
                      <button type="button" className="cd-copy" onClick={() => copy(sel.src)}><Copy aria-hidden /> Kopiuj</button>
                    </div>
                    <ol className="cp-lines cd-ex pgx-code" tabIndex={0} aria-label={`Program: ${sel.title}`}>
                      {sel.src.split("\n").map((l, i) => <li key={i}><span className="cp-ln">{String(i + 1).padStart(3, "0")}</span><code><GcodeLine raw={l} /></code></li>)}
                    </ol>
                  </section>
                </div>
                <footer className="cd-foot pgx-foot">
                  <Link href={`/symulator?program=${sel.slug}`} className="btn"><Play aria-hidden /> Otwórz w symulatorze</Link>
                  <Link href={`/programy/${sel.slug}`} className="btn ghost">Karta technologiczna <ArrowRight aria-hidden /></Link>
                </footer>
              </>
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
