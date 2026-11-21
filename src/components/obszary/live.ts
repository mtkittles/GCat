"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import { useMedia } from "@/lib/ui/prefs";

/*
  „Żywe” podglądy kart: ruch tylko gdy karta jest w widoku i strona widoczna, nigdy przy „ogranicz ruch”.
  CSS animuje elementy pod [data-live] (obszary.css), liczniki w JS dostają `live` z tego hooka.
*/
export function useLive<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const reduce = useMedia("(prefers-reduced-motion: reduce)");
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "40px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView && !reduce];
}

/** Licznik kroków co `ms`, tylko gdy `live`; zatrzymany zostaje na ostatnim kroku. */
export function useTicker(live: boolean, ms: number, n: number) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => { if (!document.hidden) setI((x) => (x + 1) % n); }, ms);
    return () => clearInterval(t);
  }, [live, ms, n]);
  return i;
}
