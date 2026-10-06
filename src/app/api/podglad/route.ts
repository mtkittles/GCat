import { NextResponse } from "next/server";

/*
  „Podgląd” z panelu Keystatic (previewUrl): /api/podglad?branch={branch}&to=/kody/{slug}
  → podgląd Vercela tej gałęzi na danej stronie. Vercel tworzy adres gałęzi jako
  gcat-git-<gałąź: małe litery, inne znaki → „-”>-mtkittles-projects.vercel.app (np. tresci/g01 → tresci-g01).
  Gałąź główna / tryb lokalny → ta sama strona na bieżącym adresie.
  Adres dłuższy niż 63 znaki Vercel skraca z dopiskiem hasha — wtedy lista PR tej gałęzi (link podglądu w komentarzu Vercela).
*/

const PROJECT = "gcat", SCOPE = "mtkittles-projects", REPO = "mtkittles/GCat";

export function vercelBranchHost(branch: string): string | null {
  const slug = branch.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const label = `${PROJECT}-git-${slug}-${SCOPE}`;
  return label.length <= 63 ? `${label}.vercel.app` : null;
}

export function GET(req: Request) {
  const url = new URL(req.url);
  const branch = url.searchParams.get("branch") ?? "";
  const to = url.searchParams.get("to") ?? "/";
  if (!to.startsWith("/") || to.startsWith("//")) return new NextResponse("Nieprawidłowa ścieżka", { status: 400 });
  if (!branch || branch === "main") return NextResponse.redirect(new URL(to, url.origin));
  const host = vercelBranchHost(branch);
  if (!host) return NextResponse.redirect(`https://github.com/${REPO}/pulls?q=${encodeURIComponent(`is:pr head:${branch}`)}`);
  return NextResponse.redirect(`https://${host}${to}`);
}
