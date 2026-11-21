"use client";
import { sources as SOURCES } from "@/content/nauka/sources";
import { glossary } from "@/lib/content";
import { gcodes } from "@/lib/gcodes";
import { ARTYKUL_TYPY, OBROBKI } from "@/lib/mdx/schema";
import { artykuly, lekcje, OBROBKA_LABEL, TYP_LABEL } from "@/lib/technologia";
import { Group, ListEdit, Seg, Text, type Src } from "./Panel";

/* Panel „Artykuł”: pola frontmattera artykułu Technologii (schemat: artykulSchema w src/lib/mdx/schema.ts). */

type Data = Record<string, unknown>;
type Pow = { kody: string[]; lekcje: string[]; hasla: string[]; artykuly: string[]; kalkulator: boolean };

/** Lista wybranych (chipy z usuwaniem) + lista rozwijana do dodania. */
function Picker({ label, value, options, onChange, id }: { label: string; value: string[]; options: [string, string][]; onChange: (v: string[]) => void; id?: string }) {
  const name = (k: string) => options.find((o) => o[0] === k)?.[1] ?? k;
  return (
    <div className="ed-field" id={id}>
      <span>{label}</span>
      {value.length > 0 && <div className="ed-chips">{value.map((k) => <button key={k} type="button" title="Usuń" onClick={() => onChange(value.filter((x) => x !== k))}>{name(k)} ×</button>)}</div>}
      <select value="" aria-label={`${label} — dodaj`} onChange={(e) => e.target.value && onChange([...value, e.target.value])}>
        <option value="">Dodaj…</option>
        {options.filter(([k]) => !value.includes(k)).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
      </select>
    </div>
  );
}

export default function ArtykulPanel({ data, onChange }: { data: Data; onChange: (d: Data) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v });
  const s = (k: string) => String(data[k] ?? "");
  const obrobka = (data.obrobka ?? []) as string[];
  const toggleO = (o: string) => set("obrobka", obrobka.includes(o) ? obrobka.filter((x) => x !== o) : OBROBKI.filter((x) => x === o || obrobka.includes(x)));
  const pow = { kody: [], lekcje: [], hasla: [], artykuly: [], kalkulator: false, ...((data.powiazane ?? {}) as Partial<Pow>) } as Pow;
  const setPow = (k: keyof Pow, v: unknown) => set("powiazane", { ...pow, [k]: v });
  const self = `${s("dzial")}/${s("slug")}`;
  return (
    <>
      <Group title="Nagłówek" id="f-head">
        <Text id="f-title" label="Tytuł" value={s("title")} onChange={(v) => set("title", v)} />
        <p className="rys-tip">Adres: <code>/technologia/{s("dzial")}/{s("slug")}</code> — stały (nazwa pliku).</p>
        <Seg label="Szablon" value={s("typ") as (typeof ARTYKUL_TYPY)[number]} options={ARTYKUL_TYPY.map((t) => [t, TYP_LABEL[t]] as [typeof t, string])} onChange={(v) => set("typ", v)} />
        <Seg label="Poziom" value={Number(data.poziom ?? 1)} options={[[1, "Podstawy"], [2, "Średni"], [3, "Zaawansowany"]]} onChange={(v) => set("poziom", v)} />
        <div className="rys-checks" role="group" aria-label="Obróbka">
          {OBROBKI.map((o) => <label key={o}><input type="checkbox" checked={obrobka.includes(o)} onChange={() => toggleO(o)} />{OBROBKA_LABEL[o]}</label>)}
        </div>
      </Group>
      <Group title="Opis" id="f-short">
        <Text label="Jedno zdanie pod tytułem" rows={3} value={s("short")} onChange={(v) => set("short", v)} hint="Widać je też na liście działu i w wyszukiwarce." />
      </Group>
      <Group title="Stan i dostęp">
        <Seg label="Stan" value={s("stan") || "szkic"} options={[["szkic", "Szkic — do weryfikacji"], ["sprawdzony", "Sprawdzony"]]} onChange={(v) => set("stan", v)} />
        <Seg label="Plan" value={s("plan") || "free"} options={[["free", "Dla wszystkich"], ["pro", "Pro"]]} onChange={(v) => set("plan", v)} />
        <p className="rys-tip">Pro: artykuł widzi tylko konto redakcji i plan Pro (znika z list, wyszukiwarki i mapy strony).</p>
        <div className="ed-two">
          <label className="ed-field"><span>Dodano</span><input type="date" value={s("dodano")} onChange={(e) => set("dodano", e.target.value)} /></label>
          <label className="ed-field"><span>Kolejność w dziale</span><input type="number" min={1} step={10} value={Number(data.order ?? 10)} onChange={(e) => set("order", Number(e.target.value))} /></label>
        </div>
      </Group>
      <Group title="Normy">
        <ListEdit items={(data.normy ?? []) as string[]} onChange={(v) => set("normy", v)} make={() => ""} add="Dodaj normę"
          render={(n, upd) => <input className="is-mono" value={n} placeholder="ISO 1832" onChange={(e) => upd(e.target.value)} />} />
      </Group>
      <Group title="Źródła" id="f-sources">
        <p className="rys-tip">Każda wartość liczbowa w treści musi mieć źródło. Nowe źródło dopisuje się do rejestru (src/content/nauka/sources.ts).</p>
        <ListEdit items={(data.sources ?? []) as Src[]} onChange={(v) => set("sources", v)} make={() => ({ id: Object.keys(SOURCES)[0], where: "", loc: "", url: "" })} add="Dodaj źródło"
          render={(x, upd) => (
            <div className="ed-src">
              <select value={x.id} onChange={(e) => upd({ ...x, id: e.target.value })}>{Object.values(SOURCES).map((o) => <option key={o.id} value={o.id}>{o.short}</option>)}</select>
              <input value={x.where} placeholder="Co potwierdza" onChange={(e) => upd({ ...x, where: e.target.value })} />
              <input value={x.loc} placeholder="Rozdział, strona" onChange={(e) => upd({ ...x, loc: e.target.value })} />
              <input value={x.url} placeholder="Link (opcjonalnie)" onChange={(e) => upd({ ...x, url: e.target.value })} />
            </div>
          )} />
      </Group>
      <Group title="Powiązane" id="f-powiazane">
        <Picker label="Karty kodów" value={pow.kody} onChange={(v) => setPow("kody", v)} options={gcodes.map((g) => [g.slug, `${g.code} — ${g.name}`])} />
        <Picker label="Lekcje" value={pow.lekcje} onChange={(v) => setPow("lekcje", v)} options={lekcje.map((l) => [l.id, `${l.id} ${l.title}`])} />
        <Picker label="Hasła słownika" value={pow.hasla} onChange={(v) => setPow("hasla", v)} options={[...glossary].sort((a, b) => a.term.localeCompare(b.term, "pl")).map((g) => [g.anchor, g.term])} />
        <Picker label="Artykuły" value={pow.artykuly} onChange={(v) => setPow("artykuly", v)} options={artykuly.filter((a) => a.key !== self).map((a) => [a.key, a.title])} />
        <div className="rys-checks"><label><input type="checkbox" checked={pow.kalkulator} onChange={(e) => setPow("kalkulator", e.target.checked)} />odnośnik do kalkulatora parametrów skrawania</label></div>
      </Group>
    </>
  );
}
