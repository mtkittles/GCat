"use client";
import { useState } from "react";

/*
  Klawiatura pomocnicza do pisania G-kodu na telefonie. Wstawia gotowe słowa
  i całe bloki, żeby nie przełączać się między klawiaturą literową a cyfrową.
*/

const GROUPS: { name: string; keys: { l: string; ins: string; hint?: string }[] }[] = [
  {
    name: "Ruch",
    keys: [
      { l: "G00", ins: "G00 ", hint: "szybki dojazd" },
      { l: "G01", ins: "G01 ", hint: "ruch roboczy" },
      { l: "G02", ins: "G02 ", hint: "łuk CW" },
      { l: "G03", ins: "G03 ", hint: "łuk CCW" },
      { l: "G04", ins: "G04 P", hint: "postój" },
    ],
  },
  {
    name: "Osie",
    keys: [
      { l: "X", ins: "X" }, { l: "Y", ins: "Y" }, { l: "Z", ins: "Z" },
      { l: "I", ins: "I" }, { l: "J", ins: "J" }, { l: "K", ins: "K" }, { l: "R", ins: "R" },
      { l: "−", ins: "-" }, { l: ".", ins: "." },
    ],
  },
  {
    name: "Parametry",
    keys: [
      { l: "F", ins: "F", hint: "posuw" }, { l: "S", ins: "S", hint: "obroty" },
      { l: "T", ins: "T", hint: "narzędzie" }, { l: "H", ins: "H", hint: "korektor długości" },
      { l: "D", ins: "D", hint: "korektor promienia" }, { l: "Q", ins: "Q", hint: "zagłębienie" },
      { l: "P", ins: "P" },
    ],
  },
  {
    name: "Ustawienia",
    keys: [
      { l: "G17", ins: "G17 " }, { l: "G18", ins: "G18 " },
      { l: "G90", ins: "G90 " }, { l: "G91", ins: "G91 " },
      { l: "G54", ins: "G54 " }, { l: "G94", ins: "G94 " }, { l: "G95", ins: "G95 " },
      { l: "G20", ins: "G20 " }, { l: "G21", ins: "G21 " },
    ],
  },
  {
    name: "Korekcje",
    keys: [
      { l: "G40", ins: "G40 " }, { l: "G41", ins: "G41 D1 " }, { l: "G42", ins: "G42 D1 " },
      { l: "G43", ins: "G43 H1 Z" }, { l: "G49", ins: "G49 " },
    ],
  },
  {
    name: "Cykle",
    keys: [
      { l: "G81", ins: "G99 G81 X Y Z R2 F" }, { l: "G83", ins: "G99 G83 X Y Z R2 Q F" },
      { l: "G84", ins: "G99 G84 X Y Z R5 F" }, { l: "G80", ins: "G80\n" },
      { l: "G98", ins: "G98 " }, { l: "G99", ins: "G99 " },
    ],
  },
  {
    name: "Funkcje M",
    keys: [
      { l: "M03", ins: "M03\n" }, { l: "M04", ins: "M04\n" }, { l: "M05", ins: "M05\n" },
      { l: "M06", ins: "M06\n" }, { l: "M08", ins: "M08\n" }, { l: "M09", ins: "M09\n" },
      { l: "M30", ins: "M30\n" },
    ],
  },
];

const SNIPPETS: { l: string; ins: string }[] = [
  { l: "Blok startowy", ins: "G21 G90 G17 G54 G40 G49 G80\n" },
  { l: "Nowe narzędzie", ins: "T01 M06\nG43 H01 Z50\nS2000 M03\nM08\n" },
  { l: "Zakończenie", ins: "G00 Z50\nM09\nM05\nG91 G28 Z0\nG90\nM30\n" },
  { l: "Komentarz", ins: "( )\n" },
];

export default function GcodePad({ onInsert }: { onInsert: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(GROUPS[0].name);
  const group = GROUPS.find((g) => g.name === tab) ?? GROUPS[0];

  return (
    <div className="pad">
      <button className="pad-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {open ? "Ukryj klawiaturę G-kodu" : "Klawiatura G-kodu"}
      </button>
      {open && (
        <div className="pad-body">
          <div className="pad-tabs">
            {GROUPS.map((g) => (
              <button key={g.name} aria-pressed={tab === g.name} onClick={() => setTab(g.name)}>{g.name}</button>
            ))}
          </div>
          <div className="pad-keys">
            {group.keys.map((k) => (
              <button key={k.l} onClick={() => onInsert(k.ins)} title={k.hint}>{k.l}</button>
            ))}
          </div>
          <div className="pad-snippets">
            {SNIPPETS.map((sn) => <button key={sn.l} onClick={() => onInsert(sn.ins)}>{sn.l}</button>)}
          </div>
        </div>
      )}
    </div>
  );
}
