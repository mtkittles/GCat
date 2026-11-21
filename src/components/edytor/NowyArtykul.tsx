"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DzialIcon } from "@/components/technologia/icons";
import PageBanner from "@/components/ui/PageBanner";
import { nowyArtykul, slugTytulu, SZABLONY } from "@/lib/edytor/szablony";
import { ARTYKUL_TYPY, OBROBKI } from "@/lib/mdx/schema";
import { artsOf, artykuly, dzialy, OBROBKA_LABEL, type ArtTyp } from "@/lib/technologia";
import ArtykulEditor from "./ArtykulEditor";

/* Formularz „Nowy artykuł”: dział, szablon (Karta narzędzia / Temat / Porównanie), tytuł i adres → edytor z szablonem. */

const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

export default function NowyArtykul() {
  const [dzial, setDzial] = useState(dzialy[0].slug);
  // ?dzial=… z przycisku „Nowy artykuł w dziale” (tryb edycji na stronie działu)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("dzial");
    if (q && dzialy.some((d) => d.slug === q)) setDzial(q); // eslint-disable-line react-hooks/set-state-in-effect -- jednorazowo z adresu
  }, []);
  const [typ, setTyp] = useState<ArtTyp>("narzedzie");
  const [title, setTitle] = useState("");
  const [slugEdit, setSlugEdit] = useState<string | null>(null);
  const [obr, setObr] = useState<string[]>(["frezowanie"]);
  const [start, setStart] = useState<{ path: string; text: string } | null>(null);
  const slug = slugEdit ?? slugTytulu(title);
  const taken = artykuly.some((a) => a.dzial === dzial && a.slug === slug);
  const okSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  const order = useMemo(() => (artsOf(dzial).at(-1)?.order ?? 0) + 10, [dzial]);
  const can = title.trim().length > 2 && okSlug && !taken && obr.length > 0;

  if (start) return <ArtykulEditor path={start.path} initial={start.text} isNew />;

  return (
    <div className="ed-index ed-new">
      <PageBanner plain kicker="Technologia" title="Nowy artykuł" subtitle="Wybierz dział i szablon. Plik powstanie przy pierwszej publikacji." />
      <form className="ed-new-form" onSubmit={(e) => { e.preventDefault(); if (can) setStart({ path: `content/technologia/${dzial}/${slug}.mdx`, text: nowyArtykul({ dzial, typ, title: title.trim(), slug, order, dodano: today(), obrobka: obr }) }); }}>
        <fieldset>
          <legend>Dział</legend>
          <div className="ed-new-grid">
            {dzialy.map((d) => (
              <label key={d.slug} className="ed-new-opt">
                <input type="radio" name="dzial" value={d.slug} checked={dzial === d.slug} onChange={() => setDzial(d.slug)} />
                <DzialIcon icon={d.icon} width={18} height={18} /><b>{d.title}</b>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Szablon</legend>
          <div className="ed-new-grid is-3">
            {ARTYKUL_TYPY.map((t) => (
              <label key={t} className="ed-new-opt is-tall">
                <input type="radio" name="typ" value={t} checked={typ === t} onChange={() => setTyp(t)} />
                <b>{SZABLONY[t].label}</b>
                <span>{SZABLONY[t].opis}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Tytuł i adres</legend>
          <label className="ed-field"><span>Tytuł</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="np. Frez trzpieniowy kulisty" autoFocus /></label>
          <label className="ed-field"><span>Adres (slug, nazwa pliku — później się nie zmienia)</span>
            <input className="is-mono" value={slug} onChange={(e) => setSlugEdit(e.target.value)} placeholder="frez-kulisty" />
            <small>/technologia/{dzial}/{slug || "…"}{taken ? " — taki artykuł już jest" : !okSlug && slug ? " — tylko małe litery, cyfry i myślniki" : ""}</small>
          </label>
          <div className="rys-checks" role="group" aria-label="Obróbka">
            {OBROBKI.map((o) => <label key={o}><input type="checkbox" checked={obr.includes(o)} onChange={() => setObr(obr.includes(o) ? obr.filter((x) => x !== o) : OBROBKI.filter((x) => x === o || obr.includes(x)))} />{OBROBKA_LABEL[o]}</label>)}
          </div>
        </fieldset>
        <div className="ed-new-acts">
          <button type="submit" className="btn" disabled={!can}>Utwórz i otwórz edytor</button>
          <Link href="/edytor#technologia" className="btn ghost">Anuluj</Link>
        </div>
      </form>
    </div>
  );
}
