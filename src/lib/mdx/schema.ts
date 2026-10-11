import { z } from "zod";
import type { Stock, Tool, ToolKind } from "@/components/simulator/setup";
import type { Practice, Question, WorkedStep } from "@/lib/lesson";

/*
  Schematy plików w content/ (frontmatter MDX i YAML), zgodne z docs/raport-tresci.md (5.2–5.5 i decyzje).
  Krok 2: tylko walidacja — żadna strona jeszcze tych plików nie czyta.
  Slugi i kotwice są jawne i muszą być równe nazwie pliku / katalogu (sprawdza loader).
*/

// Komunikaty walidacji po polsku; brak pola nazwany wprost.
z.config(z.locales.pl());
z.config({ customError: (i) => (i.code === "invalid_type" && i.input === undefined ? "brak wymaganego pola" : undefined) });

/** Slug adresu: małe litery, cyfry i myślniki (bez polskich znaków — jak dzisiejsze adresy). */
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug: małe litery, cyfry i pojedyncze myślniki");
/** Kotwica `#…`: jak dziś w słowniku i nagłówkach — litery (także polskie), cyfry i myślniki. */
export const anchorRe = /^[\p{Ll}\p{N}-]+$/u; // dzisiejsze kotwice słownika bywają z myślnikiem na końcu („3-2-obróbka-pozycjonowana-”)
const anchor = z.string().regex(anchorRe, "kotwica: małe litery, cyfry i myślniki");
const text = z.string().min(1);
const level123 = z.union([z.literal(1), z.literal(2), z.literal(3)], { error: "poziom: 1, 2 albo 3" });

// ───────────── karta kodu: content/kody/<slug>.mdx ─────────────

const stock = z.strictObject({ x: z.number(), y: z.number(), z: z.number(), ox: z.number(), oy: z.number(), oz: z.number() });
/** Półfabrykat przykładu w formacie pola warunkowego Keystatic: { discriminant: false } albo { discriminant: true, value }. */
const stockField = z.discriminatedUnion("discriminant", [
  z.strictObject({ discriminant: z.literal(false), value: z.null().optional() }),
  z.strictObject({ discriminant: z.literal(true), value: stock }),
]);

export const kodSchema = z.strictObject({
  /** tekst wyświetlany; słowa z pola służą też do [[G01]] i auto-linków */
  code: text,
  /** = nazwa pliku; adres /kody/<slug> */
  slug,
  /** tytuł karty */
  name: text,
  /** kolejność na listach i w nawigacji (dziś kolejność w gcodes.json); wolne odstępy ułatwiają wstawianie */
  order: z.number().int().positive(),
  group: text,
  level: level123,
  modal: z.boolean(),
  machines: z.array(z.enum(["frezowanie", "toczenie"])).min(1),
  /** ★ — karta opracowana w pełnym układzie (lista /kody, tabela na stronie głównej) */
  star: z.boolean().default(false),
  /** slugi kart powiązanych */
  related: z.array(slug).default([]),
  /** puste = brak (Keystatic zapisuje pusty tekst) */
  variesBy: z.string().default(""),
  short: text,
  /** akapity rozdzielone pustą linią; auto-linki G/M jak dziś */
  desc: text,
  syntax: z.strictObject({ fanuc: text, sinumerik: text }),
  /** notka „różnice w Sinumeriku” */
  sinumerik: text,
  params: z.array(z.strictObject({ key: text, desc: text })).default([]),
  pitfalls: z.array(text).default([]),
  /** źródła jak w lekcjach: id z src/content/nauka/sources.ts, co potwierdza, miejsce; "" = do uzupełnienia */
  sources: z.array(z.strictObject({ id: text, where: text, loc: z.string().default(""), url: z.string().default("") })).default([]),
  example: z.strictObject({
    src: text,
    simulate: z.boolean().default(true),
    /** "" = automatycznie (z maszyn karty) */
    mode: z.enum(["", "mill", "lathe"]).default(""),
    /** "" = Fanuc */
    dialect: z.enum(["", "fanuc", "sinumerik"]).default(""),
    stock: stockField.default({ discriminant: false }),
  }),
});
export type Kod = z.infer<typeof kodSchema>;

// ───────────── hasło słownika: content/slownik/<kotwica>.yaml ─────────────

export const hasloSchema = z.strictObject({
  term: text,
  /** = nazwa pliku; adres /slownik#<anchor>. Zmiana `term` nie zmienia kotwicy. */
  anchor,
  /** kolejność (dziś kolejność w glossary.json) — przy kilku pasujących hasłach dymek bierze pierwsze */
  order: z.number().int().positive(),
  aliases: z.array(text).default([]),
  def: text,
  /** slugi kart kodów */
  see: z.array(slug).default([]),
  /** id rysunku z rejestru diagrams.tsx; "" = brak */
  diagram: z.string().default(""),
});
export type Haslo = z.infer<typeof hasloSchema>;

// ───────────── lekcja: content/nauka/<tor>/<slug>/index.mdx + cwiczenia.yaml ─────────────

