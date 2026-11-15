"use client";
import { useEffect, useRef, useState } from "react";
import { svgToDoc, sanitizeSvg, type ImportResult } from "./importSvg";
import { RysThumb } from "./Thumb";

/*
  Okno „Importuj ze strony”: wczytuje stronę serwisu (ta sama domena), pokazuje jej rysunki jako miniatury
  i podstrony do przejścia dalej. Wybrany rysunek wraca do edytora jako elementy rysownika.
*/

const SECTIONS: [string, string][] = [
  ["/kody", "Karty kodów"], ["/slownik", "Słownik"], ["/nauka/frezowanie", "Nauka — frezowanie"], ["/nauka/toczenie", "Nauka — toczenie"],
  ["/zadania", "Zadania"], ["/kalkulator", "Kalkulator"], ["/edycja", "Rysunki z rysownika"],
];
const SUBPAGES = /^\/(kody|nauka|zadania)\/[^#?]+$/;

interface Found { title: string; res: ImportResult }
interface Props { onImport: (r: ImportResult, mode: "replace" | "add") => void; onClose: () => void }

export default function ImportDialog({ onImport, onClose }: Props) {
  const dlg = useRef<HTMLDialogElement>(null), host = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState("/kody");
  const [state, setState] = useState<{ busy: boolean; err: string; figs: Found[]; links: [string, string][]; page: string }>({ busy: false, err: "", figs: [], links: [], page: "" });

  useEffect(() => { dlg.current?.showModal(); }, []);

  const load = async (p: string) => {
    const to = p.trim().startsWith("/") ? p.trim() : `/${p.trim()}`;
    setPath(to);
    setState((s) => ({ ...s, busy: true, err: "" }));
    try {
      const r = await fetch(to, { credentials: "same-origin" });
      if (!r.ok) throw new Error(`strona ${to} odpowiedziała ${r.status}`);
      const html = new DOMParser().parseFromString(await r.text(), "text/html");
      const figs: Found[] = [];
      for (const fig of Array.from(html.querySelectorAll("figure.fig"))) {
        const svg = fig.querySelector('svg[role="img"]');
        if (!svg || !host.current) continue;
        const title = (fig.querySelector(".fig-head")?.textContent ?? "Rysunek").trim();
        const node = document.importNode(svg, true) as SVGSVGElement;
        sanitizeSvg(node);
        host.current.replaceChildren(node);
        try { const res = svgToDoc(node); if (res.items.length) figs.push({ title, res }); } catch { /* rysunek, którego nie umiemy odczytać */ }
      }
      host.current?.replaceChildren();
      const seen = new Set<string>(), links: [string, string][] = [];
      for (const a of Array.from(html.querySelectorAll("main a[href]"))) {
        const href = a.getAttribute("href")!.split("#")[0];
        if (!SUBPAGES.test(href) || seen.has(href) || href === to) continue;
        seen.add(href);
        links.push([href, (a.textContent ?? href).replace(/\s+/g, " ").trim().slice(0, 70) || href]);
      }
      setState({ busy: false, err: "", figs, links: links.slice(0, 300), page: to });
    } catch (e) {
      setState((s) => ({ ...s, busy: false, err: `Nie udało się wczytać: ${e instanceof Error ? e.message : String(e)}` }));
    }
  };

  return (
    <dialog ref={dlg} className="rys-import" aria-label="Importuj rysunek ze strony" onClose={onClose}>
      <header>
        <h2>Importuj rysunek ze strony</h2>
        <button type="button" className="btn ghost" onClick={() => dlg.current?.close()}>Zamknij</button>
      </header>
      <form className="rys-import-bar" onSubmit={(e) => { e.preventDefault(); load(path); }}>
        <label>Adres strony <input type="text" value={path} onChange={(e) => setPath(e.target.value)} placeholder="/kody/g02" spellCheck={false} /></label>
        <button type="submit" className="btn" disabled={state.busy}>{state.busy ? "Wczytuję…" : "Wczytaj"}</button>
      </form>
      <nav className="rys-import-sections" aria-label="Działy">
        {SECTIONS.map(([p, l]) => <button key={p} type="button" className={state.page === p ? "is-on" : undefined} onClick={() => load(p)}>{l}</button>)}
      </nav>
      <div className="rys-import-body">
        {state.err && <p className="rys-import-err" role="alert">{state.err}</p>}
        {!state.page && !state.err && <p className="rys-tip">Wybierz dział albo wpisz adres strony, np. <code>/kody/g02</code> albo <code>/nauka/frezowanie/f3-2</code>. Rysunek trafi do rysownika jako osobne elementy: linie, łuki, wymiary i teksty do dalszej edycji.</p>}
        {state.page && (
          <>
            <h3>Rysunki na stronie <code>{state.page}</code> ({state.figs.length})</h3>
            {state.figs.length === 0 ? <p className="rys-tip">Na tej stronie nie ma rysunków. Przejdź do podstrony poniżej.</p> : (
              <div className="rys-import-grid">
                {state.figs.map((f, i) => (
                  <article key={i} className="rys-import-card">
                    <b>{f.title}</b>
                    <RysThumb doc={{ h: f.res.h, k: f.res.k, items: f.res.items }} label={f.title} />
                    <span className="rys-tip">{f.res.items.length} elem.{f.res.approx ? ` · przybliżone: ${f.res.approx}` : ""}</span>
                    <div className="rys-import-acts">
                      <button type="button" className="btn" onClick={() => { onImport(f.res, "replace"); dlg.current?.close(); }}>Zastąp rysunek</button>
                      <button type="button" className="btn ghost" onClick={() => { onImport(f.res, "add"); dlg.current?.close(); }}>Dodaj</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {state.links.length > 0 && (
              <>
                <h3>Podstrony ({state.links.length})</h3>
                <ul className="rys-import-links">
                  {state.links.map(([href, label]) => <li key={href}><button type="button" onClick={() => load(href)}><code>{href}</code> {label !== href && <span>{label}</span>}</button></li>)}
                </ul>
              </>
            )}
          </>
        )}
      </div>
      {/* tu rysunek jest na chwilę wstawiany do strony: import czyta transformacje i style z układu */}
      <div ref={host} className="fig rys-import-host" aria-hidden />
    </dialog>
  );
}
