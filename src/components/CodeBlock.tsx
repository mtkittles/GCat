"use client";
import Link from "next/link";
import { toast } from "sonner";
import { Copy, Play } from "lucide-react";
import GcodeLine from "@/components/pulpit/gcodeTokens";
import { simHref } from "@/lib/simLink";

/*
  Blok G-kodu w treści lekcji: numery linii, kolory ruchu jak w symulatorze, kopiowanie
  i „Otwórz w symulatorze”, gdy blok ma ruch albo cykl (G00–G03, G70–G76, G80–G89) i jest zapisany w Fanuc (ISO) — symulator czyta ten zapis.
  Wzory i obliczenia (np. „n = 1000 · vc / (π · D)”) zostają zwykłym blokiem — patrz isProgram w lib/codeBlock.ts.
*/

/** Zapis Sinumerika w lekcji Fanuc (np. tabela porównań): komentarz po średniku, cykle, CR=, AC/IC, frame'y. */
const SINUMERIK = /;|MCALL|CYCLE\d|CR=|LIMS|DIAMON|SUPA|\b(?:A?TRANS|A?ROT|AC|IC)\b/;

export default function CodeBlock({ src, mode, dialect: lessonDialect }: { src: string; mode: "mill" | "lathe"; dialect: "fanuc" | "sinumerik" }) {
  const dialect = lessonDialect === "sinumerik" || SINUMERIK.test(src) ? "sinumerik" : "fanuc";
  const lines = src.split("\n");
  const sim = dialect === "fanuc" && /\bG(0?[0-3]|7[0-6]|8[0-9])\b/.test(src);
  const copy = async () => {
    try { await navigator.clipboard.writeText(src); toast.success("Skopiowano blok G-kodu"); }
    catch { toast.error("Przeglądarka nie pozwoliła skopiować — zaznacz tekst ręcznie."); }
  };
  return (
    <div className="cb">
      <div className="cb-bar">
        <span>{dialect === "fanuc" ? "Fanuc (ISO)" : "Sinumerik"} · {mode === "lathe" ? "tokarka" : "frezarka"}</span>
        <span className="cb-acts">
          <button type="button" className="cd-copy" onClick={copy} aria-label="Kopiuj blok G-kodu"><Copy aria-hidden /> Kopiuj</button>
          {sim && <Link className="cd-copy" href={simHref({ src, mode })}><Play aria-hidden /> Otwórz w symulatorze</Link>}
        </span>
      </div>
      <ol className="cp-lines cb-lines" tabIndex={0} aria-label="Blok G-kodu">
        {lines.map((l, i) => <li key={i}><span className="cp-ln">{String(i + 1).padStart(2, "0")}</span><code><GcodeLine raw={l} /></code></li>)}
      </ol>
    </div>
  );
}