export const lekcjaSchema = z.strictObject({
  /** F0.1 … F7.x, T0.1 … T8.x */
  id: z.string().regex(/^[FT]\d+\.\d+$/, "id lekcji: F3.2 albo T1.4"),
  /** = nazwa katalogu; adres lekcji */
  slug,
  title: text,
  minutes: z.number().int().positive(),
  goal: text,
  /** powiązane karty (slugi) — jawne, opcjonalne */
  codes: z.array(slug).default([]),
  dialect: z.literal("sinumerik").optional(),
  controllers: z.strictObject({ rows: z.array(z.tuple([z.string(), z.string(), z.string()])), note: z.string().optional() }).optional(),
  pitfalls: z.array(z.strictObject({ title: text, x: text, fig: z.string().optional(), danger: z.boolean().optional() })).default([]),
  summary: z.array(text).default([]),
  sources: z.array(z.strictObject({ id: text, where: z.string(), loc: z.string().optional(), url: z.string().optional() })).default([]),
});
export type Lekcja = z.infer<typeof lekcjaSchema>;

const review = { why: text, review: z.string().optional() };
export const questionSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("choice"), q: text, options: z.array(text).min(2), answer: z.number().int().min(0), fig: z.string().optional(), code: z.string().optional(), ...review }),
  z.strictObject({ kind: z.literal("gap"), q: text, template: text, answers: z.array(z.array(z.string()).min(1)).min(1), code: z.string().optional(), ...review }),
  z.strictObject({ kind: z.literal("bughunt"), q: text, program: text, answer: z.number().int().min(0), ...review }),
  z.strictObject({ kind: z.literal("point"), q: text, target: z.tuple([z.number(), z.number()]), ...review }),
  z.strictObject({ kind: z.literal("token"), q: text, block: text, answer: z.number().int().min(0), ...review }),
  z.strictObject({ kind: z.literal("order"), q: text, items: z.array(text).min(2), answer: z.array(z.number().int().min(0)), ...review }),
]);

const xyLabel = { x: z.number(), y: z.number(), label: text };
const taskCheck = z.discriminatedUnion("t", [
  z.strictObject({ t: z.literal("end"), x: z.number().optional(), y: z.number().optional(), z: z.number().optional(), label: text }),
  z.strictObject({ t: z.literal("approach"), x: z.number(), y: z.number(), z: z.number(), label: text }),
  z.strictObject({ t: z.literal("cut"), reference: text, tolerance: z.number().optional() }),
  z.strictObject({ t: z.literal("require"), codes: z.array(text).min(1) }),
  z.strictObject({ t: z.literal("forbid"), codes: z.array(text).min(1) }),
  z.strictObject({ t: z.literal("feed"), on: z.enum(["plunge", "xy"]), f: z.number().positive(), label: text }),
  z.strictObject({ t: z.literal("coolant"), label: text, offBeforeStop: z.boolean().optional() }),
  z.strictObject({ t: z.literal("tapFeed"), pitch: z.number().positive(), label: text }),
  z.strictObject({ t: z.literal("rapidAbove"), x0: z.number(), x1: z.number(), z: z.number(), label: text }),
]);
const reg = z.enum(["G54", "G55"]);
export const practiceSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("jog"), intro: text, goals: z.array(z.strictObject({ x: z.number(), y: z.number(), z: z.number(), label: text })).min(1) }),
  z.strictObject({
    kind: z.literal("offset"), intro: text, set: z.boolean().optional(),
    parts: z.array(z.strictObject({ reg, ...xyLabel })),
    goals: z.array(z.discriminatedUnion("kind", [
      z.strictObject({ kind: z.literal("move"), frame: z.enum(["M", "G54", "G55"]), ...xyLabel }),
      z.strictObject({ kind: z.literal("set"), reg, ...xyLabel }),
    ])),
  }),
  z.strictObject({ kind: z.literal("drill"), intro: text, questions: z.array(questionSchema).min(1) }),
  z.strictObject({ kind: z.literal("state"), intro: text, program: text }),
  z.strictObject({
    kind: z.literal("lathejog"), intro: text, setZ: z.boolean().optional(),
    goals: z.array(z.discriminatedUnion("kind", [
      z.strictObject({ kind: z.literal("move"), x: z.number(), z: z.number(), label: text }),
      z.strictObject({ kind: z.literal("setz"), label: text }),
    ])),
  }),
  z.strictObject({ kind: z.literal("css"), intro: text, vc: z.number().optional(), limit: z.number().optional() }),
  z.strictObject({
    kind: z.literal("task"), intro: text, starter: z.string(), checks: z.array(taskCheck).min(1),
    hints: z.array(text).optional(), solution: text, mode: z.enum(["mill", "lathe"]).optional(),
  }),
  z.strictObject({ kind: z.literal("points"), intro: text, tasks: z.array(z.strictObject({ target: z.tuple([z.number(), z.number()]), prompt: text, guides: z.boolean().optional() })).min(1) }),
]);

