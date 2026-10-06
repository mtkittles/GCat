import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";

/*
  API Keystatic: lokalnie zapis na dysk; na produkcji logowanie przez GitHub App (zmienne KEYSTATIC_* tylko po stronie serwera).
  Handler powstaje przy pierwszym żądaniu, nie przy buildzie: w trybie GitHub Keystatic wymaga zmiennych od razu,
  a bez nich (CI, preview przed konfiguracją) build by się wywrócił. Brak zmiennych = 503 z listą brakujących.
*/
const WYMAGANE = ["KEYSTATIC_GITHUB_CLIENT_ID", "KEYSTATIC_GITHUB_CLIENT_SECRET", "KEYSTATIC_SECRET"] as const;
let handler: ReturnType<typeof makeRouteHandler> | undefined;

function obsluz(req: Request) {
  if (config.storage.kind === "github") {
    const brak = WYMAGANE.filter((k) => !process.env[k]);
    if (brak.length) return new Response(`Panel treści nie jest skonfigurowany (brak zmiennych: ${brak.join(", ")}).`, { status: 503 });
  }
  handler ??= makeRouteHandler({ config });
  return req.method === "POST" ? handler.POST(req) : handler.GET(req);
}

export const GET = obsluz;
export const POST = obsluz;
