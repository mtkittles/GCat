import type { Metadata } from "next";
import Flashcards from "./Flashcards";

export const metadata: Metadata = { title: "Fiszki — GCat", description: "Hasła słownika, wzory i kody G/M jako fiszki z powtórkami metodą Leitnera." };

export default function FiszkiPage() { return <Flashcards />; }