/** cwiczenia.yaml — dane strukturalne lekcji (bez MDX: `{0}` w lukach byłoby dla MDX wyrażeniem JS). */
export const cwiczeniaSchema = z.strictObject({
  worked: z.strictObject({
    title: text, intro: text, fig: z.string().optional(),
    steps: z.array(z.strictObject({ x: text, code: z.string().optional() })).min(1),
    result: text,
  }),
  practice: z.array(practiceSchema).default([]),
  quiz: z.array(questionSchema).default([]),
});
export type Cwiczenia = z.infer<typeof cwiczeniaSchema>;

// ───────────── program: content/programy/<slug>.mdx + <slug>.nc ─────────────

export const TOOL_KINDS = [
  "endmill", "ballnose", "bullnose", "chamfer", "vbit", "facemill", "tslot",
  "drill", "spotdrill", "reamer", "tap", "threadmill",
  "turning", "grooving", "boring", "threading",
] as const;

const libTool = z.strictObject({
  kind: z.enum(TOOL_KINDS), name: text,
  d: z.number().optional(), flutes: z.number().optional(), angle: z.number().optional(), corner: z.number().optional(),
  len: z.number().optional(), tiltA: z.number().optional(), tiltB: z.number().optional(),
  tip: z.number().int().min(0).max(9).optional(), shape: z.enum(["C", "D", "V", "T", "W", "S"]).optional(),
});

export const programSchema = z.strictObject({
  /** = nazwa pliku; adres /programy/<slug> */
  slug,
  title: text,
  mode: z.enum(["mill", "lathe"]),
  dialect: z.enum(["fanuc", "sinumerik"]).default("fanuc"),
  category: text,
  level: z.enum(["podstawowy", "średni", "zaawansowany"]),
  features: z.array(text).default([]),
  stock: z.strictObject({
    x: z.number().optional(), y: z.number().optional(), z: z.number().optional(),
    ox: z.number().optional(), oy: z.number().optional(), oz: z.number().optional(),
    d: z.number().optional(), len: z.number().optional(), perWcs: z.boolean().optional(),
    shape: z.enum(["box", "cylX"]).optional(), grip: z.number().optional(), tailstock: z.boolean().optional(),
  }).optional(),
  /** klucz = numer narzędzia T */
  tools: z.record(z.string().regex(/^\d+$/, "klucz narzędzia = numer T"), libTool),
  /** karta technologiczna */
  ops: z.array(z.strictObject({ t: z.number().int().positive(), op: text, how: text })).default([]),
  /** id lekcji, np. F7.1 (link liczony z planu kursu) */
  lesson: z.string().regex(/^[FT]\d+\.\d+$/).optional(),
  /** G-kod w pliku obok: ./<slug>.nc … */
  src: z.string().regex(/^\.\/[a-z0-9-]+\.nc$/, "src: ./<slug>.nc").optional(),
  /** … albo generator z kodu (cam.ts) */
  generator: z.string().optional(),
  /** stare adresy przekierowywane na ten program (dziś redirects.ts) */
  redirectsFrom: z.array(slug).default([]),
}).refine((p) => (p.src ? 1 : 0) + (p.generator ? 1 : 0) === 1, { message: "program potrzebuje dokładnie jednego: src (plik .nc) albo generator", path: ["src"] });
export type Program = z.infer<typeof programSchema>;

// ───────────── zadanie: content/zadania/<slug>.yaml ─────────────

export const zadanieSchema = z.strictObject({
  slug, title: text,
  level: level123,
  mode: z.enum(["mill", "lathe"]),
  brief: text, hints: z.array(text).default([]),
  /** lekcje do powtórki przed zadaniem (id, np. F3.2) */
  lessons: z.array(z.string().regex(/^[FT]\d+\.\d+$/, "id lekcji: F3.2 albo T1.4")).default([]),
  starter: z.string(), reference: text,
  tolerance: z.number().optional(),
  requireCodes: z.array(text).optional(), forbidCodes: z.array(text).optional(), maxCutLength: z.number().optional(),
  stock: z.strictObject({
    x: z.number().optional(), y: z.number().optional(), z: z.number().optional(),
    ox: z.number().optional(), oy: z.number().optional(), oz: z.number().optional(),
    d: z.number().optional(), len: z.number().optional(),
  }).optional(),
  tools: z.record(z.string().regex(/^\d+$/), libTool).optional(),
});
export type Zadanie = z.infer<typeof zadanieSchema>;

// ───────────── zgodność z typami, których dziś używa strona (błąd kompilacji, gdy się rozjadą) ─────────────

type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const ok = <T extends true>(t: T) => t;
ok<Same<(typeof TOOL_KINDS)[number], ToolKind>>(true);
ok<z.infer<typeof questionSchema> extends Question ? true : false>(true);
ok<z.infer<typeof practiceSchema> extends Practice ? true : false>(true);
ok<Cwiczenia["worked"]["steps"][number] extends WorkedStep ? true : false>(true);
ok<Same<keyof z.infer<typeof libTool>, keyof Tool>>(true);
ok<Same<keyof NonNullable<Program["stock"]>, keyof Omit<Stock, "auto">>>(true);
