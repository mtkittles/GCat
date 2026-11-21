"use client";
import Link from "next/link";
import PageHead from "@/components/ui/PageHead";

/* Granica błędów App Routera: zamiast białego ekranu — komunikat i ponowna próba. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid gap-5 max-w-prose py-10">
      <PageHead title="Coś poszło nie tak" count="błąd strony" lead="Strona nie dała się wyświetlić. Spróbuj ponownie — jeśli błąd się powtarza, odśwież stronę albo wróć na stronę główną." />
      {/* Szczegóły także na produkcji — żeby dało się diagnozować z telefonu. */}
      <div className="grid gap-1 text-sm text-muted font-mono break-words" role="note">
        <p>Komunikat: {error.message || "(brak komunikatu)"}</p>
        {error.digest && <p>Kod zdarzenia: {error.digest}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn" onClick={() => reset()}>Spróbuj ponownie</button>
        <Link href="/" className="btn ghost">Strona główna</Link>
      </div>
    </div>
  );
}
