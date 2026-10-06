// @vitest-environment happy-dom
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";

/*
  KLUCZOWY TEST round-trip: każdy plik karty i hasła otwarty i zapisany bez zmian przez Keystatic
  (te same kroki co panel przy otwarciu i zapisie wpisu — tests/keystatic-roundtrip.ts) = zero diffu.
  Pliki trzymamy w formacie, który zapisuje Keystatic, więc edycja w panelu zmienia tylko to, co zmienił redaktor.
  Keystatic działa tu w wersji przeglądarkowej (parser edytora MDX), stąd happy-dom i podmiana modułów.
*/

const KS = path.resolve("node_modules/@keystatic/core/dist");
vi.mock("@keystatic/core", async () => await import(`${KS}/keystatic-core.js`));
vi.mock("@keystatic/core/content-components", async () => await import(`${KS}/keystatic-core-content-components.js`));

const pliki = (dir: string, ext: string) => readdirSync(dir).filter((f) => f.endsWith(ext)).sort();

describe("Keystatic round-trip: otwórz i zapisz bez zmian = zero diffu", () => {
  it("wersja Keystatic = przypięta (test korzysta z jej wewnętrznych modułów)", () => {
    expect(JSON.parse(readFileSync("node_modules/@keystatic/core/package.json", "utf8")).version).toBe("0.6.9");
  });

  for (const [col, dir, ext, n] of [["kody", "content/kody", ".mdx", 56], ["slownik", "content/slownik", ".yaml", 77]] as const) {
    it(`${dir}: ${n} plików`, async () => {
      const { roundtripEntry } = await import("./keystatic-roundtrip");
      const cfg = (await import("../keystatic.config")).default;
      const files = pliki(dir, ext);
      expect(files.length).toBe(n);
      const zmienione: string[] = [];
      for (const f of files) {
        const raw = readFileSync(`${dir}/${f}`, "utf8");
        const out = await roundtripEntry(cfg, col, f.slice(0, -ext.length), raw);
        if (out !== raw) zmienione.push(f);
      }
      expect(zmienione).toEqual([]);
    }, 300000);
  }

  it("blok Obraz (plik w public/rysunki/<slug>/) i Diagram przechodzą bez zmian", async () => {
    const { roundtripEntry } = await import("./keystatic-roundtrip");
    const cfg = (await import("../keystatic.config")).default;
    // wpis pod osobnym slugiem: katalog obrazów public/rysunki/<slug>/ tylko na czas testu (nie dotyka prawdziwych kart)
    const dir = "public/rysunki/test-roundtrip";
    mkdirSync(dir, { recursive: true });
    writeFileSync(`${dir}/obraz.png`, "PNG");
    try {
      const raw = readFileSync("content/kody/g01.mdx", "utf8") + '\n<Obraz src="/rysunki/test-roundtrip/obraz.png" alt="Opis" caption="Podpis [[G01]]" />\n\n<Diagram id="g01" />\n';
      expect(await roundtripEntry(cfg, "kody", "test-roundtrip", raw)).toBe(raw);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
