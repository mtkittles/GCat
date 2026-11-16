import { Document } from "yaml";
import { storeDoc, type RysDoc, type RysFigure } from "@/lib/rys/model";

/* Rysunek z rysownika jako plik content/rysunki/<slug>.yaml i obrazy wgrywane do public/rysunki/. */

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const rysPath = (slug: string) => `content/rysunki/${slug}.yaml`;

/** Nazwa pliku z dowolnego tekstu: małe litery bez polskich znaków, cyfry, myślniki. */
export function slugify(t: string, fallback = "rysunek"): string {
  const s = t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48).replace(/-+$/, "");
  return s || fallback;
}

/** Wolna nazwa: `base`, potem `base-2`, `base-3`… */
export function freeSlug(base: string, taken: Set<string>): string {
  let s = base, i = 2;
  while (taken.has(s)) s = `${base}-${i++}`;
  return s;
}

/** Zapis rysunku w formacie, który czyta loader (pole `rys` = storeDoc z rysownika). */
export function rysunekYaml(f: Pick<RysFigure, "title" | "code" | "caption" | "legend">, doc: RysDoc): string {
  return new Document({ title: f.title, code: f.code, caption: f.caption, legend: f.legend, rys: storeDoc(doc) }).toString({ lineWidth: 0 });
}

/* ───────────── obrazy ───────────── */

export const IMG_MAX = 2_000_000;
export const IMG_EXT = ["png", "jpg", "jpeg", "webp", "svg"] as const;
export const IMG_RE = /^public\/rysunki\/[a-z0-9]+(?:-[a-z0-9]+)*\.(png|jpe?g|webp|svg)$/;

/** Czy zawartość pliku zgadza się z rozszerzeniem (sygnatura pliku), a SVG nie zawiera skryptów. */
export function checkImage(ext: string, bytes: Uint8Array): string | null {
  const eq = (sig: number[], off = 0) => sig.every((b, i) => bytes[off + i] === b);
  if (bytes.length > IMG_MAX) return `plik ma ${(bytes.length / 1e6).toFixed(1)} MB — najwyżej 2 MB`;
  if (ext === "png" && !eq([0x89, 0x50, 0x4e, 0x47])) return "to nie jest plik PNG";
  if ((ext === "jpg" || ext === "jpeg") && !eq([0xff, 0xd8, 0xff])) return "to nie jest plik JPG";
  if (ext === "webp" && !(eq([0x52, 0x49, 0x46, 0x46]) && eq([0x57, 0x45, 0x42, 0x50], 8))) return "to nie jest plik WebP";
  if (ext === "svg") {
    const t = new TextDecoder().decode(bytes);
    if (!/<svg[\s>]/i.test(t)) return "to nie jest plik SVG";
    if (/<script|on[a-z]+\s*=|javascript:|<foreignObject/i.test(t)) return "SVG zawiera skrypt albo zdarzenia — niedozwolone";
  }
  return null;
}
