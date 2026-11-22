import ProgramPreview from "@/components/ProgramPreview";
import ProgramGrid, { type GridGroup, type GridProgram } from "./ProgramGrid";
import { PROGRAMS } from "@/content/programy";
import type { LibProgram } from "@/lib/programLibrary";
import { TOOL_LABEL } from "@/components/simulator/setup";
import { pl } from "@/lib/plural";
import PageHead from "@/components/ui/PageHead";

export const metadata = { title: "Gotowe programy CNC — frezowanie i toczenie — GCat" };

/* Profil zapisu — jak na karcie programu (/programy/[slug]). */
function profile(p: LibProgram) {
  if (p.mode === "lathe") return "Zapis: Fanuc, system A · tokarka, X w średnicy · mm, posuw na obrót (G99).";
  return `Zapis: ${p.dialect === "sinumerik" ? "SINUMERIK — język natywny" : "Fanuc (ISO)"} · frezarka · mm, posuw na minutę (G94).`;
}

const toGrid = (p: LibProgram): GridProgram => ({
  slug: p.slug, title: p.title, mode: p.mode, category: p.category, level: p.level, summary: p.summary, features: p.features,
  // numer jak w programie: frezarka T01, tokarka T0101
  tools: Object.entries(p.tools).map(([t, tool]) => ({ t: `T${p.mode === "lathe" && Number(t) >= 100 ? t.padStart(4, "0") : t.padStart(2, "0")}`, name: tool.name, kind: TOOL_LABEL[tool.kind] })),
  ops: p.ops?.length ?? 0, blocks: p.src.split("\n").filter((l) => l.trim()).length, src: p.src, profile: profile(p),
});

export default function ProgramsPage() {
  // działy: frezowanie / toczenie, w nich kategorie w kolejności z biblioteki
  const groups: GridGroup[] = (["mill", "lathe"] as const).map((mode) => {
    const items = PROGRAMS.filter((p) => p.mode === mode);
    const cats = [...new Set(items.map((p) => p.category))];
    return {
      key: mode === "mill" ? "frezowanie" : "toczenie", title: mode === "mill" ? "Frezowanie" : "Toczenie", count: items.length,
      cats: cats.map((c) => ({ c, id: `${mode}-${c.toLowerCase().replace(/[^a-z0-9ąćęłńóśźż]+/g, "-")}`, items: items.filter((p) => p.category === c).map(toGrid) })),
    };
  });
  const previews = Object.fromEntries(PROGRAMS.map((p) => [p.slug, <ProgramPreview key={p.slug} p={p} id={`pv-${p.slug}`} />]));
  return (
    <div className="grid gap-6">
      <PageHead title="Gotowe programy" count={pl(PROGRAMS.length, "detal", "detale", "detali")}
        lead="Kompletne detale z kilkoma narzędziami, kartą technologiczną i opisem zabiegów. Podejrzyj kod albo otwórz program w symulatorze i zobacz, jak powstaje detal." />
      <nav className="pg-jump-x" aria-label="Działy">
        {groups.flatMap((g) => g.cats.map((c) => <a key={c.id} href={`#${c.id}`} className="pill-f">{g.title}: {c.c} <small>{c.items.length}</small></a>))}
      </nav>
      <ProgramGrid groups={groups} previews={previews} />
    </div>
  );
}
