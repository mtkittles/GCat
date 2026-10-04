import { beforeEach, describe, expect, it, vi } from "vitest";

/*
  Regresja: zalogowany /konto pokazywał „Coś poszło nie tak”.
  Przyczyna: getSyncStatus() zwracał za każdym wywołaniem NOWY obiekt, a Session używał go jako
  getSnapshot w useSyncExternalStore. React porównuje kolejne snapshoty przez Object.is, więc widział
  zmianę przy każdym odczycie i rzucał „The result of getSnapshot should be cached to avoid an infinite loop”.
  Błąd występował tylko po zalogowaniu, bo tylko wtedy renderuje się Session.
*/
vi.mock("@/lib/supabase", () => ({ ACCOUNT_ENABLED: true, getSupabase: vi.fn() }));

import { getSupabase } from "@/lib/supabase";
import { SYNC_OFF, getSyncStatus, progressFromRows, startSync, stopSync, subscribeSync } from "@/lib/sync";
import { getAccountState, signOut, subscribeAccount } from "@/lib/auth";

type Result = { data?: unknown; error?: { message: string } | null };
/** Łańcuch zapytania Supabase: select/eq/upsert/update, a samo `await` zwraca wynik. */
const query = (result: Result): Record<string, unknown> => {
  const q: Record<string, unknown> = {
    select: () => q, eq: () => q, update: () => q,
    maybeSingle: async () => result,
    upsert: async () => result,
    then: (res: (v: Result) => unknown, rej: (e: unknown) => unknown) => Promise.resolve(result).then(res, rej),
  };
  return q;
};
const useClient = (client: unknown) => vi.mocked(getSupabase).mockReturnValue(Promise.resolve(client) as never);
const ok: Result = { data: [], error: null };

beforeEach(() => { stopSync(); vi.mocked(getSupabase).mockReset(); });

describe("snapshot synchronizacji (przyczyna błędu na /konto)", () => {
  it("getSyncStatus() zwraca ten sam obiekt przy kolejnych odczytach", () => {
    // Dokładnie to sprawdza React: Object.is(getSnapshot(), getSnapshot()) musi być true.
    expect(Object.is(getSyncStatus(), getSyncStatus())).toBe(true);
  });

  it("jest stabilny także w stanie błędu i zmienia się dopiero po zmianie statusu", async () => {
    useClient({ from: () => query({ error: { message: "permission denied for table programs" } }) });
    const before = getSyncStatus();
    await startSync("u-stable");
    const after = getSyncStatus();
    expect(after).not.toBe(before);
    expect(after).toEqual({ status: "error", error: "permission denied for table programs" });
    expect(Object.is(getSyncStatus(), getSyncStatus())).toBe(true);
  });

  it("stan „wyłączona” to stała, więc render serwerowy i klientowy się zgadzają", () => {
    stopSync();
    expect(getSyncStatus()).toBe(SYNC_OFF);
  });

  it("powiadamia subskrybentów o zmianie", async () => {
    useClient({ from: () => query(ok) });
    const cb = vi.fn(); const off = subscribeSync(cb);
    await startSync("u-notify");
    off();
    expect(cb).toHaveBeenCalled();
    expect(getSyncStatus().status).toBe("ok");
  });
});

describe("synchronizacja nie rzuca wyjątków", () => {
  it("błąd odpowiedzi trafia do statusu", async () => {
    useClient({ from: () => query({ error: { message: "JWT expired" } }) });
    await expect(startSync("u1")).resolves.toBeUndefined();
    expect(getSyncStatus()).toEqual({ status: "error", error: "JWT expired" });
  });

  it("wyjątek z klienta (np. from() rzuca) trafia do statusu", async () => {
    useClient({ from: () => { throw new TypeError("Cannot read properties of undefined"); } });
    await expect(startSync("u2")).resolves.toBeUndefined();
    expect(getSyncStatus()).toEqual({ status: "error", error: "Cannot read properties of undefined" });
  });

  it("nieudane ładowanie klienta (getSupabase odrzuca) trafia do statusu", async () => {
    vi.mocked(getSupabase).mockImplementation(() => Promise.reject(new Error("Failed to fetch dynamically imported module")) as never);
    await expect(startSync("u3")).resolves.toBeUndefined();
    expect(getSyncStatus().status).toBe("error");
    expect(getSyncStatus().error).toContain("Failed to fetch");
  });

  it("wylogowanie w trakcie pobierania nie zostawia błędu ani odbiorców", async () => {
    let release!: (r: Result) => void;
    const slow = new Promise<Result>((r) => { release = r; });
    useClient({ from: () => ({ select: () => ({ eq: () => ({ eq: () => slow, then: (a: (v: Result) => unknown) => slow.then(a) }) }) }) });
    const p = startSync("u4");
    stopSync();
    release(ok);
    await p;
    expect(getSyncStatus()).toBe(SYNC_OFF);
  });
});

describe("kształt danych z bazy (migracja 0001)", () => {
  it("bigint przychodzi jako liczba, null w kolumnach quiz_* jest pomijany", () => {
    const out = progressFromRows([
      { key: "frezowanie/F1.1", visited: 1760000000000, read: true, quiz_score: 4, quiz_total: 5, quiz_at: 1760000100000 },
      { key: "toczenie/T1.1", visited: null, read: false, quiz_score: null, quiz_total: null, quiz_at: null },
    ]);
    expect(out["frezowanie/F1.1"]).toEqual({ visited: 1760000000000, read: true, quiz: { score: 4, total: 5, at: 1760000100000 } });
    expect(out["toczenie/T1.1"]).toEqual({});
  });
});

describe("konto: błędy Supabase nie wywalają widoku", () => {
  it("błąd odczytu profilu ląduje w state.error, a konto zostaje zalogowane jako Free", async () => {
    const session = { user: { id: "u-profile", email: "a@b.pl" } };
    useClient({
      auth: { onAuthStateChange: vi.fn(), getSession: async () => ({ data: { session }, error: null }) },
      from: () => query({ error: { message: "permission denied for table profiles" } }),
    });
    const off = subscribeAccount(() => {});
    await vi.waitFor(() => expect(getAccountState().error).toContain("Nie udało się pobrać profilu: permission denied for table profiles"));
    expect(getAccountState().user?.id).toBe("u-profile");
    expect(getAccountState().profile).toBeNull(); // plan → Free po stronie UI
    off();
  });

  it("wylogowanie: błąd sieci → próba lokalna, stan wyczyszczony, komunikat zwrócony", async () => {
    const signOutFn = vi.fn()
      .mockResolvedValueOnce({ error: { message: "Failed to fetch" } })
      .mockResolvedValueOnce({ error: null });
    useClient({ auth: { signOut: signOutFn } });
    const note = await signOut();
    expect(note).toBe("Failed to fetch");
    expect(signOutFn).toHaveBeenLastCalledWith({ scope: "local" });
    expect(getAccountState()).toMatchObject({ user: null, profile: null, ready: true, error: null });
  });

  it("wylogowanie działa nawet gdy klient się nie załadował", async () => {
    vi.mocked(getSupabase).mockImplementation(() => Promise.reject(new Error("chunk load failed")) as never);
    await expect(signOut()).resolves.toBe("chunk load failed");
    expect(getAccountState().user).toBeNull();
  });
});
