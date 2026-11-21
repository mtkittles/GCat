"use client";
import { useAccount } from "@/lib/auth";
import { useAdmin } from "@/lib/edytor/admin";
import { can } from "@/lib/entitlements";

/** Czy ta przeglądarka widzi artykuły `plan: pro`: konto redakcji zawsze, konto z planem Pro — tak, reszta — nie. */
export function useProAccess(): boolean {
  const admin = useAdmin();
  const acc = useAccount();
  return can(acc.profile?.plan ?? "free", "proContent", { admin: admin === "yes" });
}
