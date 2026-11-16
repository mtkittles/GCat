"use client";
import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { rysBySlug, rysunki } from "@/components/rys/registry";
import { freeSlug, IMG_MAX, rysPath, rysunekYaml, slugify, SLUG_RE } from "@/lib/edytor/rysunek";
import { H_DEFAULT, parseDoc, storeDoc, type RysDoc, type RysFigure } from "@/lib/rys/model";
import { svgToDoc } from "@/components/rys/importSvg";

/*
  Pliki dołączane do publikacji razem z edytowaną treścią: rysunki z rysownika (content/rysunki/*.yaml)
  i obrazy wgrane z komputera (public/rysunki/*). Do publikacji widać je w edytorze (podgląd z pamięci).
  Rysownik otwiera się nad edytorem — dla rysunku z rysownika, nowego rysunku albo rysunku z biblioteki
  strony (przerysowanego z kodu: oryginał zostaje w kodzie, wpis wskazuje nową wersję).
*/

const Editor = dynamic(() => import("@/components/rys/Editor"), { ssr: false });

export interface PendingImg { dataUrl: string; base64: string }
export interface Pending { rys: Record<string, RysFigure>; img: Record<string, PendingImg> }
export type RysReq =
  | { kind: "rys"; slug: string; onDone?: (slug: string) => void }
  | { kind: "new"; title?: string; onDone: (slug: string) => void }
  | { kind: "diagram"; id: string; svg: SVGSVGElement | null; title: string; code?: string; caption: string; onDone: (slug: string) => void };

/** Tytuł, kod i podpis rysunku ze strony (nagłówek .fig-head z chipem .fig-code, podpis .fig-cap). */
export function figText(root: Element | null | undefined): { title: string; code: string; caption: string } {
  const head = root?.querySelector(".fig-head");
  const code = head?.querySelector(".fig-code")?.textContent?.trim() ?? "";
  const all = head?.textContent?.trim() ?? "";
  return { code, title: (code && all.startsWith(code) ? all.slice(code.length) : all).trim(), caption: root?.querySelector(".fig-cap")?.textContent?.trim() ?? "" };
}

interface Ctx { pending: Pending; openRys: (r: RysReq) => void; addImage: (f: File) => Promise<{ src: string } | { error: string }>; figure: (slug: string) => RysFigure | undefined }
const PendingCtx = createContext<Ctx | null>(null);
export const usePendingCtx = () => useContext(PendingCtx);

const b64 = (bytes: Uint8Array) => { let s = ""; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(s); };

export function usePending() {
  const [pending, setPending] = useState<Pending>({ rys: {}, img: {} });
  const [req, setReq] = useState<RysReq | null>(null);
  const figure = useCallback((slug: string) => pending.rys[slug] ?? rysBySlug(slug), [pending.rys]);
  const taken = useMemo(() => new Set([...rysunki.map((r) => r.slug), ...Object.keys(pending.rys)]), [pending.rys]);

  const addImage = useCallback(async (f: File): Promise<{ src: string } | { error: string }> => {
    const ext = (f.name.split(".").pop() ?? "").toLowerCase();
    if (!["png", "jpg", "jpeg", "webp", "svg"].includes(ext)) return { error: "Obsługiwane pliki: PNG, JPG, WebP, SVG." };
    if (f.size > IMG_MAX) return { error: `Plik ma ${(f.size / 1e6).toFixed(1)} MB — najwyżej 2 MB.` };
    const bytes = new Uint8Array(await f.arrayBuffer());
    const { checkImage } = await import("@/lib/edytor/rysunek");
    const bad = checkImage(ext, bytes);
    if (bad) return { error: `Nie można użyć pliku: ${bad}.` };
    const name = `${slugify(f.name.replace(/\.[^.]+$/, ""), "obraz")}.${ext === "jpeg" ? "jpg" : ext}`;
    const src = `/rysunki/${name}`;
    const mime = ext === "svg" ? "image/svg+xml" : ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
    const base64 = b64(bytes);
    setPending((p) => ({ ...p, img: { ...p.img, [src]: { base64, dataUrl: `data:${mime};base64,${base64}` } } }));
    return { src };
  }, []);

  /** Pliki do publikacji (oprócz edytowanej treści). */
  const files = useMemo(() => [
    ...Object.values(pending.rys).map((f) => ({ path: rysPath(f.slug), text: rysunekYaml(f, { h: f.h, k: f.k, items: parseDoc(f).items }) })),
    ...Object.entries(pending.img).map(([src, i]) => ({ path: `public${src}`, base64: i.base64 })),
  ], [pending]);
  const labels = useMemo(() => [...Object.values(pending.rys).map((f) => `rysunek „${f.title}”`), ...Object.keys(pending.img).map((s) => `obraz ${s.split("/").pop()}`)], [pending]);

  const clear = useCallback(() => setPending({ rys: {}, img: {} }), []);
  const ctx: Ctx = useMemo(() => ({ pending, openRys: setReq, addImage, figure }), [pending, addImage, figure]);

  const overlay = req && (
    <RysOverlay req={req} figure={figure} taken={taken}
      onCancel={() => setReq(null)}
      onDone={(fig) => { setPending((p) => ({ ...p, rys: { ...p.rys, [fig.slug]: fig } })); const r = req; setReq(null); r.onDone?.(fig.slug); }} />
  );
  const Provider = PendingCtx.Provider;
  const rysList = useMemo(() => Object.values(pending.rys), [pending.rys]);
  return { pending, files, labels, clear, ctx, overlay, Provider, openRys: setReq, figure, rysList };
}

