import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
  Usuwanie konta — tylko po stronie serwera (moduł importuje wyłącznie route handler). Wymaga klucza service_role (SUPABASE_SERVICE_ROLE_KEY,
  bez prefiksu NEXT_PUBLIC_, więc nigdy nie trafia do przeglądarki).
  Kolejność: weryfikacja tokenu wołającego → usunięcie wierszy użytkownika → usunięcie konta auth.
  (Tabele mają też ON DELETE CASCADE do auth.users — jawne usunięcie jest dla pewności i czytelności.)
*/
export const USER_TABLES = ["lesson_progress", "exercise_results", "programs"] as const;

export type DeleteResult = { status: number; body: { ok: boolean; message: string } };

export function adminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const fail = (status: number, message: string): DeleteResult => ({ status, body: { ok: false, message } });

/** Czysta logika (testowalna): klient admina wstrzykiwany z zewnątrz. */
export async function deleteAccount(authHeader: string | null, admin: SupabaseClient | null): Promise<DeleteResult> {
  if (!admin) return fail(501, "Usuwanie konta nie jest jeszcze skonfigurowane na serwerze (brak SUPABASE_SERVICE_ROLE_KEY). Napisz do administratora — usuniemy konto ręcznie.");
  const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return fail(401, "Brak sesji. Zaloguj się ponownie.");
  try {
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data?.user) return fail(401, "Sesja wygasła lub jest nieprawidłowa. Zaloguj się ponownie.");
    const id = data.user.id;
    for (const t of USER_TABLES) {
      const { error: e } = await admin.from(t).delete().eq("user_id", id);
      if (e) return fail(500, `Nie udało się usunąć danych (${t}): ${e.message}`);
    }
    const { error: pe } = await admin.from("profiles").delete().eq("id", id);
    if (pe) return fail(500, `Nie udało się usunąć profilu: ${pe.message}`);
    const { error: ue } = await admin.auth.admin.deleteUser(id);
    if (ue) return fail(500, `Dane usunięte, ale nie udało się usunąć konta logowania: ${ue.message}`);
    return { status: 200, body: { ok: true, message: "Konto i dane zostały usunięte." } };
  } catch (e) {
    return fail(500, `Błąd serwera: ${e instanceof Error ? e.message : String(e)}`);
  }
}
