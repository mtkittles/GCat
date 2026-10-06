"use client";
import { makePage } from "@keystatic/next/ui/app";
import config from "../../../keystatic.config";

/** Panel Keystatic (edycja kart i słownika). Lokalnie zapis na dysk, na produkcji przez GitHub (logowanie GitHub). */
const KeystaticApp = makePage(config);

/** Panel na całym ekranie, nad nagłówkiem i stopką strony. */
export default function Panel() {
  return <div style={{ position: "fixed", inset: 0, zIndex: 1000, overflow: "auto", background: "#fff" }}><KeystaticApp /></div>;
}
