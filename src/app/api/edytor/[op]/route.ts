import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { exists, GhError, history, publish, readFile, REPO, whoami, type Wersja } from "@/lib/edytor/github";
import { rodzaj, sprawdzArtykul, sprawdzHaslo, sprawdzKarte, sprawdzObraz, sprawdzRysunek, type Problem } from "@/lib/edytor/walidacja";
import { rysunki } from "@/components/rys/registry";

/*
  API edytora treści (/edytor). Tryby jak panel Keystatic:
  • lokalnie (next dev): odczyt i zapis prosto na dysk, historia z `git log` — bez logowania;
  • produkcja: GitHub, token z logowania panelu (ciasteczko keystatic-gh-access-token); zapis = gałąź tresci/…,
    commit, PR i scalenie (reguła na main zostaje zachowana).
  GET  /api/edytor/ja                     — tryb, zalogowany użytkownik, prawo zapisu
  GET  /api/edytor/plik?path=…            — treść pliku i sha (do wykrycia równoległej zmiany)
  GET  /api/edytor/historia?path=…        — wersje pliku (commity)
  GET  /api/edytor/wersja?path=…&sha=…    — treść pliku w danej wersji
  GET  /api/edytor/strona                 — commit, z którego zbudowano działającą stronę (czy publikacja już widać)
  POST /api/edytor/zapisz { files, message, base } — walidacja i zapis
*/

export const dynamic = "force-dynamic";

const LOCAL = process.env.NODE_ENV === "development";
const run = promisify(execFile);
const MAX = 400_000, MAX_B64 = 2_800_000;

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const blobSha = (text: string) => { const b = Buffer.from(text, "utf8"); return createHash("sha1").update(`blob ${b.length}\0`).update(b).digest("hex"); };
const tokenOf = (req: Request) => req.headers.get("cookie")?.match(/(?:^|;\s*)keystatic-gh-access-token=([^;]+)/)?.[1];
const okPath = (p: string | null): p is string => !!p && !p.includes("..") && !!rodzaj(p);
const abs = (p: string) => path.join(process.cwd(), p);

async function gitLog(p: string): Promise<Wersja[]> {
  try {
    const { stdout } = await run("git", ["log", "-n", "40", "--format=%H%x1f%aI%x1f%an%x1f%s", "--", p], { cwd: process.cwd() });
    return stdout.trim().split("\n").filter(Boolean).map((l) => { const [sha, date, author, message] = l.split("\x1f"); return { sha, date, author, message, url: "" }; });
  } catch { return []; }
}

function fail(e: unknown) {
  if (e instanceof GhError) {
    if (e.status === 401) return json({ error: "Sesja GitHub wygasła — zaloguj się ponownie.", login: true }, 401);
    return json({ error: `GitHub: ${e.message}` }, e.status === 403 || e.status === 404 || e.status === 409 || e.status === 422 ? e.status : 502);
  }
  return json({ error: e instanceof Error ? e.message : String(e) }, 500);
}

export async function GET(req: Request, ctx: { params: Promise<{ op: string }> }) {
  const { op } = await ctx.params;
  const url = new URL(req.url);
  const p = url.searchParams.get("path");
  if (op === "strona") return json({ commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null });
  if (op === "ja") {
    if (LOCAL) return json({ mode: "local", canWrite: true, user: { login: "lokalnie", name: "Tryb lokalny (zapis na dysk)" } });
    const token = tokenOf(req);
    // brak tokenu, ale jest ciasteczko odświeżania (8 h minęło) — przeglądarka odświeży przez API panelu i zapyta jeszcze raz
    if (!token) return json({ mode: "github", canWrite: false, user: null, refresh: /(?:^|;\s*)keystatic-gh-refresh-token=/.test(req.headers.get("cookie") ?? "") });
    try { const u = await whoami(token); return json({ mode: "github", canWrite: u.canWrite, user: u }); } catch (e) {
      if (e instanceof GhError && e.status === 401) return json({ mode: "github", canWrite: false, user: null, expired: true });
      return fail(e);
    }
  }
  if (!okPath(p) || rodzaj(p)?.kind === "obraz") return json({ error: "Niedozwolona ścieżka pliku." }, 400);
  if (LOCAL) {
    if (op === "plik") { if (!existsSync(abs(p))) return json({ error: "Nie ma takiego pliku." }, 404); const text = readFileSync(abs(p), "utf8"); return json({ text, sha: blobSha(text) }); }
    if (op === "historia") return json({ versions: await gitLog(p) });
    if (op === "wersja") {
      const sha = url.searchParams.get("sha") ?? "";
      if (!/^[0-9a-f]{7,40}$/.test(sha)) return json({ error: "Zła wersja." }, 400);
      try { const { stdout } = await run("git", ["show", `${sha}:${p}`], { cwd: process.cwd(), maxBuffer: 4 << 20 }); return json({ text: stdout }); } catch { return json({ error: "Nie ma tej wersji pliku." }, 404); }
    }
    return json({ error: "Nieznana operacja." }, 404);
  }
  const token = tokenOf(req);
  if (!token) return json({ error: "Zaloguj się przez GitHub.", login: true }, 401);
  try {
    if (op === "plik") { const f = await readFile(token, p); return f ? json(f) : json({ error: "Nie ma takiego pliku." }, 404); }
    if (op === "historia") return json({ versions: await history(token, p) });
    if (op === "wersja") {
      const sha = url.searchParams.get("sha") ?? "";
      if (!/^[0-9a-f]{7,40}$/.test(sha)) return json({ error: "Zła wersja." }, 400);
      const f = await readFile(token, p, sha);
      return f ? json({ text: f.text }) : json({ error: "Nie ma tej wersji pliku." }, 404);
    }
  } catch (e) { return fail(e); }
  return json({ error: "Nieznana operacja." }, 404);
}

