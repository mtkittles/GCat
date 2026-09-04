"use client";
import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine, Decoration, type DecorationSet, ViewPlugin, type ViewUpdate } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { StreamLanguage, syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { autocompletion, type CompletionContext, type Completion } from "@codemirror/autocomplete";
import { tags as t } from "@lezer/highlight";
import { gcodes } from "@/lib/gcodes";
import { reference } from "@/lib/content";

// --- gramatyka strumieniowa G-kodu
const gcodeLang = StreamLanguage.define({
  token(stream) {
    if (stream.match(/\([^)]*\)?/) || stream.match(/;.*/)) return "comment";
    if (stream.match(/[Gg]\s*\d+(\.\d+)?/)) return "keyword";
    if (stream.match(/[Mm]\s*\d+/)) return "atom";
    if (stream.match(/[NnOo]\s*\d+/)) return "meta";
    if (stream.match(/[XxYyZzAaBbCcUuVvWw]\s*[-+]?\d*\.?\d+/)) return "number";
    if (stream.match(/[IiJjKkRr]\s*[-+]?\d*\.?\d+/)) return "propertyName";
    if (stream.match(/[FfSs]\s*[-+]?\d*\.?\d+/)) return "string";
    if (stream.match(/[TtHhDdPpQqLl]\s*\d*\.?\d+/)) return "typeName";
    if (stream.match(/[A-Za-z]+/) || stream.match(/[-+]?\d*\.?\d+/)) return "invalid";
    stream.next(); return null;
  },
});

const style = HighlightStyle.define([
  { tag: t.comment, color: "var(--cm-comment)", fontStyle: "italic" },
  { tag: t.keyword, color: "var(--cm-g)", fontWeight: "700" },
  { tag: t.atom, color: "var(--cm-m)", fontWeight: "700" },
  { tag: t.meta, color: "var(--cm-n)" },
  { tag: t.number, color: "var(--cm-axis)" },
  { tag: t.propertyName, color: "var(--cm-ijk)" },
  { tag: t.string, color: "var(--cm-fs)" },
  { tag: t.typeName, color: "var(--cm-t)" },
  { tag: t.invalid, color: "var(--red)", textDecoration: "underline wavy" },
]);

// --- podpowiedzi
const gDesc = new Map<string, string>();
for (const [code, desc] of reference.g) for (const c of code.split(/\s*[\/–]\s*/)) gDesc.set(c.toUpperCase(), desc);
for (const [code, desc] of reference.m) for (const c of code.split(/\s*[\/–]\s*/)) gDesc.set(c.toUpperCase(), desc);
for (const g of gcodes) for (const c of g.code.split(" ")) if (!gDesc.has(c)) gDesc.set(c, g.short);
const letterDesc = new Map(reference.letters.flatMap(([k, d]) => k.split(" ").map((x) => [x, d] as [string, string])));

function complete(ctx: CompletionContext) {
  const w = ctx.matchBefore(/[A-Za-z]\d*/);
  if (!w || (w.from === w.to && !ctx.explicit)) return null;
  const letter = w.text[0].toUpperCase();
  const opts: Completion[] = [];
  if (letter === "G" || letter === "M") {
    for (const [code, d] of gDesc) if (code.startsWith(letter)) opts.push({ label: code, detail: d, type: letter === "G" ? "keyword" : "function" });
  } else {
    const d = letterDesc.get(letter); if (d) opts.push({ label: letter, detail: d, type: "variable" });
  }
  return { from: w.from, options: opts, validFor: /^[A-Za-z]\d*$/ };
}

// --- podświetlanie aktywnej linii symulacji i linii z błędami
const activeDeco = Decoration.line({ class: "cm-sim-active" });
const errorDeco = Decoration.line({ class: "cm-sim-error" });
const warnDeco = Decoration.line({ class: "cm-sim-warn" });

interface Props { value: string; onChange: (v: string) => void; activeLine?: number | null; errorLines?: number[]; warnLines?: number[]; }

export default function GcodeEditor({ value, onChange, activeLine, errorLines = [], warnLines = [] }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const marks = useRef({ activeLine, errorLines, warnLines });
  useEffect(() => { marks.current = { activeLine, errorLines, warnLines }; viewRef.current?.dispatch({}); }, [activeLine, errorLines, warnLines]);

  useEffect(() => {
    if (!host.current) return;
    const plugin = ViewPlugin.fromClass(class {
      decorations: DecorationSet;
      constructor(v: EditorView) { this.decorations = this.build(v); }
      update(u: ViewUpdate) { this.decorations = this.build(u.view); }
      build(v: EditorView) {
        const { activeLine, errorLines, warnLines } = marks.current; const b: { from: number; deco: Decoration }[] = [];
        const n = v.state.doc.lines;
        const add = (ln: number, d: Decoration) => { if (ln >= 0 && ln < n) b.push({ from: v.state.doc.line(ln + 1).from, deco: d }); };
        for (const e of errorLines) add(e, errorDeco);
        for (const e of warnLines) add(e, warnDeco);
        if (activeLine != null) add(activeLine, activeDeco);
        b.sort((x, y) => x.from - y.from);
        return Decoration.set(b.map((x) => x.deco.range(x.from)), true);
      }
    }, { decorations: (p) => p.decorations });
    const view = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          lineNumbers(), highlightActiveLine(), history(), keymap.of([...defaultKeymap, ...historyKeymap]),
          gcodeLang, syntaxHighlighting(style), autocompletion({ override: [complete], activateOnTyping: true }),
          plugin,
          EditorView.updateListener.of((u) => { if (u.docChanged) onChange(u.state.doc.toString()); }),
          EditorView.theme({ "&": { fontSize: "13px" }, ".cm-content": { fontFamily: "var(--font-mono)" }, ".cm-gutters": { background: "transparent", border: "none" } }),
        ],
      }),
    });
    viewRef.current = view;
    return () => { view.destroy(); viewRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // zewnętrzna zmiana tekstu (np. wybór przykładu)
  useEffect(() => {
    const v = viewRef.current; if (!v) return;
    if (v.state.doc.toString() !== value) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
  }, [value]);
  // odśwież dekoracje

  return <div ref={host} className="gcode-editor" />;
}
