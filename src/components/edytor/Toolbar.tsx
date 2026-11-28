"use client";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { glossary } from "@/lib/content";
import { KOLOR_LABEL, KOLORY, NOTE_KINDS, NOTE_LABEL } from "@/lib/edytor/schema";
import { gcodes } from "@/lib/gcodes";
import { around, insertBlock, NEW, toggleNote } from "./blocks";
import { ei, type EIcon } from "./icons";

/* Pasek narzędzi edytora — układ i wygląd jak w rysowniku (grupy przycisków z ikoną i podpisem). */

function Btn({ icon, label, on, disabled, onClick, title }: { icon: EIcon; label: string; on?: boolean; disabled?: boolean; onClick: () => void; title?: string }) {
  return (
    <button type="button" className="rys-tool" aria-pressed={on ?? undefined} disabled={disabled} title={title ?? label}
      onMouseDown={(e) => e.preventDefault() /* zaznaczenie w tekście zostaje */} onClick={onClick}>
      {ei[icon]}<span>{label}</span>
    </button>
  );
}

/** Rozwijane okienko pod przyciskiem paska. */
function Pop({ icon, label, on, children, title, width }: { icon: EIcon; label: string; on?: boolean; title?: string; width?: string; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open]);
  return (
    <div className="ed-pop-host" ref={ref}>
      <button type="button" className="rys-tool" aria-pressed={on || open || undefined} aria-expanded={open} title={title ?? label}
        onMouseDown={(e) => e.preventDefault()} onClick={() => setOpen((v) => !v)}>
        {ei[icon]}<span>{label} ▾</span>
      </button>
      {open && <div className="ed-pop" style={width ? { width } : undefined}>{children(() => setOpen(false))}</div>}
    </div>
  );
}

/** Lista kluczy odnośników [[…]]: kody kart (każdy kod osobno) i hasła słownika. */
export function useTermOptions() {
  return useMemo(() => [
    ...gcodes.flatMap((g) => g.code.split(/\s*[/,]\s*|\s+/).filter((c) => /^[GM]\d|^[A-Z]{3,}/.test(c)).map((c) => ({ k: c, label: `${c} — ${g.name}`, kind: "karta" as const }))),
    ...glossary.map((h) => ({ k: h.term, label: h.term, kind: "hasło" as const })),
  ], []);
}

export function TermPicker({ onPick, initial = "" }: { onPick: (k: string) => void; initial?: string }) {
  const all = useTermOptions();
  const [q, setQ] = useState(initial);
  const [i, setI] = useState(0);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (s ? all.filter((o) => o.k.toLowerCase().includes(s) || o.label.toLowerCase().includes(s)) : all).slice(0, 40);
  }, [all, q]);
  return (
    <div className="ed-picker">
      <input autoFocus value={q} placeholder="Szukaj kodu albo hasła…" onChange={(e) => { setQ(e.target.value); setI(0); }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setI((v) => Math.min(v + 1, list.length - 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setI((v) => Math.max(v - 1, 0)); }
          else if (e.key === "Enter" && list[i]) { e.preventDefault(); onPick(list[i].k); }
        }} />
      <ul role="listbox">
        {list.map((o, k) => (
          <li key={`${o.kind}-${o.k}`} role="option" aria-selected={k === i}>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onPick(o.k)}><span className="ed-pk">{o.kind}</span>{o.label}</button>
          </li>
        ))}
        {!list.length && <li className="ed-none">Nic nie pasuje.</li>}
      </ul>
    </div>
  );
}