function startOf(req: RysReq, figure: (s: string) => RysFigure | undefined, taken: Set<string>): { fig: Omit<RysFigure, "h" | "k" | "items">; doc: RysDoc; fixed: boolean; note?: string } {
  if (req.kind === "rys") {
    const f = figure(req.slug);
    if (f) return { fig: f, doc: parseDoc(f), fixed: true };
    return { fig: { slug: req.slug, title: "Nowy rysunek", code: "", caption: "", legend: [] }, doc: { h: H_DEFAULT, k: 1, items: [] }, fixed: true };
  }
  if (req.kind === "new") {
    const title = req.title ?? "Nowy rysunek";
    return { fig: { slug: freeSlug(slugify(title), taken), title, code: "", caption: "", legend: [] }, doc: { h: H_DEFAULT, k: 1, items: [] }, fixed: false };
  }
  let doc: RysDoc = { h: H_DEFAULT, k: 1, items: [] }, note = "";
  if (req.svg) {
    try { const r = svgToDoc(req.svg); doc = { h: r.h, k: r.k, items: r.items }; if (r.approx) note = `${r.approx} elementów przeniesiono w przybliżeniu (np. krzywe jako polilinie) — sprawdź je.`; }
    catch { note = "Nie udało się wczytać rysunku — zaczynasz od pustej kartki."; }
  }
  const base = SLUG_RE.test(req.id) ? req.id : slugify(req.id);
  return { fig: { slug: freeSlug(base, taken), title: req.title || req.id, code: req.code ?? "", caption: req.caption, legend: [] }, doc, fixed: false, note };
}

function RysOverlay({ req, figure, taken, onDone, onCancel }: { req: RysReq; figure: (s: string) => RysFigure | undefined; taken: Set<string>; onDone: (f: RysFigure) => void; onCancel: () => void }) {
  const [start] = useState(() => startOf(req, figure, taken));
  const [doc, setDoc] = useState<RysDoc>(start.doc);
  const [title, setTitle] = useState(start.fig.title);
  const [caption, setCaption] = useState(start.fig.caption);
  const [slug, setSlug] = useState(start.fig.slug);
  const clash = !start.fixed && taken.has(slug);
  const badSlug = !SLUG_RE.test(slug);
  const done = () => onDone({ ...start.fig, slug, title: title.trim() || "Rysunek", caption, ...storeDoc(doc) });
  return (
    <div className="rys-shell ed-rys-shell" role="dialog" aria-label="Rysownik">
      <header className="rys-top ed-rys-top">
        <h1>Rysownik</h1>
        <label className="ed-rys-f">Tytuł<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="ed-rys-f is-wide">Podpis<input value={caption} placeholder="Jedno zdanie pod rysunkiem (opcjonalnie)" onChange={(e) => setCaption(e.target.value)} /></label>
        <label className="ed-rys-f">Plik<input className="is-mono" value={slug} disabled={start.fixed} onChange={(e) => setSlug(e.target.value.toLowerCase())} title="content/rysunki/<nazwa>.yaml" /></label>
        {(clash || badSlug) && <span className="ed-rys-err">{badSlug ? "nazwa: małe litery, cyfry, myślniki" : "taka nazwa już jest"}</span>}
        {start.note && <span className="rys-tip">{start.note}</span>}
        <div className="rys-top-actions">
          <button type="button" className="btn ghost" onClick={onCancel}>Anuluj</button>
          <button type="button" className="btn" disabled={clash || badSlug} onClick={done}>Gotowe</button>
        </div>
      </header>
      <Editor initial={start.doc} onChange={setDoc} kalkaKey={`rys:${slug || "nowy"}`} />
    </div>
  );
}
