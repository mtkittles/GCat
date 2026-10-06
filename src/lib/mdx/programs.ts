/*
  Programy z <Sim> i <Demo> w pliku MDX — odczyt synchroniczny dla skryptów (audit:programy).
  Ten sam wynik daje plugin remark (meta.programs); zgodność pilnuje tests/kody.test.ts.
*/
export function mdxPrograms(src: string): { kind: "sim" | "demo"; src: string; mode: "mill" | "lathe" }[] {
  return [...src.matchAll(/^<(Sim|Demo)\b([^>]*)>\n(`{3,})\n([\s\S]*?)\n\3\n<\/\1>$/gm)].map((m) => ({
    kind: m[1] === "Sim" ? "sim" : "demo",
    src: m[4],
    mode: /\bmode="lathe"/.test(m[2]) ? "lathe" : "mill",
  }));
}
