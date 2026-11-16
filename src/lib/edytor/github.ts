/*
  Zapis treści przez GitHub (tylko serwer). Token = token użytkownika z logowania GitHub panelu treści
  (ciasteczko Keystatic „keystatic-gh-access-token”), więc uprawnienia sprawdza GitHub: zapisać może tylko
  ktoś z prawem zapisu do repozytorium. Publikacja przestrzega reguły na main (zmiany tylko przez PR):
  gałąź tresci/…, commit, PR i scalenie. Bez prawa do PR (aplikacja ma tylko odczyt PR) zostaje gałąź
  i link „utwórz PR” do kliknięcia na GitHubie.
*/

export const REPO = { owner: "mtkittles", name: "GCat", branch: "main" } as const;
const API = `https://api.github.com/repos/${REPO.owner}/${REPO.name}`;

export class GhError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function gh<T = unknown>(token: string, url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url.startsWith("http") ? url : `${API}${url}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json", ...(init.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    let msg = res.statusText;
    try { msg = ((await res.json()) as { message?: string }).message ?? msg; } catch { /* brak treści */ }
    throw new GhError(res.status, msg);
  }
  return (res.status === 204 ? null : await res.json()) as T;
}

const unb64 = (s: string) => Buffer.from(s, "base64").toString("utf8");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function whoami(token: string) {
  const u = await gh<{ login: string; avatar_url: string; name: string | null }>(token, "https://api.github.com/user");
  const r = await gh<{ permissions?: { push?: boolean } }>(token, "");
  return { login: u.login, name: u.name ?? u.login, avatar: u.avatar_url, canWrite: !!r.permissions?.push };
}

export async function readFile(token: string, path: string, ref: string = REPO.branch): Promise<{ text: string; sha: string } | null> {
  try {
    const f = await gh<{ content: string; sha: string; encoding: string }>(token, `/contents/${encodeURI(path)}?ref=${encodeURIComponent(ref)}`);
    return { text: unb64(f.content), sha: f.sha };
  } catch (e) {
    if (e instanceof GhError && e.status === 404) return null;
    throw e;
  }
}

export interface Wersja { sha: string; date: string; author: string; message: string; url: string }

export async function history(token: string, path: string): Promise<Wersja[]> {
  const list = await gh<{ sha: string; html_url: string; commit: { message: string; author: { name: string; date: string } } }[]>(token, `/commits?sha=${REPO.branch}&path=${encodeURIComponent(path)}&per_page=40`);
  return list.map((c) => ({ sha: c.sha, date: c.commit.author.date, author: c.commit.author.name, message: c.commit.message.split("\n")[0], url: c.html_url }));
}

export interface Publikacja { merged: boolean; branch: string; commit?: string; pr?: { number: number; url: string }; compare?: string; note?: string }

/** Gałąź tresci/<nazwa>-<czas> z jednym commitem, PR do main i scalenie. */
/** Czy plik jest w repozytorium (np. obraz wskazany w <Obraz>). */
export async function exists(token: string, path: string): Promise<boolean> {
  try { await gh(token, `/contents/${encodeURI(path)}?ref=${REPO.branch}`); return true; } catch (e) { if (e instanceof GhError && e.status === 404) return false; throw e; }
}

export async function publish(token: string, files: { path: string; text?: string; base64?: string }[], message: string, slug: string): Promise<Publikacja> {
  const head = await gh<{ object: { sha: string } }>(token, `/git/ref/heads/${REPO.branch}`);
  const baseCommit = await gh<{ tree: { sha: string } }>(token, `/git/commits/${head.object.sha}`);
  const entries = await Promise.all(files.map(async (f) => {
    if (f.base64 === undefined) return { path: f.path, mode: "100644", type: "blob", content: f.text ?? "" };
    // plik binarny (obraz): najpierw blob w base64
    const b = await gh<{ sha: string }>(token, "/git/blobs", { method: "POST", body: JSON.stringify({ content: f.base64, encoding: "base64" }) });
    return { path: f.path, mode: "100644", type: "blob", sha: b.sha };
  }));
  const tree = await gh<{ sha: string }>(token, "/git/trees", { method: "POST", body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree: entries }) });
  const commit = await gh<{ sha: string }>(token, "/git/commits", { method: "POST", body: JSON.stringify({ message, tree: tree.sha, parents: [head.object.sha] }) });
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..*/, "").replace("T", "-");
  const branch = `tresci/${slug}-${stamp}`;
  await gh(token, "/git/refs", { method: "POST", body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commit.sha }) });
  const compare = `https://github.com/${REPO.owner}/${REPO.name}/compare/${REPO.branch}...${encodeURIComponent(branch)}?expand=1`;

  let pr: { number: number; html_url: string };
  try {
    pr = await gh(token, "/pulls", { method: "POST", body: JSON.stringify({ title: message.split("\n")[0], head: branch, base: REPO.branch, body: "Zapis z edytora treści GCat." }) });
  } catch (e) {
    if (e instanceof GhError && (e.status === 403 || e.status === 404)) return { merged: false, branch, compare, note: "Aplikacja GitHub panelu ma tylko odczyt PR — zmiany są na gałęzi; utwórz i scal PR na GitHubie albo nadaj aplikacji prawo zapisu do PR." };
    throw e;
  }
  const out: Publikacja = { merged: false, branch, compare, pr: { number: pr.number, url: pr.html_url } };
  // GitHub liczy możliwość scalenia chwilę po utworzeniu PR — kilka prób
  for (let i = 0; i < 6; i++) {
    for (const merge_method of ["squash", "merge"]) {
      try {
        const m = await gh<{ sha: string; merged: boolean }>(token, `/pulls/${pr.number}/merge`, { method: "PUT", body: JSON.stringify({ merge_method, commit_title: message.split("\n")[0] }) });
        if (m.merged) {
          out.merged = true;
          out.commit = m.sha;
          try { await gh(token, `/git/refs/heads/${encodeURIComponent(branch)}`, { method: "DELETE" }); } catch { /* gałąź zostaje — nic złego */ }
          return out;
        }
      } catch (e) {
        if (!(e instanceof GhError)) throw e;
        if (e.status === 403) return { ...out, note: "Aplikacja GitHub panelu nie może scalać PR — scal go na GitHubie albo nadaj aplikacji prawo zapisu do PR." };
        if (e.status === 405 && /merge method|not allowed/i.test(e.message) && merge_method === "squash") continue;
        if (e.status !== 405 && e.status !== 409) throw e;
      }
    }
    await sleep(1500);
  }
  return { ...out, note: "PR utworzony, ale GitHub jeszcze nie pozwala go scalić — scal go na GitHubie." };
}

