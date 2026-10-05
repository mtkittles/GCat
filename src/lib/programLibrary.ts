import type { Stock, Tool, ToolKind } from "@/components/simulator/setup";
import { makeTool } from "@/components/simulator/setup";

/* Biblioteka gotowych programów: symulator, galeria /programy i podglądy detali. */

export type LibTool = { kind: ToolKind; name: string } & Partial<Omit<Tool, "kind" | "name">>;

export interface LibProgram {
  slug: string;
  title: string;
  mode: "mill" | "lathe";
  /** sterownik, w którego języku zapisano program (brak = Fanuc) */
  dialect?: "fanuc" | "sinumerik";
  /** grupa w liście, np. „Kontury”, „Gwinty” */
  category: string;
  level: "podstawowy" | "średni" | "zaawansowany";
  /** jedno–dwa zdania: co to za detal i czego uczy */
  summary: string;
  /** kody i techniki pokazane w programie */
  features: string[];
  /** półfabrykat: frezarka — prostopadłościan z zerem, tokarka — pręt */
  stock?: Partial<Omit<Stock, "auto">>;
  /** tabela narzędzi przypisywana przy otwarciu programu */
  tools: Record<number, LibTool>;
  /** powiązana lekcja */
  lesson?: { href: string; label: string };
  src: string;
}

/** Narzędzia biblioteczne jako pełne wpisy tabeli symulatora. */
export function simTools(p: LibProgram): Record<number, Tool> {
  const out: Record<number, Tool> = {};
  for (const [k, t] of Object.entries(p.tools)) out[Number(k)] = { ...makeTool(t.kind), ...t };
  return out;
}

/** Narzędzia zadania (z content/exercises.json) jako tabela symulatora. */
export function exerciseTools(tools?: Record<string, { kind: string } & Record<string, unknown>>): Record<number, Tool> | undefined {
  if (!tools) return undefined;
  const out: Record<number, Tool> = {};
  for (const [k, t] of Object.entries(tools)) out[Number(k)] = { ...makeTool(t.kind as ToolKind), ...(t as Partial<Tool>) } as Tool;
  return out;
}
