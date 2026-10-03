"use client";
import Link from "next/link";

/* Granica błędów App Routera: zamiast białego ekranu — komunikat i ponowna próba. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid gap-5 max-w-prose py-10">
      <p className="hero-kicker">Błąd strony</p>
      <h1 className="text-3xl font-bold">Coś poszło nie tak</h1>
      <p className="text-muted">Strona nie dała się wyświetlić. Spróbuj ponownie — jeśli błąd się powtarza, odśwież stronę albo wróć na stronę główną.</p>
      {error.digest && <p className="text-sm text-muted font-mono">Kod zdarzenia: {error.digest}</p>}
      <div className="flex flex-wrap gap-2">
        <button className="btn" onClick={() => reset()}>Spróbuj ponownie</button>
        <Link href="/" className="btn ghost">Strona główna</Link>
      </div>
    </div>
  );
}
