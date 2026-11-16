"use client";
import { makePage } from "@keystatic/next/ui/app";
import config from "../../../keystatic.config";

/** Panel Keystatic (edycja kart i słownika). Lokalnie zapis na dysk, na produkcji przez GitHub (logowanie GitHub). */
const KeystaticApp = makePage(config);

/**
  Panel na całym ekranie. Bez z-index: okna, menu i powiadomienia Keystatic trafiają na koniec <body>
  z z-index 2 — przy z-index 1000 na panelu leżały pod nim (niewidoczne okno „Utwórz gałąź” po Zapisz
  blokowało cały panel, lista gałęzi się nie rozwijała). Nagłówek i stopkę strony chowa CSS (.ks-panel).
*/
export default function Panel() {
  return <div className="ks-panel"><KeystaticApp /></div>;
}
