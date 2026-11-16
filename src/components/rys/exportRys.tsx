"use client";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { FigDefs, figCtx } from "@/components/fig";
import { layersOf, RYS_W, storeItem, visibleItems, type RysDoc } from "@/lib/rys/model";
import { renderItem } from "./render";

/*
  Eksport rysunku do pliku (paczka RB2): SVG, PNG i PDF.
  Rysunek renderuje się poza ekranem tym samym kodem co na stronie, w wybranym motywie (jasny do druku albo ciemny jak strona),
  potem obliczone style trafiają do atrybutów, a czcionki serwisu do pliku (@font-face z danymi) — plik wygląda tak samo poza serwisem.
  SVG zachowuje zapis elementów (data-ri), więc „Otwórz plik” wczytuje go z powrotem dokładnie.
  PNG i PDF powstają z tego SVG: obraz w dużej rozdzielczości; PDF to strona A4 z obrazem bez strat (Flate).
*/

export type Theme = "light" | "dark";
export interface ExportOpts { theme: Theme; bg: boolean }

const PROPS = [
  "fill", "fill-opacity", "fill-rule", "stroke", "stroke-width", "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin",
  "stroke-opacity", "stroke-miterlimit", "opacity", "font-family", "font-size", "font-weight", "font-style", "letter-spacing", "text-anchor",
  "dominant-baseline", "paint-order", "visibility",
] as const;

function eachRule(rules: CSSRuleList, fn: (r: CSSRule) => void) {
  for (const r of Array.from(rules)) { fn(r); if ("cssRules" in r && (r as CSSGroupingRule).cssRules) eachRule((r as CSSGroupingRule).cssRules, fn); }
}
function sheets(fn: (r: CSSRule) => void) {
  for (const sh of Array.from(document.styleSheets)) { let rules: CSSRuleList; try { rules = sh.cssRules; } catch { continue; } eachRule(rules, fn); }
}

/** Zmienne CSS motywu z arkuszy strony: :root = jasny, [data-theme="dark"] = ciemny (na wierzchu jasnego). */
function themeVars(theme: Theme): Record<string, string> {
  const out: Record<string, string> = {};
  const take = (match: (sel: string) => boolean) => sheets((r) => {
    if (!(r instanceof CSSStyleRule) || !r.selectorText.split(",").map((s) => s.trim()).some(match)) return;
    for (let i = 0; i < r.style.length; i++) { const n = r.style[i]; if (n.startsWith("--")) out[n] = r.style.getPropertyValue(n).trim(); }
  });
  take((s) => s === ":root" || s === "html");
  if (theme === "dark") take((s) => /^(?:html|:root)?\[data-theme="?dark"?\]$/.test(s));
  return out;
}

