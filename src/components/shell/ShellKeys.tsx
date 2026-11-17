"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, User, Volume2, VolumeX } from "lucide-react";
import StatusLed from "@/components/tactile/StatusLed";
import Tip, { TipProvider } from "./Tip";
import { setSoundOn, setTheme, useSoundOn, useTheme } from "@/lib/ui/prefs";
import { useTactileFeedback } from "@/lib/ui/useTactileFeedback";

/* Klawisze pulpitu w stopce panelu: motyw, dźwięk pulpitu, konto. Każdy z diodą stanu. */
export default function ShellKeys({ tipSide = "top", labels }: { tipSide?: "top" | "right"; labels?: boolean }) {
  const theme = useTheme();
  const sound = useSoundOn();
  const feedback = useTactileFeedback();
  const path = usePathname();
  const acct = path === "/konto" || path.startsWith("/konto/");
  const dark = theme === "dark";

  return (
    <TipProvider>
    <div className={`keys${labels ? " has-labels" : ""}`}>
      <Tip side={tipSide} label={dark ? "Jasny motyw" : "Ciemny motyw"}>
        <button type="button" className="key" aria-label={dark ? "Włącz jasny motyw" : "Włącz ciemny motyw"}
          onClick={() => { feedback(); setTheme(dark ? "light" : "dark"); }}>
          {dark ? <Moon aria-hidden /> : <Sun aria-hidden />}
          {labels && <span>{dark ? "Ciemny" : "Jasny"}</span>}
        </button>
      </Tip>
      <Tip side={tipSide} label={sound ? "Dźwięk pulpitu: wł." : "Dźwięk pulpitu: wył."}>
        <button type="button" className="key" role="switch" aria-checked={sound} aria-label="Dźwięk pulpitu"
          onClick={() => { setSoundOn(!sound); if (!sound) requestAnimationFrame(() => feedback()); }}>
          {sound ? <Volume2 aria-hidden /> : <VolumeX aria-hidden />}
          {labels && <span>Dźwięk</span>}
          <StatusLed state={sound ? "on" : "idle"} pulse={false} className="key-led" />
        </button>
      </Tip>
      <Tip side={tipSide} label="Konto">
        <Link href="/konto" className="key" aria-label="Konto" aria-current={acct ? "page" : undefined}>
          <User aria-hidden />
          {labels && <span>Konto</span>}
        </Link>
      </Tip>
    </div>
    </TipProvider>
  );
}
