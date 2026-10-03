import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { gcodes } from "@/lib/gcodes";
import { exercises } from "@/lib/content";
import { lessonHref, readyLessons } from "@/lib/course";
import { PROGRAMS } from "@/content/programy";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (path: string, priority = 0.6, changeFrequency: "weekly" | "monthly" = "monthly") => ({ url: `${SITE_URL}${path}`, priority, changeFrequency });
  return [
    u("/", 1, "weekly"),
    u("/nauka", 0.9, "weekly"), u("/nauka/frezowanie", 0.9), u("/nauka/toczenie", 0.9),
    u("/kody", 0.9), u("/symulator", 0.9), u("/zadania", 0.8), u("/programy", 0.8), u("/kalkulator", 0.7), u("/slownik", 0.7),
    ...(["frezowanie", "toczenie"] as const).flatMap((t) => readyLessons(t).map((l) => u(lessonHref(t, l.slug!), 0.8))),
    ...gcodes.map((g) => u(`/kody/${g.slug}`, 0.7)),
    ...exercises.map((e) => u(`/zadania/${e.slug}`, 0.6)),
    ...PROGRAMS.map((p) => u(`/programy/${p.slug}`, 0.6)),
  ];
}
