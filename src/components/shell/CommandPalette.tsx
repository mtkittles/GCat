"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import { ArrowRight, CornerDownLeft, Search } from "lucide-react";
import { NAV_ALL } from "./nav";
import StatusLed from "@/components/tactile/StatusLed";
import GcodeLine from "@/components/pulpit/gcodeTokens";
import { useMedia } from "@/lib/ui/prefs";
import { fullscreenTool, isEditing, setPaletteOpen, usePaletteOpen } from "@/lib/ui/palette";
import EmptyState from "@/components/ui/EmptyState";

/*
  Paleta poleceń Ctrl+K / ⌘K (cmdk). Indeks: karty kodów, lekcje, zadania i hasła słownika
  z src/lib/searchIndex.ts (ładowany przy pierwszym otwarciu, nie z każdą stroną) oraz gotowe programy
  (lista z serwera). Bez zapytania: działy serwisu i najczęściej otwierane karty.
*/
export type PaletteProgram = { title: string; href: string; sub: string; keys: string };
type Index = typeof import("@/lib/searchIndex");

const QUICK = [
  { code: "G00", name: "Ruch szybki", href: "/kody/g00" },
  { code: "G01", name: "Interpolacja liniowa", href: "/kody/g01" },
  { code: "G02 G03", name: "Interpolacja kołowa", href: "/kody/g02" },
  { code: "G41 G42", name: "Korekcja promienia", href: "/kody/g40-g42" },
  { code: "G81", name: "Cykl wiercenia", href: "/kody/g81-g83" },
  { code: "M03", name: "Obroty wrzeciona", href: "/kody/m03-m05" },
];

const GROUPS: { kind: string; label: string }[] = [
  { kind: "kod", label: "Kody G i M" },
  { kind: "lekcja", label: "Lekcje" },
  { kind: "program", label: "Gotowe programy" },
  { kind: "zadanie", label: "Zadania" },
  { kind: "pojęcie", label: "Słownik" },
];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l");

