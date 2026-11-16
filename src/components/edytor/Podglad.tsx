"use client";
import { useEffect, useState, type ReactElement } from "react";
import CardView, { normProgram, type CardArticle } from "@/components/karta/CardView";
import { splitFile } from "@/lib/edytor/plik";
import type { GCode } from "@/lib/gcodes";
import { compileContentMeta, renderContent } from "@/lib/mdx/compile";
import { mdxComponents } from "@/lib/mdx/components";
import { kodToGcode } from "@/lib/mdx/gcode";
import { liveSources } from "@/lib/mdx/live";
import { componentNames, diagramIds } from "@/lib/mdx/names";
import { kodSchema } from "@/lib/mdx/schema";

/*
  Strona podglądu w ramce edytora (komputer / tablet / telefon): ta sama kompilacja MDX co przy buildzie
  i ten sam widok karty co /kody/[slug]. Treść przychodzi z edytora przez localStorage (zdarzenie storage).
*/

const KEY = "gcat:edytor:podglad";
interface State { g: GCode; article: CardArticle | null; error?: string }

async function build(path: string, text: string): Promise<State | { error: string }> {
  const f = splitFile(text);
  const r = kodSchema.safeParse(f.data);
  if (!r.success) return { error: `Pola karty: ${r.error.issues.map((i) => `${i.path.join(".")} — ${i.message}`).join("; ")}` };
  try {
    const { code, meta } = await compileContentMeta(f.body, { file: path, sources: liveSources, components: componentNames, diagramIds });
    const hasArticle = meta.headings.length > 0 || meta.text.trim() !== "";
    const g = kodToGcode(r.data, hasArticle);
    if (!hasArticle) return { g, article: null };
    const node: ReactElement = await renderContent(code, mdxComponents);
    const programs = [...f.body.matchAll(/```[^\n]*\n([\s\S]*?)```/g)].map((m) => normProgram(m[1]));
    return { g, article: { node, headings: meta.headings, hasDiagram: meta.diagrams > 0, hasAddrTable: /^\s*\|\s*Adres\s*\|/m.test(f.body), programs } };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

export default function Podglad() {
  const [st, setSt] = useState<State | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let last = "";
    const load = async () => {
      let p: { path: string; text: string } | null = null;
      try { p = JSON.parse(localStorage.getItem(KEY) ?? "null"); } catch { p = null; }
      if (!p || p.text === last) return;
      last = p.text;
      const r = await build(p.path, p.text);
      if ("g" in r) { setSt(r); setError(""); } else setError(r.error);
    };
    load();
    const h = (e: StorageEvent) => { if (e.key === KEY) load(); };
    window.addEventListener("storage", h);
    return () => window.removeEventListener("storage", h);
  }, []);
  return (
    <>
      {error && <div className="ed-preview-err" role="alert"><b>Treść ma błędy — podgląd pokazuje ostatnią poprawną wersję.</b><pre>{error}</pre></div>}
      {st ? <CardView g={st.g} article={st.article} /> : !error && <p className="text-muted">Wczytuję podgląd…</p>}
    </>
  );
}
