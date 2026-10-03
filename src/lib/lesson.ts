import type { Block } from "@/lib/article";

/*
  Stały szablon lekcji. Każda lekcja ma te same sekcje w tej samej kolejności:
  cel → teoria → przykład rozwiązany → spróbuj sam → typowe błędy → Fanuc/Sinumerik
  → sprawdź się → program detalu → podsumowanie → źródła.
  Tekst obsługuje **pogrubienie**, `kod` i [[pojęcie]] / [[klucz|tekst]] (dymek).
*/

export type Question =
  /** Wybór jednej odpowiedzi. `code` — fragment programu pokazany nad pytaniem (np. „gdzie skończy narzędzie?”). */
  | { kind: "choice"; q: string; options: string[]; answer: number; why: string; fig?: string; review?: string; code?: string }
  /** Uzupełnij luki. W `template` luki to {0}, {1}…; `answers[i]` to akceptowane wartości luki i. */
  | { kind: "gap"; q: string; template: string; answers: string[][]; why: string; review?: string; code?: string }
  /** Znajdź błędny blok: `program` wielowierszowy, `answer` = indeks linii (od 0). */
  | { kind: "bughunt"; q: string; program: string; answer: number; why: string; review?: string }
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

export type TaskCheck =
  | { t: "end"; x?: number; y?: number; z?: number; label: string }
  /** Najazd: ruch szybki nad punkt (x, y) na wyższym Z, potem osobny ruch szybki w dół do z. */
  | { t: "approach"; x: number; y: number; z: number; label: string }
  /** Tor roboczy zgodny z wzorcem (bez ruchów szybkich). */
  | { t: "cut"; reference: string; tolerance?: number }
  | { t: "require"; codes: string[] }
  | { t: "forbid"; codes: string[] };

export type LatheGoal =
  | { kind: "move"; x: number; z: number; label: string }
  | { kind: "setz"; label: string };

export type Practice =
  | { kind: "jog"; intro: string; goals: JogGoal[] }
  | { kind: "offset"; intro: string; parts: OffsetPart[]; goals: OffsetGoal[]; set?: boolean }
  /** Seria krótkich zadań w formacie testu, bez punktacji końcowej. */
  | { kind: "drill"; intro: string; questions: Question[] }
  /** Program z podglądem stanu modalnego w wybranej linii. */
  | { kind: "state"; intro: string; program: string }
  /** Dopisz do programu — edytor z symulatorem i sprawdzaniem. */
  /** Tokarka: ręczny przesuw X/Z z odczytem średnicy, opcjonalnie pomiar Z0. */
  | { kind: "lathejog"; intro: string; goals: LatheGoal[]; setZ?: boolean }
  /** G96: wykres obrotów w funkcji średnicy z limitem G50. */
  | { kind: "css"; intro: string; vc?: number; limit?: number }
  | { kind: "task"; intro: string; starter: string; checks: TaskCheck[]; hints?: string[]; solution: string; mode?: "mill" | "lathe" }
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