export default function CommandPalette({ programs }: { programs: PaletteProgram[] }) {
  const open = usePaletteOpen();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [index, setIndex] = useState<Index | null>(null);
  // zaznaczona pozycja (strzałki / kursor) — podgląd w prawej kolumnie na szerokim ekranie
  const [sel, setSel] = useState("");
  const wide = useMedia("(min-width: 960px)");

  useEffect(() => {
    if (open && !index) import("@/lib/searchIndex").then(setIndex).catch(() => {});
  }, [open, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (fullscreenTool()) return;
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "k") {
        if (isEditing(e.target) && !(e.target as HTMLElement).hasAttribute("cmdk-input")) return;
        e.preventDefault();
        setPaletteOpen(!open);
      } else if (e.key === "/" && !open && !isEditing(e.target)) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const results = useMemo(() => {
    const t = q.trim();
    if (t.length < 2) return null;
    const hits = (index?.search(t, 24) ?? []).map((h) => ({ kind: h.kind as string, title: h.title, sub: h.subtitle, href: h.href }));
    const nq = norm(t);
    const progs = programs.filter((p) => norm(p.title + " " + p.keys).includes(nq)).slice(0, 5).map((p) => ({ kind: "program", title: p.title, sub: p.sub, href: p.href }));
    return [...hits, ...progs];
  }, [q, index, programs]);

  const items = useMemo(() => {
    const m = new Map<string, { href: string; title: string; sub: string }>();
    if (results === null) {
      for (const n of NAV_ALL) m.set(`nav ${n.href}`, { href: n.href, title: n.label, sub: "" });
      for (const c of QUICK) m.set(`quick ${c.href}`, { href: c.href, title: `${c.code} — ${c.name}`, sub: "" });
    } else for (const r of results) m.set(r.href + r.title, { href: r.href, title: r.title, sub: r.sub });
    return m;
  }, [results]);
  const cur = items.get(sel) ?? null;
  const pk = cur && index ? index.peek(cur.href) : null;

  const go = (href: string) => {
    setPaletteOpen(false);
    setQ("");
    router.push(href);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(v) => { setPaletteOpen(v); if (!v) setQ(""); }}
      label="Szukaj w GCat"
      shouldFilter={false}
      loop
      value={sel}
      onValueChange={setSel}
      overlayClassName="pal-overlay"
      contentClassName={`pal${wide ? " has-peek" : ""}`}
    >
      <div className="pal-field">
        <Search aria-hidden />
        <Command.Input value={q} onValueChange={setQ} placeholder="Kod, lekcja, hasło, program…" autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="go" />
        <kbd className="pal-esc" onClick={() => setPaletteOpen(false)}>Esc</kbd>
      </div>

      <div className="pal-body">
      <Command.List className="pal-list">
        {results === null && (
          <>
            <Command.Group heading="Przejdź do" className="pal-group">
              {NAV_ALL.map((n) => {
                const Icon = n.icon;
                return (
                  <Command.Item key={n.href} value={`nav ${n.href}`} onSelect={() => go(n.href)} className="pal-item">
                    <Icon aria-hidden className="pal-ico" />
                    <span className="pal-title">{n.label}</span>
                    <ArrowRight aria-hidden className="pal-go" />
                  </Command.Item>
                );
              })}
            </Command.Group>
            <Command.Group heading="Często otwierane karty" className="pal-group">
              {QUICK.map((c) => (
                <Command.Item key={c.href} value={`quick ${c.href}`} onSelect={() => go(c.href)} className="pal-item">
                  <code className="pal-code">{c.code}</code>
                  <span className="pal-title">{c.name}</span>
                  <ArrowRight aria-hidden className="pal-go" />
                </Command.Item>
              ))}
            </Command.Group>
          </>
        )}

        {results !== null && !index && <Command.Loading className="pal-loading"><span className="skel skel-row" /><span className="skel skel-row" /><span className="skel skel-row is-short" /></Command.Loading>}
        {results !== null && index && results.length === 0 && <EmptyState compact title={`Brak wyników dla „${q.trim()}”.`}>Spróbuj kodu (G83), nazwy (łuk) albo hasła ze słownika.</EmptyState>}

        {results !== null && GROUPS.map((g) => {
          const items = results.filter((r) => r.kind === g.kind);
          if (!items.length) return null;
          return (
            <Command.Group key={g.kind} heading={g.label} className="pal-group">
              {items.slice(0, 8).map((r) => (
                <Command.Item key={r.href + r.title} value={r.href + r.title} onSelect={() => go(r.href)} className="pal-item">
                  <span className={`pal-kind k-${g.kind}`} aria-hidden />
                  <span className="pal-title">{r.title}</span>
                  <span className="pal-sub">{r.sub}</span>
                </Command.Item>
              ))}
            </Command.Group>
          );
        })}

        {results !== null && index && results.length > 0 && (
          <Command.Group className="pal-group">
            <Command.Item value="all-results" onSelect={() => go(`/szukaj?q=${encodeURIComponent(q.trim())}`)} className="pal-item">
              <Search aria-hidden className="pal-ico" />
              <span className="pal-title">Wszystkie wyniki dla „{q.trim()}”</span>
              <ArrowRight aria-hidden className="pal-go" />
            </Command.Item>
          </Command.Group>
        )}
      </Command.List>
      {wide && (
        <aside className="pal-peek" aria-live="polite" aria-label="Podgląd">
          {pk ? (
            <>
              <span className="pal-peek-k"><StatusLed state={pk.kind === "kod" ? (pk.modal ? "ready" : "idle") : "on"} pulse={false} />{pk.sub}</span>
              {pk.code && <code className="pal-peek-code">{pk.code}</code>}
              <b className="pal-peek-t">{pk.title}</b>
              {pk.text && <p className="pal-peek-x">{pk.text}</p>}
              {pk.syntax && (
                <div className="pal-peek-syn">
                  {(["fanuc", "sinumerik"] as const).map((c) => (
                    <div key={c}><small>{c === "fanuc" ? "Fanuc" : "Sinumerik"}</small><pre>{pk.syntax![c].split("\n").map((l, i) => <code key={i}><GcodeLine raw={l} /></code>)}</pre></div>
                  ))}
                </div>
              )}
              <span className="pal-peek-go"><kbd><CornerDownLeft aria-hidden /></kbd> otwórz {pk.kind === "kod" ? "kartę" : pk.kind === "pojęcie" ? "hasło" : pk.kind}</span>
            </>
          ) : cur ? (
            <>
              <span className="pal-peek-k">{cur.sub || "przejdź do"}</span>
              <b className="pal-peek-t">{cur.title}</b>
              <span className="pal-peek-go"><kbd><CornerDownLeft aria-hidden /></kbd> otwórz</span>
            </>
          ) : (
            <span className="pal-peek-k">Wybierz pozycję strzałkami, żeby zobaczyć podgląd</span>
          )}
        </aside>
      )}
      </div>

      <div className="pal-foot" aria-hidden>
        <span><kbd>↑</kbd><kbd>↓</kbd> wybór</span>
        <span><kbd><CornerDownLeft /></kbd> otwórz</span>
        <span><kbd>Esc</kbd> zamknij</span>
      </div>
    </Command.Dialog>
  );
}
