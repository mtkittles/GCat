"use client";
import { Extension, type AnyExtension, type Editor } from "@tiptap/core";
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { useRef, useState } from "react";
import { diagrams } from "@/components/diagrams";
import Rys from "@/components/rys/Rys";
import SimClient from "@/components/simulator/SimClient";
import { Widget } from "@/lib/mdx/components";
import { gcatExtensions, NOTE_LABEL, WIDGET_LABEL, type NoteKind } from "@/lib/edytor/schema";
import { moveBlock } from "./blocks";
import { figText, usePendingCtx } from "./pending";

/*
  Widoki bloków w edytorze: wyglądają jak na stronie (te same klasy CSS i te same komponenty rysunków),
  a pola bloku (podpis, tytuł) da się poprawić w miejscu. Program edytuje się bezpośrednio w ramce kodu.
*/

type V = ReactNodeViewProps;
const Tag = ({ children }: { children: React.ReactNode }) => <span className="ed-tag" contentEditable={false}>{children}</span>;

function NoteView({ node }: V) {
  return (
    <NodeViewWrapper className={`note note-${node.attrs.kind} ed-note`} role="note" title={NOTE_LABEL[node.attrs.kind as NoteKind] ?? "Ramka"}>
      <NodeViewContent className="ed-note-body" />
    </NodeViewWrapper>
  );
}

const PROG_LABEL: Record<string, string> = { codeFig: "Program do przeczytania", simFig: "Animacja z symulatorem", demoFig: "Animacja z tytułem" };

