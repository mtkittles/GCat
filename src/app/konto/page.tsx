import type { Metadata } from "next";
import Account from "./Account";

export const metadata: Metadata = { title: "Konto — GCat", description: "Postęp nauki, statystyki i zapisane programy na koncie GCat." };

export default function KontoPage() { return <Account />; }
