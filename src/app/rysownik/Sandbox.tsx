"use client";
import dynamic from "next/dynamic";

/* Szkic trzymany w przeglądarce — edytor ładuje się tylko po stronie klienta. */
const Workbench = dynamic(() => import("./Workbench"), { ssr: false, loading: () => <div className="rys-shell skel" aria-busy="true" aria-label="Wczytywanie rysownika" /> });

export default function Sandbox() {
  return <Workbench />;
}
