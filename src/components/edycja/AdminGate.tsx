"use client";
import Link from "next/link";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { checkAdmin, useAdmin, wasAdmin } from "@/lib/edytor/admin";
import { loginGithub } from "@/lib/edytor/client";

/*
  Narzędzia redakcji (tryb edycji, edytor treści, rysownik) tylko dla właściciela: konto GitHub z prawem zapisu
  do repozytorium. Pozostali widzą prośbę o zalogowanie. Zapis i tak sprawdza GitHub — to jest warstwa widoku.
*/
export default function AdminGate({ children, what }: { children: ReactNode; what: string }) {
  const admin = useAdmin();
  const [busy, setBusy] = useState(false);
  if (admin === "yes") return <>{children}</>;
  if (admin === "unknown") return <p className="edit-gate-wait" role="status">Sprawdzam uprawnienia…</p>;
  return (
    <section className="edit-gate" aria-labelledby="gate-h">
      <h1 id="gate-h">{what}</h1>
      <p>Ta część serwisu jest tylko dla właściciela strony. Zaloguj się kontem GitHub, które ma prawo zapisu do repozytorium serwisu.</p>
      <button type="button" className="btn" disabled={busy} onClick={async () => { setBusy(true); await loginGithub(); await checkAdmin(true); setBusy(false); }}>
        {busy ? "Czekam na logowanie…" : "Zaloguj przez GitHub"}
      </button>
      <p className="edit-fine">Konto na stronie (logowanie Google) służy do zapisywania postępów nauki — nie daje dostępu do edycji.</p>
      <p className="edit-fine"><Link href="/">Wróć na stronę główną</Link></p>
    </section>
  );
}

const noop = () => () => {};
/** Link „Tryb edycji” w stopce — tylko w przeglądarce, w której właściciel był już zalogowany. */
export function AdminFooterLink() {
  const show = useSyncExternalStore(noop, wasAdmin, () => false);
  return show ? <Link href="/edycja" className="text-muted">Tryb edycji</Link> : null;
}