export default function Toolbar({ editor, right }: { editor: Editor; right?: ReactNode }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      p: e.isActive("paragraph") && !around(e, ["note", "listItem", "tableCell", "tableHeader"]),
      h2: e.isActive("heading", { level: 2 }), h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"), italic: e.isActive("italic"), code: e.isActive("code"), kolor: e.isActive("kolor"), link: e.isActive("link"),
      ul: e.isActive("bulletList"), ol: e.isActive("orderedList"), table: e.isActive("table"), note: e.isActive("note"),
      inCode: !!around(e, ["codeFig", "simFig", "demoFig"]),
      canUndo: e.can().undo(), canRedo: e.can().redo(),
    }),
  });
  const c = () => editor.chain().focus();
  const off = s.inCode;
  return (
    <div className="rys-bar ed-bar" role="toolbar" aria-label="Narzędzia edytora">
      <div className="rys-tools">
        <Btn icon="p" label="Akapit" on={s.p} disabled={off} onClick={() => c().setParagraph().run()} title="Akapit (Ctrl+Alt+0)" />
        <Btn icon="h2" label="Nagłówek" on={s.h2} disabled={off} onClick={() => c().toggleHeading({ level: 2 }).run()} title="Nagłówek sekcji — trafia do spisu treści (Ctrl+Alt+2)" />
        <Btn icon="h3" label="Podtytuł" on={s.h3} disabled={off} onClick={() => c().toggleHeading({ level: 3 }).run()} title="Podtytuł w sekcji (Ctrl+Alt+3)" />
      </div>
      <div className="rys-tools">
        <Btn icon="bold" label="Pogrub" on={s.bold} disabled={off} onClick={() => c().toggleBold().run()} title="Pogrubienie (Ctrl+B)" />
        <Btn icon="italic" label="Kursywa" on={s.italic} disabled={off} onClick={() => c().toggleItalic().run()} title="Kursywa (Ctrl+I)" />
        <Btn icon="code" label="Kod" on={s.code} disabled={off} onClick={() => c().toggleCode().run()} title="Kod w tekście, np. G01 X10. (Ctrl+E)" />
        <Pop icon="kolor" label="Kolor" on={s.kolor} title="Wyróżnienie kolorem — gotowy zestaw jak kolory ruchów">
          {(close) => (
            <div className="ed-swatches">
              {KOLORY.map((k) => <button key={k} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { c().setMark("kolor", { k }).run(); close(); }}><i className={`kolor-dot kolor-${k}`} />{KOLOR_LABEL[k]}</button>)}
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { c().unsetMark("kolor").run(); close(); }}><i className="kolor-dot" />Bez koloru</button>
            </div>
          )}
        </Pop>
        <Pop icon="term" label="Odnośnik" width="22rem" title="Odnośnik do karty kodu albo hasła słownika — dymek z opisem na stronie">
          {(close) => <TermPicker onPick={(k) => {
            const { from, to, empty } = editor.state.selection;
            const label = empty ? null : editor.state.doc.textBetween(from, to, " ");
            c().insertContent({ type: "term", attrs: { k, label: label && label.toLowerCase() !== k.toLowerCase() ? label : null } }).run();
            close();
          }} />}
        </Pop>
        <Pop icon="link" label="Link" on={s.link} width="20rem" title="Link do strony zewnętrznej">
          {(close) => <LinkForm initial={String(editor.getAttributes("link").href ?? "")} onSet={(href) => { if (href) c().extendMarkRange("link").setLink({ href }).run(); else c().extendMarkRange("link").unsetLink().run(); close(); }} />}
        </Pop>
      </div>
      <div className="rys-tools">
        <Btn icon="ul" label="Lista" on={s.ul} disabled={off} onClick={() => c().toggleBulletList().run()} />
        <Btn icon="ol" label="Numeracja" on={s.ol} disabled={off} onClick={() => c().toggleOrderedList().run()} />
        <Btn icon="table" label="Tabela" on={s.table} disabled={off} onClick={() => insertBlock(editor, { type: "table", attrs: { caption: "", align: null }, content: [0, 1, 2].map((r) => ({ type: "tableRow", content: [0, 1].map(() => ({ type: r === 0 ? "tableHeader" : "tableCell", content: [{ type: "paragraph" }] })) })) })} />
        <Pop icon="note" label="Ramka" on={s.note} title="Ramka: wskazówka, uwaga albo informacja">
          {(close) => (
            <div className="ed-swatches">
              {NOTE_KINDS.map((k) => <button key={k} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { toggleNote(editor, k); close(); }}><i className={`note-dot note-${k}`} />{NOTE_LABEL[k]}</button>)}
            </div>
          )}
        </Pop>
      </div>
      <div className="rys-tools">
        <Btn icon="prog" label="Program" onClick={() => insertBlock(editor, NEW.codeFig())} title="Program do przeczytania (ramka kodu z podpisem)" />
        <Btn icon="sim" label="Animacja" onClick={() => insertBlock(editor, NEW.simFig())} title="Animacja programu w symulatorze z przyciskiem „Otwórz w symulatorze”" />
        <Btn icon="diagram" label="Rysunek" onClick={() => insertBlock(editor, NEW.diagram())} title="Rysunek z biblioteki strony" />
        <Btn icon="rys" label="Z rysownika" onClick={() => insertBlock(editor, NEW.rys())} title="Rysunek narysowany w rysowniku" />
        <Btn icon="image" label="Obraz" onClick={() => insertBlock(editor, NEW.obraz())} />
        <Btn icon="wzor" label="Wzór" onClick={() => insertBlock(editor, NEW.wzor())} title="Wzór w ramce z legendą symboli" />
        <Btn icon="widget" label="Kalkulator" onClick={() => insertBlock(editor, NEW.widget())} title="Narzędzie interaktywne (kalkulator)" />
        <Btn icon="widget" label="Dekoder ISO" onClick={() => insertBlock(editor, NEW.dekoderIso())} title="Oznaczenie płytki wg ISO 1832 z objaśnieniem znaków" />
      </div>
      <div className="rys-tools">
        <Btn icon="undo" label="Cofnij" disabled={!s.canUndo} onClick={() => c().undo().run()} title="Cofnij (Ctrl+Z)" />
        <Btn icon="redo" label="Ponów" disabled={!s.canRedo} onClick={() => c().redo().run()} title="Ponów (Ctrl+Shift+Z)" />
      </div>
      {right && <div className="rys-actions">{right}</div>}
    </div>
  );
}

function LinkForm({ initial, onSet }: { initial: string; onSet: (href: string) => void }) {
  const [v, setV] = useState(initial);
  return (
    <form className="ed-linkform" onSubmit={(e) => { e.preventDefault(); onSet(v.trim()); }}>
      <input autoFocus value={v} placeholder="https://…" onChange={(e) => setV(e.target.value)} />
      <button type="submit" className="btn">{v.trim() ? "Ustaw" : "Usuń link"}</button>
    </form>
  );
}
