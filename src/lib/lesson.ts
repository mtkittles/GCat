import type { Block } from "@/lib/article";

/*
  Stały szablon lekcji. Każda lekcja ma te same sekcje w tej samej kolejności:
  cel → teoria → przykład rozwiązany → spróbuj sam → typowe błędy → Fanuc/Sinumerik
  → sprawdź się → program detalu → podsumowanie → źródła.
  Tekst obsługuje **pogrubienie**, `kod` i [[pojęcie]] / [[klucz|tekst]] (dymek).
*/

export type Question =
  /** Wybór jednej odpowiedzi. */
  | { kind: "choice"; q: string; options: string[]; answer: number; why: string; fig?: string; review?: string }
  /** Uzupełnij luki. W `template` luki to {0}, {1}…; `answers[i]` to akceptowane wartości luki i. */
  | { kind: "gap"; q: string; template: string; answers: string[][]; why: string; review?: string }
  /** Zaznacz punkt na siatce (widok z góry, X w prawo, Y w górę). */
  | { kind: "point"; q: string; target: [number, number]; why: string; review?: string }
  /** Tapnij właściwe słowo w bloku. `block` dzielony po spacjach, `answer` = indeks słowa. */
  | { kind: "token"; q: string; block: string; answer: number; why: string; review?: string }
  /** Ułóż elementy w kolejności. `items` w kolejności wyświetlania, `answer` = indeksy items w poprawnej kolejności. */
  | { kind: "order"; q: string; items: string[]; answer: number[]; why: string; review?: string };

export interface JogGoal { x: number; y: number; z: number; label: string }
export interface PointTask { target: [number, number]; prompt: string; guides?: boolean }

export interface OffsetPart { reg: "G54" | "G55"; x: number; y: number; label: string }
export type OffsetGoal =
  | { kind: "move"; frame: "M" | "G54" | "G55"; x: number; y: number; label: string }
  | { kind: "set"; reg: "G54" | "G55"; x: number; y: number; label: string };

export type Practice =
  | { kind: "jog"; intro: string; goals: JogGoal[] }
  | { kind: "offset"; intro: string; parts: OffsetPart[]; goals: OffsetGoal[]; set?: boolean }
  /** Seria krótkich zadań w formacie testu, bez punktacji końcowej. */
  | { kind: "drill"; intro: string; questions: Question[] }
  /** Program z podglądem stanu modalnego w wybranej linii. */
  | { kind: "state"; intro: string; program: string }
  | { kind: "points"; intro: string; tasks: PointTask[] };

export interface WorkedStep { x: string; code?: string }

export interface LessonDoc {
  id: string; slug: string; title: string; minutes: number;
  /** Jedno zdanie: co uczeń umie po lekcji. */
  goal: string;
  theory: Block[];
  worked: { title: string; intro: string; fig?: string; steps: WorkedStep[]; result: string };
  practice: Practice[];
  pitfalls: { title: string; x: string; fig?: string }[];
  controllers?: { rows: [string, string, string][]; note?: string };
  quiz: Question[];
  summary: string[];
  sources: { id: string; where: string }[];
}