function ProgramView({ node, updateAttributes, selected }: V) {
  const [play, setPlay] = useState(false);
  const t = node.type.name;
  const src = node.textContent;
  const mode = node.attrs.mode === "lathe" ? "lathe" : "mill";
  return (
    <NodeViewWrapper as="figure" className={`grid gap-1 ed-prog${selected ? " is-sel" : ""}`}>
      <div className="ed-prog-head" contentEditable={false}>
        <Tag>{PROG_LABEL[t]}{t !== "codeFig" ? ` · ${mode === "lathe" ? "tokarka" : "frezarka"}` : ""}</Tag>
        {t !== "codeFig" && <button type="button" className="ed-mini" onClick={() => setPlay((v) => !v)}>{play ? "Ukryj animację" : "▶ Pokaż animację"}</button>}
      </div>
      {t === "demoFig" && <input className="ed-inline demo-title" value={String(node.attrs.title ?? "")} placeholder="Tytuł animacji" onChange={(e) => updateAttributes({ title: e.target.value })} />}
      <NodeViewContent<"pre"> as="pre" className="syntax ed-code" spellCheck={false} />
      {play && t !== "codeFig" && <div contentEditable={false} className="ed-play"><SimClient key={src} initial={src} mode={mode} showcase autoplay="wide" controls editable={false} /></div>}
      <input className="ed-inline cap" value={String(node.attrs.caption ?? "")} placeholder="Podpis pod programem (opcjonalnie)" onChange={(e) => updateAttributes({ caption: e.target.value })} />
    </NodeViewWrapper>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="ed-empty">{children}</div>;
}

function DiagramView({ node, selected, editor, getPos }: V) {
  const id = String(node.attrs.id);
  const d = id in diagrams ? diagrams[id] : null;
  const ctx = usePendingCtx();
  const box = useRef<HTMLDivElement>(null);
  const redraw = () => {
    const el = box.current;
    const t = figText(el);
    ctx?.openRys({
      kind: "diagram", id, svg: el?.querySelector("svg") ?? null, title: t.title || id, code: t.code, caption: t.caption,
      onDone: (slug) => { const pos = getPos(); if (typeof pos === "number") editor.chain().command(({ tr, state }) => { tr.setNodeMarkup(pos, state.schema.nodes.rys, { id: slug, was: id }); return true; }).run(); },
    });
  };
  return (
    <NodeViewWrapper className={`ed-atom${selected ? " is-sel" : ""}`} data-drag-handle>
      <div className="ed-fig-bar" contentEditable={false}><Tag>Rysunek z biblioteki strony</Tag>{d && ctx && <button type="button" className="ed-mini ed-fig-edit" onClick={redraw}>Przerysuj w rysowniku</button>}</div>
      <div ref={box} contentEditable={false}>{d ? d() : <Empty>Rysunek „{id}” — wybierz rysunek w panelu po prawej</Empty>}</div>
    </NodeViewWrapper>
  );
}

function RysView({ node, selected, updateAttributes }: V) {
  const ctx = usePendingCtx();
  const id = String(node.attrs.id);
  const fig = id ? ctx?.figure(id) : undefined;
  const pending = !!(id && ctx?.pending.rys[id]);
  return (
    <NodeViewWrapper className={`ed-atom${selected ? " is-sel" : ""}`} data-drag-handle>
      <div className="ed-fig-bar" contentEditable={false}>
        <Tag>Rysunek z rysownika{pending ? " · zmieniony, zapisze się z publikacją" : ""}</Tag>
        {ctx && (fig
          ? <button type="button" className="ed-mini ed-fig-edit" onClick={() => ctx.openRys({ kind: "rys", slug: id })}>Edytuj w rysowniku</button>
          : <button type="button" className="ed-mini ed-fig-edit" onClick={() => ctx.openRys({ kind: "new", onDone: (slug) => updateAttributes({ id: slug }) })}>Narysuj nowy</button>)}
      </div>
      <div contentEditable={false}>{fig ? <Rys fig={fig} /> : <Empty>{id ? `Nie ma rysunku „${id}”` : "Nowy rysunek"} — narysuj go albo wybierz istniejący w panelu po prawej</Empty>}</div>
    </NodeViewWrapper>
  );
}

function ObrazView({ node, selected, updateAttributes }: V) {
  const ctx = usePendingCtx();
  const src = String(node.attrs.src ?? "");
  const shown = (src && ctx?.pending.img[src]?.dataUrl) || src;
  const [err, setErr] = useState("");
  return (
    <NodeViewWrapper as="figure" className={`grid gap-1 ed-atom${selected ? " is-sel" : ""}`} data-drag-handle>
      <div className="ed-fig-bar" contentEditable={false}>
        <Tag>Obraz{ctx?.pending.img[src] ? " · nowy, zapisze się z publikacją" : ""}</Tag>
        {ctx && <label className="ed-mini">Wgraj z komputera<input type="file" accept=".png,.jpg,.jpeg,.webp,.svg" hidden onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          const r = await ctx.addImage(f);
          if ("error" in r) setErr(r.error); else { setErr(""); updateAttributes({ src: r.src, alt: node.attrs.alt || f.name.replace(/\.[^.]+$/, "") }); }
        }} /></label>}
        {err && <span className="ed-rys-err">{err}</span>}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- podgląd pliku z public/ albo wgranego przed publikacją */}
      {shown ? <img src={shown} alt={String(node.attrs.alt ?? "")} /> : <Empty>Obraz — wgraj plik z komputera</Empty>}
      {node.attrs.caption ? <figcaption className="cap">{String(node.attrs.caption)}</figcaption> : null}
    </NodeViewWrapper>
  );
}

function WidgetView({ node, selected }: V) {
  const id = String(node.attrs.id);
  return (
    <NodeViewWrapper className={`ed-atom ed-widget${selected ? " is-sel" : ""}`} data-drag-handle>
      <Tag>{WIDGET_LABEL[id as keyof typeof WIDGET_LABEL] ?? id}</Tag>
      <div contentEditable={false}>{id === "rij" || id === "arc" || id === "jog" ? <Widget id={id} /> : <Empty>Nieznane narzędzie „{id}”</Empty>}</div>
    </NodeViewWrapper>
  );
}

