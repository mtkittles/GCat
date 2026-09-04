import ref from "../../content/reference.json";
import lessonsData from "../../content/lessons.json";

export type RefRow = [string, string, string | null, number, number];
export type RefM = [string, string, string | null];
export const reference = ref as { g: RefRow[]; m: RefM[]; letters: [string, string][] };

export interface Lesson {
  slug: string; title: string; minutes: number; mode: "mill" | "lathe"; intro: string;
  sections: { h: string; p: string }[]; example: string; task: string;
}
export const lessons = lessonsData as Lesson[];
export const lessonBySlug = (s: string) => lessons.find((l) => l.slug === s);

import exData from "../../content/exercises.json";

export interface Exercise {
  slug: string; title: string; level: 1 | 2 | 3; mode: "mill" | "lathe";
  brief: string; hints: string[]; starter: string; reference: string;
  tolerance?: number; requireCodes?: string[]; forbidCodes?: string[]; maxCutLength?: number;
}
export const exercises = exData as Exercise[];
export const exerciseBySlug = (s: string) => exercises.find((e) => e.slug === s);

import glossaryData from "../../content/glossary.json";

export interface GlossaryEntry { term: string; aliases: string[]; def: string; see: string[] }
export const glossary = glossaryData as GlossaryEntry[];
