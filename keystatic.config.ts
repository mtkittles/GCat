import { collection, config, fields } from "@keystatic/core";
import { block, wrapper } from "@keystatic/core/content-components";
import diagramy from "./content/.generated/diagramy.json";
import { sources as zrodla } from "./src/content/nauka/sources";

/*
  Keystatic — edycja kart kodów i słownika (krok 7). Lekcje, programy i zadania później.
  • lokalnie (next dev): zapis prosto na dysk (storage local),
  • produkcja (Vercel): GitHub App, każdy zapis na gałęzi „tresci/…” → PR (storage github).
  Pliki mają ten sam format, który czyta strona (content/kody/*.mdx, content/slownik/*.yaml);
  schemat pól = src/lib/mdx/schema.ts. Format zapisu Keystatic sprawdza tests/keystatic.test.ts (round-trip).
*/

// NODE_ENV jest wstawiany przy buildzie po obu stronach (panel w przeglądarce i API) — ten sam tryb wszędzie
const isLocal = process.env.NODE_ENV === "development";

const mode = fields.select({ label: "Maszyna", options: [{ label: "frezarka", value: "mill" }, { label: "tokarka", value: "lathe" }], defaultValue: "mill" });

/** Komponenty w treści MDX karty — te same co w src/lib/mdx/components.tsx. */
export const komponenty = {
  Diagram: block({
    label: "Rysunek (z rejestru)",
    schema: { id: fields.select({ label: "Rysunek", options: diagramy.map((d: string) => ({ label: d, value: d })), defaultValue: diagramy[0] }) },
  }),
  Obraz: block({
    label: "Obraz (plik → public/rysunki/<karta>/)",
    schema: {
      src: fields.image({ label: "Plik", directory: "public/rysunki", publicPath: "/rysunki/" }),
      alt: fields.text({ label: "Opis (alt)" }),
      caption: fields.text({ label: "Podpis" }),
    },
  }),
  Note: wrapper({
    label: "Ramka (uwaga)",
    schema: { kind: fields.select({ label: "Rodzaj", options: [{ label: "wskazówka", value: "tip" }, { label: "ostrzeżenie", value: "warn" }, { label: "informacja", value: "info" }], defaultValue: "info" }) },
  }),
  Code: wrapper({ label: "Program do przeczytania", schema: { caption: fields.text({ label: "Podpis" }) } }),
  Sim: wrapper({ label: "Symulator (edytowalny)", schema: { mode, caption: fields.text({ label: "Podpis" }) } }),
  Demo: wrapper({ label: "Animacja programu", schema: { mode, title: fields.text({ label: "Tytuł" }), caption: fields.text({ label: "Podpis" }) } }),
  Widget: block({
    label: "Kalkulator / widżet",
    schema: { id: fields.select({ label: "Widżet", options: [{ label: "zamiana R ↔ I, J", value: "rij" }, { label: "łuk", value: "arc" }, { label: "ręczny przesuw (jog)", value: "jog" }], defaultValue: "rij" }) },
  }),
  Table: wrapper({ label: "Tabela z podpisem", schema: { caption: fields.text({ label: "Podpis" }) } }),
};

