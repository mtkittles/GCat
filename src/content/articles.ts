import type { Block } from "@/lib/article";
import { part1 } from "./articles-1";
import { g02, g03 } from "./articles-arc";
import { part2 } from "./articles-2";
import { part3 } from "./articles-3";
import { part4 } from "./articles-4";

export const articles: Record<string, Block[]> = { ...part1, g02, g03, ...part2, ...part3, ...part4 };
export const hasArticle = (slug: string) => slug in articles;
