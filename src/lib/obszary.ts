/*
  Obszary nauki (V3.0b, decyzja 2026-11-21): serwis dzieli się na Programowanie CNC, Technologię
  i — w przyszłości — Pomiar i jakość. Adresy stron się nie zmieniają; obszar to tylko sposób
  pokazania nawigacji (szyna + drzewo w panelu bocznym, arkusz „Więcej” na telefonie, kafle na pulpicie).
  Moduł czysty (bez Reacta) — ikony dobiera komponent po kluczu `icon`.
*/

export const OBSZARY = ["cnc", "tech", "pomiar"] as const;
export type ObszarKey = (typeof OBSZARY)[number];
export const isObszar = (v: unknown): v is ObszarKey => typeof v === "string" && (OBSZARY as readonly string[]).includes(v);

export interface ObszarDef {
  key: ObszarKey;
  /** numer na plakietce karty: 01, 02… */
  nr: string;
  title: string;
  /** etykieta klawisza na szynie panelu (krótka, mono) */
  rail: string;
  href: string | null;
  lead: string;
  soon?: boolean;
}

export const OBSZAR: Record<ObszarKey, ObszarDef> = {
  cnc: {
    key: "cnc", nr: "01", title: "Programowanie CNC", rail: "CNC", href: "/nauka",
    lead: "G‑kod od osi i układu współrzędnych do cykli i podprogramów. Fanuc i Sinumerik, frezowanie i toczenie.",
  },
  tech: {
    key: "tech", nr: "02", title: "Technologia", rail: "Tech", href: "/technologia",
    lead: "Narzędzia, płytki, wzory, proces skrawania, mocowanie, materiały i strategie obróbki.",
  },
  pomiar: {
    key: "pomiar", nr: "03", title: "Pomiar i jakość", rail: "Pomiar", href: null, soon: true,
    lead: "Tolerancje i pasowania, GD&T, chropowatość, przyrządy pomiarowe, pomiar CMM i FAI.",
  },
};

/** Adresy należące do obszaru (prefiks ścieżki). Strony wspólne (pulpit, kalkulatory, słownik…) — brak obszaru. */
const PREFIX: [string, ObszarKey][] = [
  ["/nauka", "cnc"], ["/kody", "cnc"], ["/symulator", "cnc"], ["/zadania", "cnc"], ["/programy", "cnc"],
  ["/technologia", "tech"],
  ["/pomiar", "pomiar"],
];

const under = (path: string, href: string) => path === href || path.startsWith(href + "/");

export function obszarOf(path: string): ObszarKey | null {
  return PREFIX.find(([p]) => under(path, p))?.[1] ?? null;
}

/* ---------- drzewo ---------- */

export interface TreeNode {
  /** brak adresu = pozycja zapowiedziana („wkrótce”) */
  href: string | null;
  label: string;
  /** klucz ikony (components/obszary/icons.tsx); dzieci bez ikon */
  icon?: string;
  /** liczba pod-pozycji (np. artykułów w dziale) */
  n?: number;
  /** aktywny tylko przy dokładnym adresie (np. „Przegląd” działu nad własnymi podstronami) */
  exact?: boolean;
  /** dzieci zawsze widoczne (bez przełącznika) */
  open?: boolean;
  children?: TreeNode[];
}

export interface TechData {
  dzialy: { slug: string; title: string; icon: string }[];
  arts: { dzial: string; slug: string; title: string; order: number }[];
}

/** Planowany zakres działu Pomiar i jakość (osobny plan w przyszłości) — pozycje bez adresów. */
export const POMIAR_PLAN = ["Tolerancje i pasowania", "GD&T — tolerancje geometryczne", "Chropowatość powierzchni", "Przyrządy pomiarowe", "Pomiar CMM", "FAI — kontrola pierwszej sztuki"];

export function treeOf(key: ObszarKey, tech: TechData): TreeNode[] {
  if (key === "cnc") return [
    { href: "/nauka", label: "Nauka", icon: "nauka", exact: true, open: true, children: [
      { href: "/nauka/frezowanie", label: "Frezowanie" },
      { href: "/nauka/toczenie", label: "Toczenie" },
    ] },
    { href: "/kody", label: "Kody G i M", icon: "kody" },
    { href: "/symulator", label: "Symulator 2D/3D", icon: "symulator" },
    { href: "/zadania", label: "Zadania", icon: "zadania" },
    { href: "/programy", label: "Gotowe programy", icon: "programy" },
  ];
  if (key === "tech") return [
    { href: "/technologia", label: "Przegląd", icon: "przeglad", exact: true },
    ...tech.dzialy.map((d): TreeNode => {
      const arts = tech.arts.filter((a) => a.dzial === d.slug).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, "pl"));
      return {
        href: `/technologia/${d.slug}`, label: d.title, icon: d.icon, n: arts.length,
        children: arts.length ? arts.map((a) => ({ href: `/technologia/${d.slug}/${a.slug}`, label: a.title })) : undefined,
      };
    }),
  ];
  return POMIAR_PLAN.map((label) => ({ href: null, label }));
}

export const isOn = (path: string, n: TreeNode) => !!n.href && (n.exact ? path === n.href : under(path, n.href));
/** Węzeł leży na ścieżce do bieżącej strony (on sam albo któreś dziecko). */
export const onTrail = (path: string, n: TreeNode): boolean => isOn(path, n) || !!n.children?.some((c) => onTrail(path, c));

/* ---------- bento działów Technologii ---------- */

export type Span = "hero" | "c2" | "c3" | "c6";

/**
 * Rozkład kafli na siatce 6 kolumn: pierwszy dział `big` idzie na początek jako kafel 4 × 2, dwa następne wypełniają
 * kolumnę obok, dalej rzędy po trzy; reszta 1 → pas na całą szerokość, reszta 2 → dwa po pół.
 * Bez działu `big` — od razu rzędy po trzy. Kolejność pozostałych bez zmian.
 */
export function bento<T extends { big?: boolean }>(items: T[]): { item: T; span: Span }[] {
  const h = items.findIndex((d) => d.big);
  const list = h >= 0 ? [items[h], ...items.filter((_, i) => i !== h)] : [...items];
  const out = list.map((item) => ({ item, span: "c2" as Span }));
  let start = 0;
  if (h >= 0) { out[0].span = "hero"; start = Math.min(list.length, 3); }
  const tail = (list.length - start) % 3;
  if (tail === 1) out[list.length - 1].span = "c6";
  if (tail === 2) { out[list.length - 2].span = "c3"; out[list.length - 1].span = "c3"; }
  return out;
}
