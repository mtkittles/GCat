import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { tocItems } from "@/components/Article";
import CardQuick from "@/components/CardQuick";
import CodeText from "@/components/CodeText";
import { diagrams } from "@/components/diagrams";
import LeftToc from "@/components/LeftToc";
import SourceList from "@/components/lesson/SourceList";
import SimClient from "@/components/simulator/SimClient";
import TocDrawer from "@/components/TocDrawer";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Chip from "@/components/ui/Chip";
import PageBanner from "@/components/ui/PageBanner";
import { bySlug, gcodes, levelName, type GCode } from "@/lib/gcodes";
import { cardCodes, lessonsForCodes } from "@/lib/lessonRefs";
import { OpenInSim } from "@/lib/mdx/components";
import { readOnlyCaption } from "@/lib/simGaps";

/*
  Widok karty kodu — wspólny dla strony /kody/[slug] (render przy buildzie) i edytora treści (/edytor):
  edytor podaje treść artykułu jako żywy edytor, a `edit` owija pola karty w „kliknij i edytuj”.
  Układ bez zmian względem dawnej strony (standard karty, audyt kart; paczki W, Z).
*/

export interface CardArticle {
  node: ReactNode;
  /** nagłówki artykułu (spis treści) — kotwice jawne z pliku */
  headings: { id: string; label: string }[];
  hasDiagram: boolean;
  /** artykuł ma własną tabelę adresów — strona nie powtarza wtedy tabeli z pola `params` */
  hasAddrTable: boolean;
  /** programy z bloków ``` artykułu (znormalizowane) — przykład z frontmattera nie jest powtarzany */
  programs: string[];
}

/** Pole karty w trybie edycji: klucz pola + widok taki jak na stronie. */
export type EditSlot = (key: string, view: ReactNode) => ReactNode;

/** Program bez wcięć i pustych linii — do porównania przykładu z frontmattera z programami artykułu. */
export function normProgram(t: string): string {
  return t.split("\n").map((l) => l.trim()).filter(Boolean).join("\n");
}

function H({ id, children }: { id: string; children: ReactNode }) {
  return <h2 id={id} className="card-h">{children}</h2>;
}

function relatedOf(g: GCode): GCode[] {
  const list = g.related?.map(bySlug).filter((x): x is GCode => !!x)
    ?? gcodes.filter((x) => x.group === g.group && x.slug !== g.slug).slice(0, 4);
  return list.slice(0, 6);
}

/* Skrót profilu do jednej linii (Z a, audyt kart cz. 2 §4.2); pełny opis po rozwinięciu. */
function profileShort(g: { milling: boolean; turning: boolean; exampleDialect?: "fanuc" | "sinumerik" }) {
  if (g.exampleDialect === "sinumerik") return "SINUMERIK, frezarka";
  if (g.milling && g.turning) return "Fanuc, frezarka i tokarka";
  return g.turning ? "Fanuc, system A, tokarka" : "Fanuc (ISO), frezarka";
}

/* Profil zapisu przykładów — jak nad lekcjami i zadaniami. */
function profileOf(g: { milling: boolean; turning: boolean; exampleDialect?: "fanuc" | "sinumerik"; exampleMode?: "mill" | "lathe" }) {
  if (g.exampleDialect === "sinumerik") return "Zapis przykładu: SINUMERIK — język natywny · frezarka · milimetry.";
  const mill = "Fanuc (ISO) · frezarka · milimetry, posuw na minutę (G94)";
  const lathe = "Fanuc, system A · tokarka, X w średnicy · milimetry, posuw na obrót (G99)";
  if (g.milling && g.turning) return `Zapis przykładów: frezarka — ${mill.replace(" · frezarka", "")}; tokarka — ${lathe.replace(" · tokarka", "")}. Przykład główny: ${g.exampleMode === "lathe" ? "tokarski" : "frezarski"}.`;
  return `Zapis przykładów: ${g.turning ? lathe : mill}. Różnice w SINUMERIKU — w składni i sekcji Sinumerik.`;
}

