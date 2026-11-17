"use client";
import { useEffect, useMemo, useState, type MouseEvent } from "react";
import NumberFlow from "@number-flow/react";
import { Search, X } from "lucide-react";
import SpotlightCard from "@/components/tactile/SpotlightCard";
import StatusLed from "@/components/tactile/StatusLed";
import TactileSegmentedControl from "@/components/tactile/TactileSegmentedControl";
import GcodeLine from "@/components/pulpit/gcodeTokens";
import CodeDrawer from "@/components/kody/CodeDrawer";
import { levelName, type GCode } from "@/lib/gcodes";
import { codeParts, groupId } from "@/lib/codeRange";

/*
  Katalog /kody: przyklejony pasek (szukanie, licznik, język sterowania: Fanuc / Sinumerik / porównanie 1:1),
  filtry (grupa, maszyna, modalność, ★ opracowane) i siatka kart z blokiem składni w wybranym języku.
  Kliknięcie karty otwiera panel szczegółów (CodeDrawer); Ctrl/⌘ + klik i środkowy przycisk otwierają pełną kartę.
  Filtry i pozycja listy zostają w sesji — po wejściu w kartę i cofnięciu lista wygląda tak samo.
*/
type Dialect = "fanuc" | "sinumerik" | "compare";
type Tech = "all" | "mill" | "lathe";
type Modal = "all" | "modal" | "once";
interface Saved { q: string; dialect: Dialect; group: string; tech: Tech; modal: Modal; star: boolean; y: number }

