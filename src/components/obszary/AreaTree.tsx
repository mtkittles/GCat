"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import StatusLed from "@/components/tactile/StatusLed";
import { isOn, onTrail, type TreeNode } from "@/lib/obszary";
import { NODE_ICO } from "./icons";

/*
  Drzewo obszaru (panel boczny i arkusz „Więcej” na telefonie). Gałąź na ścieżce do bieżącej strony
  jest rozwinięta; pozostałe rozwija przycisk ze strzałką (stan tylko w tym widoku). Dzieci mają linię
  prowadzącą jak drzewo w CAD. Pozycje bez adresu (zapowiedź działu) są wyszarzone.
*/
export default function AreaTree({ nodes, path, onGo, label }: { nodes: TreeNode[]; path: string; onGo?: () => void; label: string }) {
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  return (
    <ul className="at" aria-label={label}>
      {nodes.map((n) => {
        const key = n.href ?? n.label;
        const kids = n.children?.length ? n.children : null;
        const open = !!kids && (n.open || (toggled[key] ?? onTrail(path, n)));
        const Ico = n.icon ? NODE_ICO[n.icon] : null;
        // gałąź z otwartą stroną-dzieckiem: zaznaczony jest liść, rodzic tylko jaśniejszy (na ścieżce)
        const childOn = !!kids && kids.some((c) => isOn(path, c));
        const on = isOn(path, n) && !childOn;
        return (
          <li key={key} className="at-li">
            <div className="at-row">
              {n.href ? (
                <Link href={n.href} className={`at-item${childOn ? " is-trail" : ""}`} aria-current={on ? "page" : undefined} onClick={onGo} title={n.label}>
                  {Ico ? <Ico className="at-ico" /> : <span className="at-dot" aria-hidden />}
                  <span className="at-txt">{n.label}</span>
                  {on ? <StatusLed state="on" pulse={false} className="at-led" /> : n.n ? <span className="at-n">{n.n}</span> : null}
                </Link>
              ) : (
                <span className="at-item is-soon" aria-disabled="true">
                  <span className="at-dot" aria-hidden />
                  <span className="at-txt">{n.label}</span>
                </span>
              )}
              {kids && !n.open && (
                <button type="button" className="at-tog" aria-expanded={open} aria-label={`${open ? "Zwiń" : "Rozwiń"}: ${n.label}`}
                  onClick={() => setToggled((t) => ({ ...t, [key]: !open }))}>
                  <ChevronRight aria-hidden />
                </button>
              )}
            </div>
            {kids && open && (
              <ul className="at-sub">
                {kids.map((c) => {
                  const con = isOn(path, c);
                  return (
                    <li key={c.href ?? c.label}>
                      {c.href ? (
                        <Link href={c.href} className="at-item at-leaf" aria-current={con ? "page" : undefined} onClick={onGo} title={c.label}>
                          <span className="at-txt">{c.label}</span>
                          {con && <StatusLed state="on" pulse={false} className="at-led" />}
                        </Link>
                      ) : (
                        <span className="at-item at-leaf is-soon" aria-disabled="true"><span className="at-txt">{c.label}</span></span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
