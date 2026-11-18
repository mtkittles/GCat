"use client";
import { useEffect, useRef } from "react";

/*
  Tekst „dekodujący się” (B2) — jak wyświetlacz sterowania przy starcie: przez ~0,35 s znaki przewijają się,
  a potem od lewej stają na swoich miejscach. Tylko przy pojawieniu się na ekranie (i przy zmianie tekstu),
  wyłączone przy „ogranicz ruch”. Do czcionki o stałej szerokości (kody, odczyty) — szerokość się nie zmienia.
  Czytnik ekranu dostaje gotowy tekst (warstwa animowana jest aria-hidden).
*/
const POOL = "0123456789GMXYZ";

export default function Decode({ text, className, ms = 360 }: { text: string; className?: string; ms?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = text;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const run = () => {
      const t0 = performance.now();
      const step = (now: number) => {
        const p = (now - t0) / ms;
        if (p >= 1) { el.textContent = text; return; }
        const fixed = Math.floor(p * p * text.length);
        let out = "";
        for (let i = 0; i < text.length; i++) {
          const c = text[i];
          out += i < fixed || c === " " || c === "\n" ? c : POOL[(Math.random() * POOL.length) | 0];
        }
        el.textContent = out;
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(([en]) => { if (en?.isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); el.textContent = text; };
  }, [text, ms]);
  return (
    <span className={className}>
      <span ref={ref} aria-hidden>{text}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}
