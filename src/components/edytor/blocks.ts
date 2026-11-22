"use client";
import type { Editor, JSONContent } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import { normProgram } from "@/components/karta/CardView";

/* Operacje na blokach dokumentu (pasek narzędzi, panel, skróty) i dane dla widoku karty. */

/** Blok najwyższego poziomu, w którym stoi zaznaczenie. */
export function topBlock(editor: Editor): { node: PMNode; pos: number; index: number } | null {
  const { selection, doc } = editor.state;
  if (selection instanceof NodeSelection && selection.$from.depth === 0) {
    const node = selection.node;
    return { node, pos: selection.from, index: selection.$from.index(0) };
  }
  const $p = selection.$from;
  if ($p.depth < 1) return null;
  const index = $p.index(0);
  const node = doc.child(index);
  return { node, pos: $p.before(1), index };
}

/** Najbliższy węzeł danego typu wokół zaznaczenia (np. note, table, heading). */
export function around(editor: Editor, types: string[]): { node: PMNode; pos: number } | null {
  const { selection } = editor.state;
  if (selection instanceof NodeSelection && types.includes(selection.node.type.name)) return { node: selection.node, pos: selection.from };
  const $p = selection.$from;
  for (let d = $p.depth; d > 0; d--) {
    const n = $p.node(d);
    if (types.includes(n.type.name)) return { node: n, pos: $p.before(d) };
  }
  return null;
}

export function moveBlock(editor: Editor, dir: -1 | 1): boolean {
  const b = topBlock(editor);
  if (!b) return false;
  const { doc } = editor.state;
  const j = b.index + dir;
  if (j < 0 || j >= doc.childCount) return false;
  const other = doc.child(j);
  const tr = editor.state.tr;
  const offset = editor.state.selection.from - b.pos;
  if (dir === -1) {
    const start = b.pos - other.nodeSize;
    tr.delete(b.pos, b.pos + b.node.nodeSize).insert(start, b.node);
    selectAt(tr, start, offset, b.node);
  } else {
    const end = b.pos + b.node.nodeSize + other.nodeSize;
    tr.insert(end, b.node).delete(b.pos, b.pos + b.node.nodeSize);
    selectAt(tr, b.pos + other.nodeSize, offset, b.node);
  }
  editor.view.dispatch(tr.scrollIntoView());
  return true;
}

function selectAt(tr: Editor["state"]["tr"], start: number, offset: number, node: PMNode) {
  if (node.isAtom || !node.isTextblock && node.type.spec.atom) tr.setSelection(NodeSelection.create(tr.doc, start));
  else tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(start + offset, start + node.nodeSize - 1))));
}

export function duplicateBlock(editor: Editor) {
  const b = topBlock(editor);
  if (!b) return;
  const copy = b.node.type.create({ ...b.node.attrs, oid: null }, b.node.content, b.node.marks);
  editor.chain().insertContentAt(b.pos + b.node.nodeSize, copy.toJSON()).run();
}

export function deleteBlock(editor: Editor) {
  const b = topBlock(editor);
  if (!b) return;
  editor.chain().focus().deleteRange({ from: b.pos, to: b.pos + b.node.nodeSize }).run();
}

/** Wstawia blok po bieżącym bloku najwyższego poziomu (albo zamiast pustego akapitu). */
export function insertBlock(editor: Editor, content: JSONContent) {
  const b = topBlock(editor);
  if (!b) { editor.chain().focus().insertContent(content).run(); return; }
  const empty = b.node.type.name === "paragraph" && b.node.content.size === 0;
  const at = empty ? b.pos : b.pos + b.node.nodeSize;
  const chain = editor.chain().focus();
  if (empty) chain.deleteRange({ from: b.pos, to: b.pos + b.node.nodeSize });
  chain.insertContentAt(at, content).run();
  // zaznacz wstawiony blok (atom) albo postaw kursor w środku
  const node = editor.state.doc.nodeAt(at);
  if (node?.isAtom) editor.view.dispatch(editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, at)));
  else editor.commands.setTextSelection(Math.min(at + 1, editor.state.doc.content.size));
}

export const NEW: Record<string, () => JSONContent> = {
  codeFig: () => ({ type: "codeFig", attrs: { caption: "" }, content: [{ type: "text", text: "G00 X0. Y0." }] }),
  simFig: () => ({ type: "simFig", attrs: { mode: "mill", caption: "" }, content: [{ type: "text", text: "G21 G90 G94 G17\nG40 G49 G80\nG54\nT1 M06\nG00 G43 H1 Z50.\nS2000 M03\nG00 X0. Y0.\nG00 Z2.\nG01 Z-2. F100\nG01 X40. F300\nG00 Z50.\nM05\nM30" }] }),
  demoFig: () => ({ type: "demoFig", attrs: { mode: "mill", title: "", caption: "" }, content: [{ type: "text", text: "G21 G90 G94 G17\nG40 G49 G80\nG54\nT1 M06\nG00 G43 H1 Z50.\nS2000 M03\nG00 X0. Y0.\nG00 Z2.\nG01 Z-2. F100\nG01 X40. F300\nG00 Z50.\nM05\nM30" }] }),
  diagram: () => ({ type: "diagram", attrs: { id: "" } }),
  rys: () => ({ type: "rys", attrs: { id: "" } }),
  obraz: () => ({ type: "obraz", attrs: { src: "", alt: "", caption: "" } }),
  widget: () => ({ type: "widget", attrs: { id: "rij" } }),
  wzor: () => ({ type: "wzor", attrs: { f: "n = 1000 · V_c / (π · D)", legend: "n — obroty wrzeciona [obr/min]; V_c — prędkość skrawania [m/min]; D — średnica [mm]", caption: "" } }),
};

/** Ramka: zawija zaznaczone akapity; w ramce zmienia jej rodzaj albo ją zdejmuje (ten sam rodzaj). */
export function toggleNote(editor: Editor, kind: string) {
  const n = around(editor, ["note"]);
  if (!n) { editor.chain().focus().wrapIn("note", { kind }).run(); return; }
  if (n.node.attrs.kind === kind) editor.chain().focus().lift("note").run();
  else editor.chain().focus().command(({ tr }) => { tr.setNodeMarkup(n.pos, undefined, { ...n.node.attrs, kind }); return true; }).run();
}

/** Dane artykułu dla widoku karty — liczone z dokumentu tak jak plugin MDX liczy je przy buildzie. */
export function articleMeta(doc: PMNode) {
  const headings: { id: string; label: string }[] = [];
  let hasDiagram = false, hasAddrTable = false, text = false;
  const programs: string[] = [];
  doc.forEach((n) => {
    const t = n.type.name;
    if (t === "heading" && n.attrs.anchor) headings.push({ id: String(n.attrs.anchor), label: n.textContent.trim() });
    if (t === "diagram" || t === "rys") hasDiagram = true;
    if (t === "table" && n.firstChild?.firstChild?.textContent.trim() === "Adres") hasAddrTable = true;
    if (t === "codeFig" || t === "simFig" || t === "demoFig") programs.push(normProgram(n.textContent));
    if (!(t === "paragraph" && n.content.size === 0)) text = true;
  });
  return { headings, hasDiagram, hasAddrTable, programs, hasArticle: text };
}
