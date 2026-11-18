"use client";
import Link from "next/link";
import { Drawer } from "vaul";
import { toast } from "sonner";
import { ArrowRight, Copy, Play, X } from "lucide-react";
import CodeText from "@/components/CodeText";
import GcodeLine from "@/components/pulpit/gcodeTokens";
import StatusLed from "@/components/tactile/StatusLed";
import { levelName, type GCode } from "@/lib/gcodes";
import { simHref } from "@/lib/simLink";
import { useMedia } from "@/lib/ui/prefs";
import { snapProps, useSheetSnap } from "@/lib/ui/sheetSnap";

/*
  Szczegóły kodu bez opuszczania katalogu: panel Vaul z prawej (komputer) albo dolny arkusz
  zamykany gestem (telefon). Treść z karty (content/kody/*.mdx): składnia Fanuc i Sinumerik,
  adresy, przykład z przyciskiem do symulatora, uwagi Sinumerika i „Na co uważać”. Pełna karta — link na dole.
*/

async function copy(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`Skopiowano: ${what}`);
  } catch {
    toast.error("Przeglądarka nie pozwoliła skopiować — zaznacz tekst ręcznie.");
  }
}

function Syntax({ label, text }: { label: string; text: string }) {
  return (
    <div className="cd-syn">
      <div className="cd-syn-bar">
        <span>{label}</span>
        <button type="button" className="cd-copy" onClick={() => copy(text, `składnia ${label}`)} aria-label={`Kopiuj składnię ${label}`}><Copy aria-hidden /> Kopiuj</button>
      </div>
      <pre>{text.split("\n").map((l, i) => <code key={i}><GcodeLine raw={l} /></code>)}</pre>
    </div>
  );
}

/** `g` zostaje po zamknięciu (open = false), żeby treść nie znikała w trakcie animacji wyjścia. */
export default function CodeDrawer({ g, open, onClose }: { g: GCode | null; open: boolean; onClose: () => void }) {
  const wide = useMedia("(min-width: 768px)", true);
  const self = g ? g.code.toUpperCase().split(/[\s/–-]+/).filter((c) => /^[GM]\d/.test(c)) : [];
  const mode = g ? g.exampleMode ?? (g.turning && !g.milling ? "lathe" : "mill") : "mill";
  const sheet = useSheetSnap(open && !!g);

  return (
    <Drawer.Root open={open && !!g} onOpenChange={(v) => { if (!v) onClose(); }} direction={wide ? "right" : "bottom"}
      {...snapProps(!wide, sheet)}>
      <Drawer.Portal>
        <Drawer.Overlay className="vd-overlay" />
        <Drawer.Content className={`vd ${wide ? "vd-right" : `vd-bottom is-snap${sheet.full ? " is-full" : ""}`} cd`} aria-describedby={undefined}>
          {!wide && <div className="vd-handle" aria-hidden />}
          {g && (
            <>
              <header className="cd-head">
                <div className="cd-head-top">
                  <code className="cd-code">{g.code}</code>
                  <span className="cd-modal"><StatusLed state={g.modal ? "ready" : "idle"} pulse={false} />{g.modal ? "Modalny" : "Niemodalny"}</span>
                  <Drawer.Close className="cd-x" aria-label="Zamknij"><X aria-hidden /></Drawer.Close>
                </div>
                <Drawer.Title className="cd-title">{g.name}</Drawer.Title>
                <p className="cd-meta">{g.group} · {[g.milling && "frezowanie", g.turning && "toczenie"].filter(Boolean).join(" / ")} · {levelName(g.level)}{g.star ? " · ★ karta opracowana" : ""}</p>
              </header>

              <div className="cd-body" data-vaul-no-drag={wide ? "" : undefined}>
                <p className="cd-short"><CodeText text={g.short} self={self} /></p>

                <section className="cd-sec" aria-label="Składnia">
                  <h3 className="cp-k">Składnia — porównanie</h3>
                  <div className="cd-syns">
                    <Syntax label="Fanuc" text={g.syntax.fanuc} />
                    <Syntax label="Sinumerik" text={g.syntax.sinumerik} />
                  </div>
                </section>

                {g.params.length > 0 && (
                  <section className="cd-sec" aria-label="Adresy">
                    <h3 className="cp-k">Adresy</h3>
                    <table className="cd-params">
                      <tbody>{g.params.map((p) => <tr key={p.key}><th scope="row"><code>{p.key}</code></th><td><CodeText text={p.desc} self={self} /></td></tr>)}</tbody>
                    </table>
                  </section>
                )}

                {g.example && (
                  <section className="cd-sec" aria-label="Przykład">
                    <div className="cd-ex-head">
                      <h3 className="cp-k">Przykład · {g.exampleDialect === "sinumerik" ? "Sinumerik" : "Fanuc"} · {mode === "lathe" ? "tokarka" : "frezarka"}</h3>
                      <button type="button" className="cd-copy" onClick={() => copy(g.example, `przykład ${g.code}`)}><Copy aria-hidden /> Kopiuj</button>
                    </div>
                    <ol className="cp-lines cd-ex" tabIndex={0} aria-label={`Przykład ${g.code}`}>
                      {g.example.split("\n").map((l, i) => <li key={i}><span className="cp-ln">{String(i + 1).padStart(2, "0")}</span><code><GcodeLine raw={l} /></code></li>)}
                    </ol>
                    {g.simulate === false
                      ? <p className="cd-note">Symulator nie odtwarza tego przykładu — opis działania jest w pełnej karcie.</p>
                      : <Link className="btn cd-run" href={simHref({ src: g.example, mode, stock: g.exampleStock, dialect: g.exampleDialect, name: `${g.code} — przykład` })}><Play aria-hidden /> Uruchom przykład w symulatorze</Link>}
                  </section>
                )}

                {g.sinumerik && (
                  <section className="cd-sec" aria-label="Sinumerik">
                    <h3 className="cp-k">Sinumerik</h3>
                    <p className="cd-p"><CodeText text={g.sinumerik} self={self} /></p>
                  </section>
                )}

                {g.pitfalls.length > 0 && (
                  <section className="cd-warn" aria-label="Na co uważać">
                    <h3><StatusLed state="warning" />Na co uważać</h3>
                    <ul>{g.pitfalls.map((p, k) => <li key={k}><CodeText text={p} self={self} /></li>)}</ul>
                  </section>
                )}
              </div>

              <footer className="cd-foot">
                <Link href={`/kody/${g.slug}`} className="btn ghost">Pełna karta {g.code} <ArrowRight aria-hidden /></Link>
              </footer>
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
