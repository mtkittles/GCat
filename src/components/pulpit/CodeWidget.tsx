"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import SpotlightCard from "@/components/tactile/SpotlightCard";
import StatusLed from "@/components/tactile/StatusLed";
import TactileSegmentedControl from "@/components/tactile/TactileSegmentedControl";
import GcodeLine from "./gcodeTokens";

/* Podgląd kart kodów: cztery klawisze kodów i przełącznik języka sterowania; treść z content/kody/*.mdx. */
export type CodeCard = { key: string; slug: string; code: string; name: string; short: string; modal: boolean; fanuc: string; sinumerik: string };

export default function CodeWidget({ cards, total }: { cards: CodeCard[]; total: number }) {
  const [key, setKey] = useState(cards[0].key);
  const [dialect, setDialect] = useState<"fanuc" | "sinumerik">("fanuc");
  const c = cards.find((x) => x.key === key) ?? cards[0];
  const syntax = (dialect === "fanuc" ? c.fanuc : c.sinumerik).split("\n");

  return (
    <SpotlightCard as="article" className="bw bw-codes" aria-labelledby="bw-codes-t">
      <header className="bw-head">
        <h3 id="bw-codes-t" className="bw-title">Katalog kodów G i M</h3>
        <Link href="/kody" className="bw-link">{total} kart <ArrowRight aria-hidden /></Link>
      </header>
      <div className="bw-ctl">
        <TactileSegmentedControl label="Kod" size="sm" value={key} onChange={setKey} options={cards.map((x) => ({ value: x.key, label: <span className="font-mono">{x.key}</span>, led: false }))} />
        <TactileSegmentedControl label="Język sterowania" size="sm" value={dialect} onChange={setDialect}
          options={[{ value: "fanuc", label: "Fanuc", led: false }, { value: "sinumerik", label: "Sinumerik", led: false }]} />
      </div>
      <div className="bw-code">
        <div className="bw-code-top">
          <code className="bw-big">{c.code}</code>
          <span className="bw-modal"><StatusLed state={c.modal ? "ready" : "idle"} pulse={false} />{c.modal ? "Modalny" : "Niemodalny"}</span>
        </div>
        <p className="bw-name">{c.name}</p>
        <p className="bw-short">{c.short}</p>
        <pre className="bw-syn" aria-label={`Składnia ${dialect === "fanuc" ? "Fanuc" : "Sinumerik"}`}>{syntax.map((l, i) => <code key={i}><GcodeLine raw={l} /></code>)}</pre>
        <Link href={`/kody/${c.slug}`} className="bw-more">Karta {c.code} <ArrowRight aria-hidden /></Link>
      </div>
    </SpotlightCard>
  );
}
