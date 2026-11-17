"use client";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Rotate3d, Shuffle } from "lucide-react";
import SpotlightCard from "@/components/tactile/SpotlightCard";
import { useTactileFeedback } from "@/lib/ui/useTactileFeedback";

/* Mini-fiszka: kod z przodu, nazwa i opis z karty z tyłu. Obrót kliknięciem, Spacją lub Enterem. */
export type FlashCard = { code: string; name: string; short: string; slug: string };

export default function FlashWidget({ deck, start }: { deck: FlashCard[]; start: number }) {
  const [i, setI] = useState(start);
  const [flip, setFlip] = useState(false);
  const reduce = useReducedMotion();
  const feedback = useTactileFeedback();
  const c = deck[i];
  const turn = () => { feedback(); setFlip((v) => !v); };
  const shuffle = () => {
    feedback();
    let k = i;
    while (deck.length > 1 && k === i) k = Math.floor(Math.random() * deck.length);
    setFlip(false); setI(k);
  };

  return (
    <SpotlightCard as="article" className="bw bw-flash" aria-labelledby="bw-flash-t">
      <header className="bw-head">
        <h3 id="bw-flash-t" className="bw-title">Fiszka</h3>
        <Link href="/fiszki" className="bw-link">Wszystkie talie <ArrowRight aria-hidden /></Link>
      </header>
      <button type="button" className="fc" onClick={turn} aria-pressed={flip} aria-label={flip ? `${c.code}: ${c.name}. Obróć z powrotem` : `Fiszka ${c.code}. Obróć, żeby zobaczyć odpowiedź`}>
        <motion.span className="fc-in" animate={{ rotateY: flip ? 180 : 0 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26 }}>
          <span className="fc-face fc-front">
            <span className="fc-k">Co robi</span>
            <code className="fc-code">{c.code}</code>
            <span className="fc-hint"><Rotate3d aria-hidden /> kliknij, żeby obrócić</span>
          </span>
          <span className="fc-face fc-back">
            <code className="fc-k">{c.code}</code>
            <b>{c.name}</b>
            <span className="fc-short">{c.short}</span>
          </span>
        </motion.span>
      </button>
      <div className="bw-row">
        <button type="button" className="key fc-btn" onClick={shuffle}><Shuffle aria-hidden /> Losuj kod</button>
        <Link href={`/kody/${c.slug}`} className="bw-more">Karta <ArrowRight aria-hidden /></Link>
      </div>
    </SpotlightCard>
  );
}
