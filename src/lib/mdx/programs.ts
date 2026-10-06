/*
  Programy z <Sim> i <Demo> w pliku MDX — odczyt synchroniczny dla skryptów (audit:programy).
  Ten sam wynik daje plugin remark (meta.programs); zgodność pilnuje tests/kody.test.ts.
*/
export function mdxPrograms(src: string): { kind: "sim" | "demo"; src: string; mode: "mill" | "lathe" }[] {
  // blok ``` może być wcięty (Keystatic wcina treść komponentów o 2 spacje) — wcięcie płotu zdejmujemy z każdej linii
  return [...src.matchAll(/^<(Sim|Demo)\b([^>]*)>\n( *)(`{3,})\n([\s\S]*?)\n\3\4\n<\/\1>$/gm)].map((m) => ({
    kind: m[1] === "Sim" ? "sim" : "demo",
    src: m[5].split("\n").map((l) => (l.startsWith(m[3]) ? l.slice(m[3].length) : l.trimStart())).join("\n"),
    mode: /\bmode="lathe"/.test(m[2]) ? "lathe" : "mill",
  }));
}