const KEY = "gcat:kody:v2";
function loadSaved(): Partial<Saved> | null {
  try { const v = JSON.parse(window.sessionStorage.getItem(KEY) || "null"); return v && typeof v === "object" ? v : null; } catch { return null; }
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");

function Code({ code }: { code: string }) {
  const parts = codeParts(code);
  return <>{parts.map((p, i) => <span key={p} className="kl-code-part">{p}{i < parts.length - 1 ? " " : ""}</span>)}</>;
}

function SynBlock({ text, label }: { text: string; label?: string }) {
  return (
    <div className="kc-syn">
      {label && <span className="kc-syn-k">{label}</span>}
      <pre>{text.split("\n").map((l, i) => <code key={i}><GcodeLine raw={l} /></code>)}</pre>
    </div>
  );
}

export default function CodeCatalog({ items }: { items: GCode[] }) {
  const [q, setQ] = useState("");
  const [dialect, setDialect] = useState<Dialect>("fanuc");
  const [group, setGroup] = useState("all");
  const [tech, setTech] = useState<Tech>("all");
  const [modal, setModal] = useState<Modal>("all");
  const [star, setStar] = useState(false);
  const [sel, setSel] = useState<GCode | null>(null);
  const [open, setOpen] = useState(false);

  // stan z sesji po hydratacji (początek musi zgadzać się z HTML-em z serwera)
  useEffect(() => {
    const t = setTimeout(() => {
      const v = loadSaved(); if (!v) return;
      if (typeof v.q === "string") setQ(v.q);
      if (v.dialect) setDialect(v.dialect);
      if (v.group) setGroup(v.group);
      if (v.tech) setTech(v.tech);
      if (v.modal) setModal(v.modal);
      if (typeof v.star === "boolean") setStar(v.star);
      if (v.y && v.y > 0) requestAnimationFrame(() => window.scrollTo({ top: v.y }));
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const state = { q, dialect, group, tech, modal, star };
  const save = (patch: Partial<Saved>) => { try { window.sessionStorage.setItem(KEY, JSON.stringify({ ...state, y: 0, ...patch })); } catch { /* bez zapisu */ } };
  const set = <K extends keyof Saved>(k: K, v: Saved[K], fn: (v: Saved[K]) => void) => { fn(v); save({ [k]: v } as Partial<Saved>); };

  const groups = useMemo(() => [...new Set(items.map((g) => g.group))], [items]);
  const base = useMemo(() => items.filter((g) => {
    if (tech === "mill" && !g.milling) return false;
    if (tech === "lathe" && !g.turning) return false;
    if (modal === "modal" && !g.modal) return false;
    if (modal === "once" && g.modal) return false;
    if (star && !g.star) return false;
    const s = norm(q.trim());
    return !s || norm([g.code, g.name, g.short, g.group, g.syntax.fanuc, g.syntax.sinumerik].join(" ")).includes(s);
  }), [items, tech, modal, star, q]);
  const list = useMemo(() => (group === "all" ? base : base.filter((g) => g.group === group)), [base, group]);
  const sections = useMemo(() => {
    const m = new Map<string, GCode[]>();
    for (const g of list) { if (!m.has(g.group)) m.set(g.group, []); m.get(g.group)!.push(g); }
    return [...m];
  }, [list]);

  const openCard = (g: GCode) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    save({ y: window.scrollY });
    setSel(g); setOpen(true);
  };
  const clear = () => { setQ(""); setGroup("all"); setTech("all"); setModal("all"); setStar(false); save({ q: "", group: "all", tech: "all", modal: "all", star: false }); };
  const starCount = items.filter((g) => g.star).length;

  return (
    <div className="kc">
      <div className="kc-bar">
        <label className="kc-search">
          <Search aria-hidden />
          <input type="search" value={q} onChange={(e) => set("q", e.target.value, setQ)} placeholder="Szukaj: G02, łuk, CYCLE81, chłodziwo…" aria-label="Szukaj w katalogu kodów" autoComplete="off" />
          {q && <button type="button" className="kc-clear" onClick={() => set("q", "", setQ)} aria-label="Wyczyść"><X aria-hidden /></button>}
        </label>
        <span className="kc-count" aria-live="polite"><NumberFlow value={list.length} /><small>/{items.length}</small></span>
        <TactileSegmentedControl<Dialect> label="Składnia na kartach" value={dialect} onChange={(v) => set("dialect", v, setDialect)} size="sm" className="kc-dialect"
          options={[{ value: "fanuc", label: "Fanuc / ISO" }, { value: "sinumerik", label: "Sinumerik" }, { value: "compare", label: "Porównanie 1:1" }]} />
      </div>

      <div className="kc-filters">
        <div className="kc-pills" role="group" aria-label="Grupa kodów">
          <button type="button" className="pill-f" aria-pressed={group === "all"} onClick={() => set("group", "all", setGroup)}>Wszystkie <small>{base.length}</small></button>
          {groups.map((gr) => {
            const n = base.filter((g) => g.group === gr).length;
            return <button key={gr} type="button" className="pill-f" aria-pressed={group === gr} disabled={!n} onClick={() => set("group", gr, setGroup)}>{gr} <small>{n}</small></button>;
          })}
        </div>
        <div className="kc-sub">
          <TactileSegmentedControl<Tech> label="Maszyna" size="sm" value={tech} onChange={(v) => set("tech", v, setTech)}
            options={[{ value: "all", label: "Obie maszyny", led: false }, { value: "mill", label: "Frezowanie", led: false }, { value: "lathe", label: "Toczenie", led: false }]} />
          <TactileSegmentedControl<Modal> label="Modalność" size="sm" value={modal} onChange={(v) => set("modal", v, setModal)}
            options={[{ value: "all", label: "Wszystkie", led: false }, { value: "modal", label: "Modalne", led: false }, { value: "once", label: "Niemodalne", led: false }]} />
          <button type="button" className="pill-f" aria-pressed={star} onClick={() => set("star", !star, setStar)}
            title="Karty opracowane w pełnym układzie: schematy, animacje, różnice sterowań, typowe błędy">★ Opracowane <small>{starCount}</small></button>
        </div>
      </div>

      {sections.map(([grp, gs]) => (
        <section key={grp} className="kc-group" aria-labelledby={groupId(grp)}>
          <h2 id={groupId(grp)} className="kc-h">{grp} <small>{gs.length}</small></h2>
          <ul className={`kc-grid${dialect === "compare" ? " is-compare" : ""}`}>
            {gs.map((g) => (
              <li key={g.slug}>
                <SpotlightCard href={`/kody/${g.slug}`} className="kc-card" onClick={openCard(g)} aria-haspopup="dialog">
                  <span className="kc-top">
                    <code className="kc-code"><Code code={g.code} />{g.star && <span className="star" title="Karta opracowana">★</span>}</code>
                    <span className="kc-modal"><StatusLed state={g.modal ? "ready" : "idle"} pulse={false} />{g.modal ? "Modalny" : "Niemodalny"}</span>
                  </span>
                  <span className="kc-name">{g.name}</span>
                  <span className="kc-short">{g.short}</span>
                  {dialect === "compare"
                    ? <span className="kc-pair"><SynBlock label="Fanuc" text={g.syntax.fanuc} /><SynBlock label="Sinumerik" text={g.syntax.sinumerik} /></span>
                    : <SynBlock text={dialect === "fanuc" ? g.syntax.fanuc : g.syntax.sinumerik} />}
                  <span className="kc-foot">
                    {g.milling !== g.turning && <span className="tag on">{g.milling ? "frez" : "tok"}</span>}
                    {g.variesBy && <span className="tag tag-var" title={`Znaczenie zależy od: ${g.variesBy}`}>zależy od: {g.variesBy}</span>}
                    <span className="kl-level">{levelName(g.level)}</span>
                  </span>
                </SpotlightCard>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {list.length === 0 && (
        <p className="text-muted" role="status">Nic nie pasuje do wybranych filtrów{q.trim() ? ` i frazy „${q.trim()}”` : ""}. <button type="button" className="link-btn" onClick={clear}>Wyczyść filtry</button></p>
      )}

      <CodeDrawer g={sel} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
