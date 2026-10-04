import { adminClient, deleteAccount } from "@/lib/deleteAccount";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/* POST /api/konto/usun — usuwa konto wołającego (token sesji w nagłówku Authorization). */
export async function POST(req: Request) {
  const r = await deleteAccount(req.headers.get("authorization"), adminClient());
  return Response.json(r.body, { status: r.status, headers: { "cache-control": "no-store" } });
}