interface Plik { path: string; text?: string; base64?: string }
interface ZapiszBody { files?: Plik[]; message?: string; base?: Record<string, string | null> }

export async function POST(req: Request, ctx: { params: Promise<{ op: string }> }) {
  const { op } = await ctx.params;
  if (op !== "zapisz") return json({ error: "Nieznana operacja." }, 404);
  if (req.headers.get("x-gcat-edytor") !== "1") return json({ error: "Brak nagłówka edytora." }, 400); // żądanie z innej strony nie ustawi nagłówka bez CORS
  let body: ZapiszBody;
  try { body = (await req.json()) as ZapiszBody; } catch { return json({ error: "Złe dane." }, 400); }
  const files = body.files ?? [];
  const bad = (f: Plik) => !okPath(f.path) || (rodzaj(f.path)!.kind === "obraz"
    ? typeof f.base64 !== "string" || f.base64.length > MAX_B64 || f.text !== undefined
    : typeof f.text !== "string" || f.text.length > MAX || f.base64 !== undefined);
  if (!files.length || files.length > 12 || files.some(bad) || new Set(files.map((f) => f.path)).size !== files.length) return json({ error: "Złe pliki do zapisu." }, 400);
  const message = (body.message ?? "").trim().slice(0, 200) || `Treść: ${files.map((f) => f.path.split("/").pop()).join(", ")}`;

  // ta sama kontrola co `npm run tresci` przy buildzie (rysunki i obrazy z tej samej publikacji się liczą)
  const token0 = LOCAL ? null : tokenOf(req);
  if (!LOCAL && !token0) return json({ error: "Zaloguj się przez GitHub.", login: true }, 401);
  const newRys = new Set(files.map((f) => f.path.match(/^content\/rysunki\/(.+)\.yaml$/)?.[1]).filter((x): x is string => !!x));
  const rysIds = new Set([...rysunki.map((r) => r.slug), ...newRys]);
  const newImg = new Set(files.filter((f) => f.base64 !== undefined).map((f) => f.path.replace(/^public/, "")));
  const problems: (Problem & { file: string })[] = [];
  for (const f of files) {
    const kind = rodzaj(f.path)!.kind;
    let pr: Problem[] = [];
    if (kind === "obraz") pr = sprawdzObraz(f.path, new Uint8Array(Buffer.from(f.base64!, "base64")));
    else if (kind === "rysunek") pr = sprawdzRysunek(f.path, f.text!);
    else if (kind === "haslo") pr = sprawdzHaslo(f.path, f.text!, { rysIds });
    else {
      // obrazy z <Obraz>: w tej publikacji, na dysku (lokalnie) albo w repozytorium
      const srcs = [...f.text!.matchAll(/<Obraz[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]).filter((s) => s.startsWith("/rysunki/") && !newImg.has(s));
      const known = new Set<string>(newImg);
      for (const s of srcs) if (LOCAL ? existsSync(path.join(process.cwd(), "public", s)) : await exists(token0!, `public${s}`).catch(() => false)) known.add(s);
      const check = kind === "artykul" ? sprawdzArtykul : sprawdzKarte;
      pr = (await check(f.path, f.text!, { rysIds, publicFile: (s) => known.has(s) })).problems;
    }
    problems.push(...pr.map((x) => ({ ...x, file: f.path })));
  }
  if (problems.length) return json({ error: "Treść ma błędy — popraw je przed zapisem.", problems }, 422);

  if (LOCAL) {
    for (const f of files) {
      if (f.text === undefined) continue;
      const cur = existsSync(abs(f.path)) ? readFileSync(abs(f.path), "utf8") : null;
      const base = body.base?.[f.path];
      if (base && cur !== null && blobSha(cur) !== base) return json({ error: `Plik ${f.path} zmienił się na dysku od otwarcia w edytorze.`, conflict: f.path }, 409);
    }
    for (const f of files) { mkdirSync(path.dirname(abs(f.path)), { recursive: true }); writeFileSync(abs(f.path), f.base64 !== undefined ? Buffer.from(f.base64, "base64") : f.text!); }
    return json({ mode: "local", merged: true, files: files.map((f) => ({ path: f.path, sha: f.text !== undefined ? blobSha(f.text) : "" })) });
  }

  const token = token0!;
  try {
    for (const f of files) {
      const base = body.base?.[f.path];
      if (!base) continue;
      const cur = await readFile(token, f.path);
      if (cur && cur.sha !== base) return json({ error: `Plik ${f.path} zmienił się na GitHubie od otwarcia w edytorze (ktoś zapisał nowszą wersję).`, conflict: f.path }, 409);
    }
    const slug = files[0].path.split("/").pop()!.replace(/\.[a-z]+$/, "");
    const r = await publish(token, files, message, slug);
    return json({ mode: "github", repo: `${REPO.owner}/${REPO.name}`, ...r, files: files.map((f) => ({ path: f.path, sha: f.text !== undefined ? blobSha(f.text) : "" })) });
  } catch (e) { return fail(e); }
}
