import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { USER_TABLES, adminClient, deleteAccount } from "@/lib/deleteAccount";

/* Atrapa klienta admina Supabase: zapisuje, co i dla kogo usunięto. */
function fakeAdmin(opts: { user?: { id: string } | null; failTable?: string; failAuthDelete?: boolean } = {}) {
  const deleted: { table: string; col: string; val: string }[] = [];
  const deleteUser = vi.fn(async () => ({ error: opts.failAuthDelete ? { message: "auth down" } : null }));
  const admin = {
    auth: {
      getUser: vi.fn(async (token: string) => token === "good" && opts.user !== null
        ? { data: { user: opts.user ?? { id: "u1" } }, error: null }
        : { data: { user: null }, error: { message: "invalid JWT" } }),
      admin: { deleteUser },
    },
    from: (table: string) => ({
      delete: () => ({
        eq: async (col: string, val: string) => {
          if (table === opts.failTable) return { error: { message: "permission denied" } };
          deleted.push({ table, col, val }); return { error: null };
        },
      }),
    }),
  } as unknown as SupabaseClient;
  return { admin, deleted, deleteUser };
}

describe("usuwanie konta (route handler)", () => {
  it("bez klucza service_role zwraca 501 z czytelnym komunikatem, nie rzuca", async () => {
    const r = await deleteAccount("Bearer good", null);
    expect(r.status).toBe(501);
    expect(r.body.message).toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("adminClient() zwraca null, gdy brak zmiennej z kluczem", () => {
    const prev = process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(adminClient()).toBeNull();
    if (prev !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = prev;
  });

  it("bez nagłówka Authorization → 401, nic nie usunięte", async () => {
    const { admin, deleted, deleteUser } = fakeAdmin();
    expect((await deleteAccount(null, admin)).status).toBe(401);
    expect(deleted).toEqual([]); expect(deleteUser).not.toHaveBeenCalled();
  });

  it("nieprawidłowy token → 401, nic nie usunięte", async () => {
    const { admin, deleted, deleteUser } = fakeAdmin();
    expect((await deleteAccount("Bearer zly", admin)).status).toBe(401);
    expect(deleted).toEqual([]); expect(deleteUser).not.toHaveBeenCalled();
  });

  it("poprawny token: usuwa dane TYLKO wołającego ze wszystkich tabel, profil i konto auth", async () => {
    const { admin, deleted, deleteUser } = fakeAdmin({ user: { id: "u-me" } });
    const r = await deleteAccount("Bearer good", admin);
    expect(r).toEqual({ status: 200, body: { ok: true, message: "Konto i dane zostały usunięte." } });
    expect(deleted).toEqual([
      ...USER_TABLES.map((table) => ({ table, col: "user_id", val: "u-me" })),
      { table: "profiles", col: "id", val: "u-me" },
    ]);
    expect(deleteUser).toHaveBeenCalledWith("u-me");
  });

  it("błąd usuwania danych → 500 i konto auth NIE jest usuwane", async () => {
    const { admin, deleteUser } = fakeAdmin({ failTable: "programs" });
    const r = await deleteAccount("Bearer good", admin);
    expect(r.status).toBe(500);
    expect(r.body.message).toContain("programs");
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("błąd usuwania konta auth → 500 z komunikatem", async () => {
    const { admin } = fakeAdmin({ failAuthDelete: true });
    const r = await deleteAccount("Bearer good", admin);
    expect(r.status).toBe(500);
    expect(r.body.message).toContain("auth down");
  });
});
