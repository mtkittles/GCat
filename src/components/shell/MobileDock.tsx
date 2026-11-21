"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Drawer } from "vaul";
import { ChevronRight, Ellipsis } from "lucide-react";
import StatusLed from "@/components/tactile/StatusLed";
import ShellKeys from "./ShellKeys";
import { DOCK, MORE, isActive } from "./nav";
import { useTactileFeedback } from "@/lib/ui/useTactileFeedback";

/*
  Telefon (< 768 px): pływający dok z czterema działami i „Więcej”. „Więcej” otwiera dolny arkusz Vaul
  (zamykany przeciągnięciem w dół) z pozostałymi działami, motywem, dźwiękiem pulpitu i kontem.
  Klasa bottom-nav zostaje — symulator na telefonie chowa po niej dok (ma własny pasek sekcji).
  Przewijanie w dół chowa dok (więcej miejsca na treść), przewinięcie w górę, góra i koniec strony go pokazują.
*/

/** Dok schowany przy przewijaniu w dół; widoczny po przewinięciu w górę, na górze i na końcu strony. */
function useHideOnScroll() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY, acc = 0, raf = 0;
    const tick = () => {
      raf = 0;
      const y = window.scrollY, dy = y - last; last = y;
      const atEnd = y + window.innerHeight >= document.documentElement.scrollHeight - 24;
      if (y < 64 || atEnd) { acc = 0; setHidden(false); return; }
      // próg kilku pikseli: drganie palca i odbicie Safari nie przełączają doku
      acc = Math.sign(dy) === Math.sign(acc) ? acc + dy : dy;
      if (acc > 12) setHidden(true);
      else if (acc < -8) setHidden(false);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return [hidden, setHidden] as const;
}
export default function MobileDock() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const feedback = useTactileFeedback();
  const moreOn = MORE.some((m) => isActive(path, m.href)) || isActive(path, "/konto");

  const [hidden, setHidden] = useHideOnScroll();
  const [prev, setPrev] = useState(path);
  if (prev !== path) { setPrev(path); if (open) setOpen(false); if (hidden) setHidden(false); }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <nav className="bottom-nav dock" data-hidden={hidden && !open ? "" : undefined} aria-label="Nawigacja mobilna"
        onFocusCapture={() => setHidden(false)}>
        {DOCK.map((t) => {
          const on = isActive(path, t.href);
          const Icon = t.icon;
          return (
            <Link key={t.href} href={t.href} aria-current={on ? "page" : undefined} className="dock-key" onClick={() => feedback(0.7)}>
              <Icon aria-hidden />
              <span>{t.short ?? t.label}</span>
              {on && <StatusLed state="on" pulse={false} className="dock-led" />}
            </Link>
          );
        })}
        <Drawer.Trigger className={`dock-key${moreOn || open ? " is-active" : ""}`} onClick={() => feedback(0.7)}>
          <Ellipsis aria-hidden />
          <span>Więcej</span>
          {moreOn && <StatusLed state="on" pulse={false} className="dock-led" />}
        </Drawer.Trigger>
      </nav>

      <Drawer.Portal>
        <Drawer.Overlay className="vd-overlay" />
        <Drawer.Content className="vd vd-bottom" aria-describedby={undefined}>
          <div className="vd-handle" aria-hidden />
          <Drawer.Title className="vd-title">Więcej</Drawer.Title>
          <ul className="more-list">
            {MORE.map((m) => {
              const on = isActive(path, m.href);
              const Icon = m.icon;
              return (
                <li key={m.href}>
                  <Link href={m.href} aria-current={on ? "page" : undefined} onClick={() => setOpen(false)}>
                    <Icon aria-hidden />
                    <span>{m.label}</span>
                    {on ? <StatusLed state="on" pulse={false} /> : <ChevronRight aria-hidden className="more-chev" />}
                  </Link>
                </li>
              );
            })}
          </ul>
          <ShellKeys labels />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