function RawView({ node, updateAttributes, selected }: V) {
  return (
    <NodeViewWrapper className={`ed-atom ed-raw${selected ? " is-sel" : ""}`}>
      <Tag>Fragment MDX (edytor go nie rozpoznaje — zostaje bez zmian)</Tag>
      <textarea className="ed-raw-src" spellCheck={false} value={String(node.attrs.src ?? "")} rows={Math.min(14, String(node.attrs.src ?? "").split("\n").length + 1)} onChange={(e) => updateAttributes({ src: e.target.value })} />
    </NodeViewWrapper>
  );
}

function TermView({ node, selected }: V) {
  const label = String(node.attrs.label ?? node.attrs.k);
  return <NodeViewWrapper as="span" className={`ed-term${selected ? " is-sel" : ""}`} title={`Odnośnik: ${node.attrs.k}`}>{label}</NodeViewWrapper>;
}

const VIEWS: Record<string, (p: V) => React.ReactNode> = {
  note: NoteView, codeFig: ProgramView, simFig: ProgramView, demoFig: ProgramView,
  diagram: DiagramView, rys: RysView, obraz: ObrazView, widget: WidgetView, raw: RawView, term: TermView,
};

/* Kotwice nagłówków: nowy nagłówek (pusta kotwica) dostaje kotwicę z tekstu i śledzi tekst, dopóki autor jej nie zmieni. */
export function slugAnchor(t: string): string {
  return t.toLowerCase().normalize("NFC").replace(/[^\p{Ll}\p{N}\s-]+/gu, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 60) || "sekcja";
}
const anchors = new PluginKey("gcat-anchors");
const Anchors = Extension.create({
  name: "gcatAnchors",
  addProseMirrorPlugins() {
    return [new Plugin({
      key: anchors,
      appendTransaction: (trs, _old, state) => {
        if (!trs.some((t) => t.docChanged)) return null;
        const used = new Set<string>();
        const fix: { pos: number; anchor: string }[] = [];
        state.doc.forEach((n, pos) => {
          if (n.type.name !== "heading") return;
          const auto = n.attrs.autoAnchor || !n.attrs.anchor;
          let a = auto ? slugAnchor(n.textContent) : String(n.attrs.anchor);
          if (auto) { const b = a; let i = 2; while (used.has(a)) a = `${b}-${i++}`; }
          used.add(a);
          if (a !== n.attrs.anchor || (auto && !n.attrs.autoAnchor)) fix.push({ pos, anchor: a });
        });
        if (!fix.length) return null;
        const tr = state.tr;
        for (const f of fix) tr.setNodeMarkup(f.pos, undefined, { ...state.doc.nodeAt(f.pos)!.attrs, anchor: f.anchor, autoAnchor: true });
        return tr.setMeta("addToHistory", false);
      },
    })];
  },
});

const Keys = Extension.create({
  name: "gcatKeys",
  addKeyboardShortcuts() {
    return {
      "Alt-ArrowUp": () => moveBlock(this.editor as Editor, -1),
      "Alt-ArrowDown": () => moveBlock(this.editor as Editor, 1),
      "Mod-Alt-2": () => this.editor.chain().focus().toggleHeading({ level: 2 }).run(),
      "Mod-Alt-3": () => this.editor.chain().focus().toggleHeading({ level: 3 }).run(),
      "Mod-Alt-0": () => this.editor.chain().focus().setParagraph().run(),
    };
  },
});

/** Rozszerzenia edytora w przeglądarce: schemat + widoki bloków + kotwice + skróty. */
export function editorExtensions(placeholder: string): AnyExtension[] {
  return [
    ...gcatExtensions({ placeholder }).map((ext) => {
      const view = VIEWS[ext.name];
      if (view) return ext.extend({ addNodeView: () => ReactNodeViewRenderer(view) });
      if (ext.name === "table") return ext.extend({
        renderHTML({ node }: { node: { attrs: { caption?: string } } }) {
          return ["div", { class: "ed-table" }, ...(node.attrs.caption ? [["div", { class: "cap", contenteditable: "false" }, node.attrs.caption]] : []), ["table", { class: "code-table" }, ["tbody", 0]]];
        },
      });
      return ext;
    }),
    Anchors,
    Keys,
  ];
}
