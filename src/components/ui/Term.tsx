"use client";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { glossary } from "@/lib/content";
import { gcodes } from "@/lib/gcodes";

/*
  Pojęcie z podpowiedzią. Kliknięcie odsłania krótkie wyjaśnienie
  bez opuszczania artykułu, a odnośnik prowadzi do pełnego hasła
  w słowniku albo do karty kodu.
*/

interface Found { title: string; text: string; href: string; kind: "pojęcie" | "kod" }

function lookup(key: string): Found | null {
  const k = key.trim().toLowerCase();

  const code = gcodes.find((g) =>
    g.code.toLowerCase() === k ||
    g.code.toLowerCase().split(/[\s/]+/).includes(k) ||
    g.slug === k.replace(/\s+/g, "-"));
  if (code) return { title: `${code.code} — ${code.name}`, text: code.short, href: `/kody/${code.slug}`, kind: "kod" };

  const term = glossary.find((g) =>
    g.term.toLowerCase() === k ||
    g.term.toLowerCase().startsWith(k + " ") ||
    g.aliases.some((a) => a.toLowerCase() === k));
  if (term) {
    const slug = term.term.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-");
    return { title: term.term, text: term.def, href: `/slownik#${slug}`, kind: "pojęcie" };
  }
  return null;
}

export default function Term({ k, children }: { k: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
  const id = useId();
  const found = lookup(k);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);

  if (!found) return <>{children}</>;

  return (
    <span className="term-wrap" ref={box}>
      <button type="button" className="term" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
        {children}
      </button>
      {open && (
        <span className="term-pop" id={id} role="tooltip">
          <span className="term-kind">{found.kind}</span>
          <strong>{found.title}</strong>
          <span className="term-def">{found.text}</span>
          <Link href={found.href} className="term-link" onClick={() => setOpen(false)}>
            {found.kind === "kod" ? "Otwórz kartę kodu" : "Otwórz w słowniku"} ›
          </Link>
        </span>
      )}
    </span>
  );
}
