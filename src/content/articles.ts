import type { Block } from "@/lib/article";
import { part1 } from "./articles-1";
import { g02, g03 } from "./articles-arc";
import { part2 } from "./articles-2";
import { part3 } from "./articles-3";
import { part4 } from "./articles-4";
import { g00 } from "./articles-g00";
import { g01 } from "./articles-g01";

// Karty opracowane indywidualnie nadpisują wersje zbiorcze.
export const articles: Record<string, Block[]> = { ...part1, g02, g03, ...part2, ...part3, ...part4, g00, g01 };
export const hasArticle = (slug: string) => slug in articles;

/** Karty opracowane w pełnym układzie referencyjnym — oznaczane w spisie. */
export const CURATED = new Set(["g00", "g01"]);
