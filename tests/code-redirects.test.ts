import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { codeRedirects } from "@/lib/codeRedirects";

const cards = readdirSync("content/kody").filter((f) => f.endsWith(".mdx")).map((f) => {
  const t = readFileSync(`content/kody/${f}`, "utf8");
  return { slug: /^slug:\s*(.+)$/m.exec(t)![1].trim(), code: /^code:\s*(.+)$/m.exec(t)![1].trim() };
});

describe("codeRedirects — pojedynczy kod → karta zbiorcza", () => {
  const r = codeRedirects(cards);
  it("kody z kart zbiorczych prowadzą do karty", () => {
    expect(r.g81).toBe("g81-g83");
    expect(r.g41).toBe("g40-g42");
    expect(r.g55).toBe("g54-g59");
    expect(r.m03).toBe("m03-m05");
    expect(r["g68-2"]).toBe("g68-2-g53-1");
  });
  it("przy kilku kartach wygrywa ta, której adres zaczyna się od kodu", () => {
    expect(r.g94).toBe("g94-g95");
    expect(r.g90).toBe("g90-g91");
  });
  it("kod z własną kartą nie ma przekierowania, a każdy cel istnieje", () => {
    const own = new Set(cards.map((c) => c.slug));
    for (const s of ["g00", "g01", "g02", "g76", "g82", "g92", "m06"]) expect(r[s]).toBeUndefined();
    for (const [from, to] of Object.entries(r)) { expect(own.has(from)).toBe(false); expect(own.has(to)).toBe(true); }
  });
});
