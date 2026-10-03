import type { Metadata } from "next";
import Flashcards from "./Flashcards";

export const metadata: Metadata = { title: "Fiszki — GCat", description: "Karty kodów G/M i hasła słownika jako fiszki z powtórkami metodą Leitnera." };

export default function FiszkiPage() { return <Flashcards />; }
