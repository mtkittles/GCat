"use client";
import { useEffect } from "react";

/* Odsłanianie sekcji strony głównej przy przewijaniu (jednorazowe). Działa w każdej przeglądarce —
   wcześniejsza wersja w czystym CSS (animation-timeline) nie działała w Firefoksie. Bez JS i przy
   „ogranicz ruch” treść jest po prostu widoczna: stan ukryty włącza dopiero klasa .fx-on. */
export default function HomeFx() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".home");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => {
      for (const e of es) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    root.querySelectorAll("[data-fx]").forEach((el) => io.observe(el));
    root.classList.add("fx-on");
    return () => { io.disconnect(); root.classList.remove("fx-on"); };
  }, []);
  return null;
}
