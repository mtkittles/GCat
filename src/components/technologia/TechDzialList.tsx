"use client";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { levelName } from "@/lib/gcodes";
import { artHref, OBROBKA_LABEL, TYP_LABEL, type Obrobka, type TechArt } from "@/lib/technologia";
import { useProAccess } from "./useProAccess";

/*
  Lista artykułów działu z filtrami: obróbka i poziom. Artykuły Pro widzi tylko konto redakcji i plan Pro.
  Miniatury (rysunki) renderuje strona na serwerze i podaje gotowe (`thumbs`).
*/
const OBR: Obrobka[] = ["frezowanie", "toczenie", "wiercenie"];

export default function TechDzialList({ arts, thumbs }: { arts: TechArt[]; thumbs: Record<string, ReactNode> }) {
  const pro = useProAccess();
  const all = useMemo(() => arts.filter((a) => a.plan === "free" || pro), [arts, pro]);
  const [obr, setObr] = useState<Obrobka | null>(null);
  const [lvl, setLvl] = useState<1 | 2 | 3 | null>(null);
  const shown = all.filter((a) => (!obr || a.obrobka.includes(obr)) && (!lvl || a.poziom === lvl));
  const nObr = (o: Obrobka) => all.filter((a) => a.obrobka.includes(o) && (!lvl || a.poziom === lvl)).length;
  const nLvl = (l: 1 | 2 | 3) => all.filter((a) => a.poziom === l && (!obr || a.obrobka.includes(obr))).length;
  return (
    <div className="grid gap-4">
      {all.length > 1 && (
        <div className="tech-filters" role="group" aria-label="Filtry">
          <div className="tech-pills" role="group" aria-label="Obróbka">
            <button type="button" className="pill-f" aria-pressed={!obr} onClick={() => setObr(null)}>Każda obróbka</button>
            {OBR.map((o) => <button key={o} type="button" className="pill-f" aria-pressed={obr === o} disabled={!nObr(o) && obr !== o} onClick={() => setObr(obr === o ? null : o)}>{OBROBKA_LABEL[o]} <small>{nObr(o)}</small></button>)}
          </div>
          <div className="tech-pills" role="group" aria-label="Poziom">
            <button type="button" className="pill-f" aria-pressed={!lvl} onClick={() => setLvl(null)}>Każdy poziom</button>
            {([1, 2, 3] as const).map((l) => <button key={l} type="button" className="pill-f" aria-pressed={lvl === l} disabled={!nLvl(l) && lvl !== l} onClick={() => setLvl(lvl === l ? null : l)}>{levelName(l)} <small>{nLvl(l)}</small></button>)}
          </div>
        </div>
      )}
      <ul className="tech-list">
        {shown.map((a) => (
          <li key={a.key}>
            <Link href={artHref(a)} className="tech-row">
              {thumbs[a.key]}
              <span className="tech-row-txt">
                <span className="tech-k">{TYP_LABEL[a.typ]}{a.plan === "pro" ? " · Pro" : ""}{a.stan === "szkic" ? " · szkic" : ""}</span>
                <b>{a.title}</b>
                <span className="tech-row-short">{a.short}</span>
                <span className="tech-row-meta">{levelName(a.poziom)} · {a.obrobka.map((o) => OBROBKA_LABEL[o]).join(", ")} · {a.minutes} min{a.normy.length ? ` · ${a.normy.join(", ")}` : ""}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {all.length > 0 && shown.length === 0 && <p className="text-muted">Brak artykułów dla wybranych filtrów.</p>}
    </div>
  );
}
