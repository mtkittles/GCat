"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { fullscreenTool, isEditing, useModKey } from "@/lib/ui/palette";

/*
  Ściąga skrótów klawiszowych pod „?” (jak w Linear i GitHubie). Natywny <dialog> (showModal):
  pułapka fokusu, Esc i tło z przeglądarki; wejście animowane w CSS (@starting-style), bez biblioteki.
  Otwierana też z palety Ctrl+K (zdarzenie gcat:shortcuts).
*/
export const openShortcuts = () => window.dispatchEvent(new Event("gcat:shortcuts"));

type Row = [keys: string[], label: string];

export default function ShortcutsHelp() {
  const ref = useRef<HTMLDialogElement>(null);
  const mod = useModKey();

  useEffect(() => {
    const open = () => { const d = ref.current; if (d && !d.open) d.showModal(); };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "?" || e.ctrlKey || e.metaKey || e.altKey || isEditing(e.target) || fullscreenTool()) return;
      e.preventDefault();
      const d = ref.current; if (!d) return;
      if (d.open) d.close(); else d.showModal();
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("gcat:shortcuts", open);
    return () => { document.removeEventListener("keydown", onKey); window.removeEventListener("gcat:shortcuts", open); };
  }, []);

  const groups: [string, Row[]][] = [
    ["Ogólne", [
      [[mod, "K"], "Szukaj: kody, lekcje, hasła, programy"],
      [["/"], "Szukaj (gdy nie piszesz w polu)"],
      [[mod, "B"], "Zwiń / rozwiń panel boczny"],
      [["?"], "Ta ściąga"],
      [["Esc"], "Zamknij okno, panel, wyszukiwanie"],
    ]],
    ["Symulator", [
      [["Spacja"], "Start / pauza"],
      [["←", "→"], "Poprzedni / następny blok"],
      [["Home"], "Początek programu"],
      [[mod, "F"], "Szukaj w kodzie (w edytorze)"],
    ]],
    ["Fiszki", [
      [["Spacja"], "Odwróć kartę"],
      [["1"], "Do powtórki (także ←)"],
      [["2"], "Opanowane (także →)"],
    ]],
  ];

  return (
    <dialog ref={ref} className="kbd-help" aria-labelledby="kbd-help-t" onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}>
      <div className="kbd-help-in">
        <header className="kbd-help-head">
          <span className="ph-k" id="kbd-help-t">Skróty klawiszowe</span>
          <button type="button" className="kbd-help-x" aria-label="Zamknij" onClick={() => ref.current?.close()}><X aria-hidden /></button>
        </header>
        {groups.map(([g, rows]) => (
          <section key={g} className="kbd-help-g">
            <h2>{g}</h2>
            <dl>
              {rows.map(([keys, label]) => (
                <div key={label}>
                  <dt>{keys.map((k, i) => <kbd key={i}>{k}</kbd>)}</dt>
                  <dd>{label}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </dialog>
  );
}