export default config({
  storage: isLocal
    ? { kind: "local" }
    : { kind: "github", repo: { owner: "mtkittles", name: "GCat" }, branchPrefix: "tresci/" },
  ui: { brand: { name: "GCat — treści" } },
  collections: {
    kody: collection({
      label: "Karty kodów",
      path: "content/kody/*",
      slugField: "slug",
      format: { contentField: "body" },
      entryLayout: "content",
      // „Podgląd”: strona karty na podglądzie Vercela bieżącej gałęzi (src/app/api/podglad/route.ts)
      previewUrl: "/api/podglad?branch={branch}&to=/kody/{slug}",
      columns: ["code", "name"],
      schema: {
        code: fields.text({ label: "Kod (wyświetlany)", validation: { isRequired: true } }),
        slug: fields.slug({ name: { label: "Slug (adres /kody/…) — nie zmieniać" }, slug: { label: "Nazwa pliku (= slug, bez .mdx)" } }),
        name: fields.text({ label: "Tytuł", validation: { isRequired: true } }),
        order: fields.integer({ label: "Kolejność", validation: { isRequired: true, min: 1 } }),
        group: fields.text({ label: "Grupa", validation: { isRequired: true } }),
        level: fields.integer({ label: "Poziom (1 podstawy, 2 średni, 3 zaawansowany)", validation: { isRequired: true, min: 1, max: 3 } }),
        modal: fields.checkbox({ label: "Modalny" }),
        machines: fields.multiselect({ label: "Maszyny", options: [{ label: "frezowanie", value: "frezowanie" }, { label: "toczenie", value: "toczenie" }] }),
        star: fields.checkbox({ label: "★ karta opracowana w pełnym układzie" }),
        related: fields.array(fields.relationship({ label: "Karta", collection: "kody" }), { label: "Powiązane karty", itemLabel: (p) => p.value ?? "" }),
        variesBy: fields.text({ label: "Zależy od (np. system kodów) — puste = brak" }),
        short: fields.text({ label: "Jedno zdanie", multiline: true, validation: { isRequired: true } }),
        desc: fields.text({ label: "Opis (akapity rozdzielone pustą linią)", multiline: true, validation: { isRequired: true } }),
        syntax: fields.object({
          fanuc: fields.text({ label: "Fanuc", multiline: true }),
          sinumerik: fields.text({ label: "Sinumerik", multiline: true }),
        }, { label: "Składnia" }),
        sinumerik: fields.text({ label: "Różnice w Sinumeriku", multiline: true }),
        params: fields.array(fields.object({ key: fields.text({ label: "Adres" }), desc: fields.text({ label: "Znaczenie", multiline: true }) }), { label: "Adresy", itemLabel: (p) => p.fields.key.value }),
        pitfalls: fields.array(fields.text({ label: "Uwaga", multiline: true }), { label: "Na co uważać", itemLabel: (p) => p.value.slice(0, 60) }),
        sources: fields.array(fields.object({
          id: fields.select({ label: "Dokument", options: Object.values(zrodla).map((z) => ({ label: z.short, value: z.id })), defaultValue: "fanuc" }),
          where: fields.text({ label: "Co potwierdza", multiline: true }),
          loc: fields.text({ label: "Miejsce: rozdział i strona (puste = do uzupełnienia)" }),
          url: fields.text({ label: "Link do konkretnej strony (puste = link dokumentu)" }),
        }), { label: "Źródła — tylko sprawdzone miejsca", itemLabel: (p) => `${p.fields.id.value}: ${p.fields.where.value.slice(0, 50)}` }),
        example: fields.object({
          src: fields.text({ label: "Program", multiline: true }),
          simulate: fields.checkbox({ label: "Symulować", defaultValue: true }),
          mode: fields.select({ label: "Tryb", options: [{ label: "auto", value: "" }, { label: "frezarka", value: "mill" }, { label: "tokarka", value: "lathe" }], defaultValue: "" }),
          dialect: fields.select({ label: "Sterowanie", options: [{ label: "Fanuc", value: "" }, { label: "Sinumerik", value: "sinumerik" }], defaultValue: "" }),
          stock: fields.conditional(fields.checkbox({ label: "Własny półfabrykat (prostopadłościan z zerem)" }), {
            true: fields.object({
              x: fields.number({ label: "X" }), y: fields.number({ label: "Y" }), z: fields.number({ label: "Z" }),
              ox: fields.number({ label: "zero X" }), oy: fields.number({ label: "zero Y" }), oz: fields.number({ label: "zero Z" }),
            }),
            false: fields.empty(),
          }),
        }, { label: "Przykład (symulacja)" }),
        body: fields.mdx({
          label: "Artykuł",
          extension: "mdx",
          options: { heading: [2, 3], image: false },
          components: komponenty,
        }),
      },
    }),
    slownik: collection({
      label: "Słownik",
      path: "content/slownik/*",
      slugField: "anchor",
      format: { data: "yaml" },
      columns: ["term"],
      previewUrl: "/api/podglad?branch={branch}&to=/slownik%23{slug}",
      schema: {
        term: fields.text({ label: "Hasło", validation: { isRequired: true } }),
        anchor: fields.slug({ name: { label: "Kotwica /slownik#… — nie zmieniać po publikacji" }, slug: { label: "Nazwa pliku (= kotwica, bez .yaml)" } }),
        order: fields.integer({ label: "Kolejność", validation: { isRequired: true, min: 1 } }),
        aliases: fields.array(fields.text({ label: "Synonim" }), { label: "Synonimy", itemLabel: (p) => p.value }),
        def: fields.text({ label: "Definicja", multiline: true, validation: { isRequired: true } }),
        see: fields.array(fields.relationship({ label: "Karta", collection: "kody" }), { label: "Zobacz (karty)", itemLabel: (p) => p.value ?? "" }),
        diagram: fields.select({ label: "Rysunek", options: [{ label: "— brak —", value: "" }, ...diagramy.map((d: string) => ({ label: d, value: d }))], defaultValue: "" }),
      },
    }),
  },
});
