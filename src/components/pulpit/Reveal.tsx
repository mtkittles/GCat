"use client";
import { useEffect } from "react";

/*
  Pulpit (V3.1): sekcje poza widokiem są przyciemnione, nie ukryte — strona nie ma pustych dziur przy przewijaniu,
  a sekcja rozjaśnia się, gdy do niej dojdziesz. Jeden wzór na całą stronę; „ogranicz ruch” — bez przejścia (CSS).
  Bez JS (albo przed hydratacją) wszystko jest w pełni widoczne: przyciemnia dopiero klasa .rv-on na kontenerze,
  dodana przy pierwszym przewinięciu. Przyciemnione są tylko sekcje całkiem poza ekranem — tekst w widoku ma pełny kontrast.
*/
export default function Reveal({ root = ".pv3" }: { root?: string }) {
  useEffect(() => {
    const box = document.querySelector(root);
    if (!box || typeof IntersectionObserver === "undefined") return;
    const els = [...box.querySelectorAll<HTMLElement>("[data-rv]")];
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("in", e.isIntersecting)), { rootMargin: "0px", threshold: 0 });
    els.forEach((el) => io.observe(el));
    const on = () => box.classList.add("rv-on");
    window.addEventListener("scroll", on, { once: true, passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", on); box.classList.remove("rv-on"); };
  }, [root]);
  return null;
}
