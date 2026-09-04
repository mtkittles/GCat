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
