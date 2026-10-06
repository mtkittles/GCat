import { glossary } from "@/lib/content";
import { gcodes } from "@/lib/gcodes";
import type { TermSources } from "./resolve";

/** Źródła markerów z danych strony (wygenerowanych z content/ skryptem `npm run tresci`) — do renderu w trakcie builda. */
export const liveSources: TermSources = { gcodes, glossary };