/*
  Standard karty kodu (ten sam układ dla każdego kodu):
  baner → jedno zdanie → Składnia i adresy → [Schemat] → Jak to działa → Przykład
  → Sinumerik → Na co uważać → Powiązane. Karty z pełnym artykułem zamiast sekcji
  opisowych mają artykuł, a pod nim „W skrócie”: Na co uważać, Sinumerik i przykład
  z frontmattera (o ile artykuł go nie zawiera). Gdy artykuł ma własną tabelę adresów,
  Składnia strony pokazuje tylko zapis Fanuc/Sinumerik.
*/
export default function CardView({ g, article, edit = (_k, v) => v, emptyArticle }: {
  g: GCode;
  article: CardArticle | null;
  /** tryb edycji: owija pola karty (kliknij i edytuj) */
  edit?: EditSlot;
  /** tryb edycji karty bez artykułu: miejsce na rozpoczęcie artykułu (pod „Jak to działa”) */
  emptyArticle?: ReactNode;
}) {
  const i = gcodes.findIndex((x) => x.slug === g.slug);
  const prev = i >= 0 ? gcodes[i - 1] : undefined, next = i >= 0 ? gcodes[i + 1] : undefined;
  const mode = g.exampleMode ?? (g.turning && !g.milling ? "lathe" : "mill");
  const self = g.code.toUpperCase().split(/[\s/–-]+/).filter((c) => /^[GM]\d/.test(c));
  const artHasFig = !!article?.hasDiagram;
  const fig = diagrams[g.slug] && !artHasFig ? diagrams[g.slug] : null;
  const rel = relatedOf(g);
  const inLessons = lessonsForCodes(cardCodes(g.code), [...(g.milling ? ["frezowanie" as const] : []), ...(g.turning ? ["toczenie" as const] : [])]);

  // artykuł z własną tabelą adresów: strona pokazuje tylko zapis Fanuc/Sinumerik (jedna „Składnia”, W)
  const showParams = g.params.length > 0 && !article?.hasAddrTable;
  const syntax = (
    <section className="grid gap-3">
      <H id="skladnia">Składnia</H>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><div className="syntax-label">Fanuc</div>{edit("syntax.fanuc", <pre tabIndex={0} className="syntax">{g.syntax.fanuc}</pre>)}</div>
        <div><div className="syntax-label">Sinumerik</div>{edit("syntax.sinumerik", <pre tabIndex={0} className="syntax">{g.syntax.sinumerik}</pre>)}</div>
      </div>
      {showParams && edit("params", (
        <table className="addr-table">
          <thead><tr><th>Adres</th><th>Znaczenie</th></tr></thead>
          <tbody>{g.params.map((p, k) => (
            <tr key={k}><td><code className="addr">{p.key}</code></td><td><CodeText text={p.desc} self={self} /></td></tr>
          ))}</tbody>
        </table>
      ))}
    </section>
  );

  const figure = fig && (<section className="grid gap-3"><H id="schemat">Schemat</H>{fig()}</section>);

  const related = rel.length > 0 && (
    <section className="grid gap-3">
      <H id="powiazane">Powiązane</H>
      {edit("related", (
        <div className="rel-list">
          {rel.map((r) => (
            <Link key={r.slug} href={`/kody/${r.slug}`} className="rel">
              <code>{r.code}</code><span>{r.name}</span>
            </Link>
          ))}
        </div>
      ))}
    </section>
  );

  const lessonsSec = inLessons.length > 0 && (
    <section className="grid gap-3">
      <H id="w-lekcjach">W lekcjach</H>
      <div className="rel-list">
        {inLessons.map((l) => (
          <Link key={l.href} href={l.href} className="rel">
            <code>{l.id}</code><span>{l.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );

  const sourcesSec = edit("sources", g.sources?.length ? <SourceList items={g.sources} fold="mobile" /> : (
    <section className="ls-src" aria-labelledby="zrodla">
      <h2 id="zrodla">Źródła</h2>
      <p className="ls-src-note">Do uzupełnienia — tej karty nie sprawdzono jeszcze w dokumentacji producenta sterowania. Opis dotyczy profilu podanego wyżej; na konkretnej maszynie obowiązuje jej dokumentacja.</p>
    </section>
  ));

  const example = edit("example", g.simulate === false ? (
    <figure className="grid gap-1">
      <pre tabIndex={0} className="syntax">{g.example}</pre>
      <figcaption className="cap">{readOnlyCaption(g.example, mode)}</figcaption>
    </figure>
  ) : (
    // animacja + „Otwórz w symulatorze” (paczka Z b, decyzja 7): pełny warsztat pod przyciskiem
    <figure className="grid gap-2 demo-fig">
      <SimClient key={g.example} initial={g.example} mode={mode} stock={g.exampleStock} dialect={g.exampleDialect} showcase autoplay="wide" controls editable={false} />
      <OpenInSim src={g.example} mode={mode} stock={g.exampleStock} dialect={g.exampleDialect} name={`${g.code} — przykład`} />
    </figure>
  ));
  const sinumerikNote = g.sinumerik && edit("sinumerik", <div role="note" className="note note-info"><CodeText text={g.sinumerik} self={self} /></div>);
  const pitfallNotes = g.pitfalls.map((p, k) => <Fragment key={k}>{edit(`pitfalls.${k}`, <div role="note" className="note note-warn"><CodeText text={p} self={self} /></div>)}</Fragment>);

  const footerNav = (
    <nav className="article-nav">
      <span>{prev && <Link href={`/kody/${prev.slug}`}>‹ {prev.code}</Link>}</span>
      <Link href="/kody">Wszystkie kody</Link>
      <span>{next && <Link href={`/kody/${next.slug}`}>{next.code} ›</Link>}</span>
    </nav>
  );

  const head = (
    <>
      <Breadcrumbs items={[{ href: "/", label: "GCat" }, { href: "/kody", label: "Kody" }, { label: g.code }]} />
      {edit("head", (
        <PageBanner plain kicker={g.group} title={g.code} subtitle={g.name} mono
          meta={<>
            <Chip tone={g.level === 1 ? "success" : g.level === 2 ? "warning" : "danger"}>{levelName(g.level)}</Chip>
            <Chip>{g.modal ? "modalny" : "jednorazowy"}</Chip>
            {g.milling && <Chip tone="info">frezowanie</Chip>}
            {g.turning && <Chip tone="info">toczenie</Chip>}
            {g.variesBy && <Chip tone="warning">zależy od: {g.variesBy}</Chip>}
          </>} />
      ))}
      {edit("short", <p className="lead max-w-prose"><CodeText text={g.short} self={self} /></p>)}
      <details className="tp-profile cc-profile"><summary>Zapis przykładów: {profileShort(g)}</summary><p>{profileOf(g)}</p></details>
    </>
  );

  if (article) {
    // spis treści artykułu z nagłówków MDX (kotwice jawne w pliku)
    const tocBlocks = article.headings.map((h) => ({ t: "h" as const, x: h.label, id: h.id }));
    // pola karty z frontmattera pod artykułem (decyzja 1, W); przykład tylko wtedy, gdy artykuł go nie zawiera
    const showEx = !!g.example.trim() && !article.programs.includes(normProgram(g.example));
    const recap = (g.pitfalls.length > 0 || !!g.sinumerik || showEx) && (
      <section className="grid gap-3 cc-recap">
        <H id="w-skrocie">W skrócie</H>
        {g.pitfalls.length > 0 && <div className="grid gap-2 max-w-prose"><h3 className="cc-h3">Na co uważać</h3>{pitfallNotes}</div>}
        {sinumerikNote && <div className="grid gap-2 max-w-prose"><h3 className="cc-h3">Sinumerik</h3>{sinumerikNote}</div>}
        {showEx && <div className="grid gap-2"><h3 className="cc-h3">Program przykładowy</h3>{example}</div>}
      </section>
    );
    const toc = [{ id: "skladnia", label: "Składnia" }, ...(figure ? [{ id: "schemat", label: "Schemat" }] : []), ...tocItems(tocBlocks), ...(recap ? [{ id: "w-skrocie", label: "W skrócie" }] : []), ...(lessonsSec ? [{ id: "w-lekcjach", label: "W lekcjach" }] : []), ...(related ? [{ id: "powiazane", label: "Powiązane" }] : []), { id: "zrodla", label: "Źródła" }];
    return (
      <div className="article-layout cc">
        <aside className="cc-left"><LeftToc items={toc} /></aside>
        <article className="grid gap-6 min-w-0 code-card">
          {head}
          {syntax}
          {figure}
          <div className="article grid gap-4">{article.node}</div>
          {recap}
          {lessonsSec}
          {related}
          {sourcesSec}
          {footerNav}
        </article>
        <aside className="cc-right"><CardQuick g={g} related={rel} lessons={inLessons} toc={toc} /></aside>
        <div className="toc-drawer-only"><TocDrawer title={g.code} items={toc} /></div>
      </div>
    );
  }

  const paras = g.desc.split(/\n\n+/);
  const toc = [
    { id: "skladnia", label: "Składnia" },
    ...(figure ? [{ id: "schemat", label: "Schemat" }] : []),
    { id: "opis", label: "Jak to działa" },
    { id: "przyklad", label: "Przykład" },
    ...(g.sinumerik ? [{ id: "sinumerik", label: "Sinumerik" }] : []),
    ...(g.pitfalls.length ? [{ id: "uwagi", label: "Na co uważać" }] : []),
    ...(lessonsSec ? [{ id: "w-lekcjach", label: "W lekcjach" }] : []),
    ...(related ? [{ id: "powiazane", label: "Powiązane" }] : []),
    { id: "zrodla", label: "Źródła" },
  ];

  return (
    <div className="article-layout cc">
    <aside className="cc-left"><LeftToc items={toc} /></aside>
    <article className="grid gap-6 min-w-0 code-card">
      {head}
      {syntax}
      {figure}
      <section className="grid gap-2 max-w-prose">
        <H id="opis">Jak to działa</H>
        {edit("desc", <>{paras.map((t, k) => <p key={k} className="leading-relaxed"><CodeText text={t} self={self} /></p>)}</>)}
      </section>
      {emptyArticle}
      <section className="grid gap-2">
        <H id="przyklad">Przykład</H>
        {example}
      </section>
      {g.sinumerik && (
        <section className="grid gap-2 max-w-prose">
          <H id="sinumerik">Sinumerik</H>
          {sinumerikNote}
        </section>
      )}
      {g.pitfalls.length > 0 && (
        <section className="grid gap-2 max-w-prose">
          <H id="uwagi">Na co uważać</H>
          {pitfallNotes}
        </section>
      )}
      {lessonsSec}
      {related}
      {sourcesSec}
      {footerNav}
    </article>
    <aside className="cc-right"><CardQuick g={g} related={rel} lessons={inLessons} toc={toc} /></aside>
    <div className="toc-drawer-only"><TocDrawer title={g.code} items={toc} /></div>
    </div>
  );
}