/** Rysunek wyrenderowany poza ekranem w motywie `theme`; `done()` sprząta. */
function renderOff(doc: RysDoc, theme: Theme): { svg: SVGSVGElement; host: HTMLDivElement; done: () => void } {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;left:-20000px;top:0;width:1200px;pointer-events:none";
  const vars = themeVars(theme);
  // rysunki serwisu to ciemne „wyspy” (tło --panel); wersja do druku ma białe tło, więc obwódka tekstu i „otwór” też są białe
  if (theme === "light") vars["--panel"] = vars["--card"] || "#ffffff";
  for (const [k, v] of Object.entries(vars)) host.style.setProperty(k, v);
  document.body.appendChild(host);
  const root = createRoot(host);
  const id = "rysx", c = figCtx(id);
  flushSync(() => root.render(
    <div className="fig" style={{ padding: 0, border: 0, background: "none" }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${RYS_W} ${doc.h}`} width={RYS_W * 2} height={doc.h * 2} data-rk={doc.k}>
        <FigDefs id={id} />
        {visibleItems(doc).map((it) => <g key={it.id} data-ri={JSON.stringify(storeItem(it))}>{renderItem(it, c, doc.k)}</g>)}
      </svg>
    </div>,
  ));
  const svg = host.querySelector("svg")!;
  // zmienne także na samym <svg>: w jasnym motywie strony reguła „.fig svg” nadaje rysunkom ciemne kolory
  for (const [k, v] of Object.entries(vars)) svg.style.setProperty(k, v);
  return { svg, host, done: () => { root.unmount(); host.remove(); } };
}

const toDataUrl = (b: Blob) => new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => rej(r.error); r.readAsDataURL(b); });

/** @font-face rodzin użytych w rysunku, z plikami czcionek wpisanymi jako dane (bez nich PNG/PDF dostałyby czcionkę zastępczą). */
async function fontCss(families: Set<string>): Promise<string> {
  const faces: CSSFontFaceRule[] = [];
  sheets((r) => { if (r instanceof CSSFontFaceRule && families.has(r.style.getPropertyValue("font-family").replace(/["']/g, "").trim())) faces.push(r); });
  const out: string[] = [];
  for (const f of faces) {
    const src = f.style.getPropertyValue("src"), m = src.match(/url\(["']?([^"')]+)["']?\)/);
    if (!m) continue;
    try {
      const url = new URL(m[1], f.parentStyleSheet?.href ?? location.href).href;
      const data = await toDataUrl(await (await fetch(url)).blob());
      const st = f.style;
      out.push(`@font-face{font-family:"${st.getPropertyValue("font-family").replace(/["']/g, "").trim()}";src:url(${data});font-weight:${st.getPropertyValue("font-weight") || "normal"};font-style:${st.getPropertyValue("font-style") || "normal"};${st.getPropertyValue("unicode-range") ? `unicode-range:${st.getPropertyValue("unicode-range")};` : ""}}`);
    } catch { /* czcionka niedostępna: zostanie zastępcza */ }
  }
  return out.join("\n");
}

/** Samodzielny plik SVG (style w atrybutach, czcionki w pliku, opcjonalnie tło motywu). */
export async function exportSvg(doc: RysDoc, o: ExportOpts): Promise<string> {
  const { svg, done } = renderOff(doc, o.theme);
  try {
    await document.fonts.ready;
    const families = new Set<string>();
    const src = [svg, ...Array.from(svg.querySelectorAll("*"))];
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const dst = [clone, ...Array.from(clone.querySelectorAll("*"))];
    src.forEach((el, i) => {
      const cs = getComputedStyle(el), d = dst[i];
      const style: string[] = [];
      for (const p of PROPS) { const v = cs.getPropertyValue(p); if (v && v !== "normal" && v !== "auto") style.push(`${p}:${v}`); }
      if (el.tagName.toLowerCase() === "text") cs.fontFamily.split(",").forEach((f) => families.add(f.replace(/["']/g, "").trim()));
      if (el !== svg) d.setAttribute("style", style.join(";")); else d.removeAttribute("style");
      d.removeAttribute("class");
    });
    if (layersOf(doc).length > 1) clone.setAttribute("data-rl", JSON.stringify(layersOf(doc)));
    const ns = "http://www.w3.org/2000/svg";
    const defs = clone.querySelector("defs") ?? clone.insertBefore(document.createElementNS(ns, "defs"), clone.firstChild);
    const css = await fontCss(families);
    if (css) { const st = document.createElementNS(ns, "style"); st.textContent = css; defs.appendChild(st); }
    if (o.bg) {
      const r = document.createElementNS(ns, "rect");
      r.setAttribute("width", "100%"); r.setAttribute("height", "100%");
      r.setAttribute("fill", getComputedStyle(svg).getPropertyValue("--panel").trim() || (o.theme === "dark" ? "#141518" : "#ffffff"));
      clone.insertBefore(r, defs.nextSibling);
    }
    return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}`;
  } finally { done(); }
}

/** SVG → płótno w skali `scale` (piksele na jednostkę rysunku). */
async function toCanvas(svgText: string, doc: RysDoc, scale: number): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(new Blob([svgText], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.decoding = "sync";
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error("Nie udało się narysować rysunku")); img.src = url; });
    const cv = document.createElement("canvas");
    cv.width = Math.round(RYS_W * scale); cv.height = Math.round(doc.h * scale);
    cv.getContext("2d")!.drawImage(img, 0, 0, cv.width, cv.height);
    return cv;
  } finally { URL.revokeObjectURL(url); }
}

export async function exportPng(doc: RysDoc, o: ExportOpts, scale = 6): Promise<Blob> {
  const cv = await toCanvas(await exportSvg(doc, o), doc, scale);
  return new Promise((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error("Nie udało się zapisać PNG"))), "image/png"));
}

async function deflate(data: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream("deflate"); // format zlib = FlateDecode w PDF
  const out = new Response(new Blob([data as BlobPart]).stream().pipeThrough(cs));
  return new Uint8Array(await out.arrayBuffer());
}

/** PDF: strona A4 (pionowa albo pozioma — ta, na której rysunek jest większy), obraz bez strat, marginesy 10 mm. */
export async function exportPdf(doc: RysDoc, o: ExportOpts, scale = 8): Promise<Blob> {
  const cv = await toCanvas(await exportSvg(doc, { ...o, bg: true }), doc, scale);
  const px = cv.getContext("2d")!.getImageData(0, 0, cv.width, cv.height).data;
  const rgb = new Uint8Array(cv.width * cv.height * 3);
  for (let i = 0, j = 0; i < px.length; i += 4, j += 3) { rgb[j] = px[i]; rgb[j + 1] = px[i + 1]; rgb[j + 2] = px[i + 2]; }
  const img = await deflate(rgb);
  const A4: [number, number] = [595.28, 841.89], M = 28.35, ar = RYS_W / doc.h;
  const fitIn = ([w, h]: [number, number]) => Math.min((w - 2 * M) / ar, h - 2 * M) * ar; // szerokość obrazu
  const [pw, ph] = fitIn([A4[1], A4[0]]) > fitIn(A4) ? [A4[1], A4[0]] : A4;
  const dw = fitIn([pw, ph]), dh = dw / ar, x = (pw - dw) / 2, y = (ph - dh) / 2;
  const enc = new TextEncoder(), parts: Uint8Array[] = [], offs: number[] = [];
  let len = 0;
  const put = (p: string | Uint8Array) => { const b = typeof p === "string" ? enc.encode(p) : p; parts.push(b); len += b.length; };
  const obj = (n: number, body: string, stream?: Uint8Array) => {
    offs[n] = len;
    if (stream) { put(`${n} 0 obj\n<<${body}/Length ${stream.length}>>\nstream\n`); put(stream); put("\nendstream\nendobj\n"); }
    else put(`${n} 0 obj\n${body}\nendobj\n`);
  };
  const f = (v: number) => v.toFixed(2);
  const content = enc.encode(`q ${f(dw)} 0 0 ${f(dh)} ${f(x)} ${f(y)} cm /Im0 Do Q\n`);
  put("%PDF-1.4\n%âãÏÓ\n");
  obj(1, "<</Type/Catalog/Pages 2 0 R>>");
  obj(2, "<</Type/Pages/Kids[3 0 R]/Count 1>>");
  obj(3, `<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${f(pw)} ${f(ph)}]/Resources<</XObject<</Im0 4 0 R>>>>/Contents 5 0 R>>`);
  obj(4, `/Type/XObject/Subtype/Image/Width ${cv.width}/Height ${cv.height}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/FlateDecode`, img);
  obj(5, "", content);
  const xref = len;
  put(`xref\n0 6\n0000000000 65535 f \n${offs.slice(1).map((o2) => `${String(o2).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<</Size 6/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(parts as BlobPart[], { type: "application/pdf" });
}

export function download(data: Blob | string, name: string, type = "application/octet-stream") {
  const blob = typeof data === "string" ? new Blob([data], { type }) : data;
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
