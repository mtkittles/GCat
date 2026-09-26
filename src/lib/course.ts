import type { LessonDoc } from "@/lib/lesson";
import { f0_1 } from "@/content/nauka/f0-1";
import { f0_2 } from "@/content/nauka/f0-2";
import { f0_3 } from "@/content/nauka/f0-3";
import { f1_1 } from "@/content/nauka/f1-1";
import { f1_2 } from "@/content/nauka/f1-2";
import { f1_3 } from "@/content/nauka/f1-3";
import { f1_4 } from "@/content/nauka/f1-4";
import { f1_5 } from "@/content/nauka/f1-5";
import { f2_1 } from "@/content/nauka/f2-1";
import { f2_2 } from "@/content/nauka/f2-2";
import { f2_3 } from "@/content/nauka/f2-3";
import { f2_4 } from "@/content/nauka/f2-4";
import { f3_1 } from "@/content/nauka/f3-1";
import { f3_2 } from "@/content/nauka/f3-2";
import { f3_3 } from "@/content/nauka/f3-3";
import { f3_4 } from "@/content/nauka/f3-4";
import { f3_5 } from "@/content/nauka/f3-5";
import { f4_1 } from "@/content/nauka/f4-1";
import { f4_2 } from "@/content/nauka/f4-2";
import { f4_3 } from "@/content/nauka/f4-3";
import { f5_1 } from "@/content/nauka/f5-1";
import { f5_2 } from "@/content/nauka/f5-2";
import { f5_3 } from "@/content/nauka/f5-3";
import { f5_4 } from "@/content/nauka/f5-4";
import { f6_1 } from "@/content/nauka/f6-1";
import { f6_2 } from "@/content/nauka/f6-2";
import { f6_3 } from "@/content/nauka/f6-3";
import { f7_1 } from "@/content/nauka/f7-1";
import { f7_2 } from "@/content/nauka/f7-2";

/*
  Plan kursu: dwie niezależne ścieżki (frezowanie, toczenie), każda z modułów i lekcji.
  Lekcja bez treści (`doc`) jest widoczna w planie jako „w przygotowaniu”.
  Kolejność w tablicach = kolejność nauki; na niej opiera się też program narastający.
*/

export type Track = "frezowanie" | "toczenie";

export interface PlanLesson { id: string; title: string; slug?: string; doc?: LessonDoc }
export interface Module { id: string; title: string; lessons: PlanLesson[] }
export interface TrackDef {
  key: Track; mode: "mill" | "lathe"; title: string; blurb: string; part: string;
  banner: string; modules: Module[];
}

const L = (id: string, title: string, doc?: LessonDoc): PlanLesson => ({ id, title, doc, slug: doc?.slug });

export const tracks: Record<Track, TrackDef> = {
  frezowanie: {
    key: "frezowanie", mode: "mill", title: "Frezowanie",
    blurb: "Od osi XYZ do kieszeni, cykli wiercenia i podprogramów.",
    part: "Płytka 80 × 50 z zaokrąglonymi narożami",
    banner: "/img/banner-mill.jpg",
    modules: [
      { id: "F0", title: "Maszyna", lessons: [
        L("F0.1", "Układ współrzędnych frezarki", f0_1),
        L("F0.2", "Punkty zerowe M, R i W", f0_2),
        L("F0.3", "Przesunięcia G54–G59", f0_3),
      ] },
      { id: "F1", title: "Struktura programu", lessons: [
        L("F1.1", "Blok, słowo i adres", f1_1),
        L("F1.2", "Modalność", f1_2),
        L("F1.3", "G90 i G91", f1_3),
        L("F1.4", "Jednostki i płaszczyzny: G21, G17", f1_4),
        L("F1.5", "Blok startowy i koniec programu", f1_5),
      ] },
      { id: "F2", title: "Wrzeciono i narzędzie", lessons: [
        L("F2.1", "Wymiana narzędzia: T i M06", f2_1),
        L("F2.2", "Obroty: S i M03/M04/M05", f2_2),
        L("F2.3", "Posuw F i G94", f2_3),
        L("F2.4", "Chłodziwo: M08 i M09", f2_4),
      ] },
      { id: "F3", title: "Ruchy", lessons: [
        L("F3.1", "G00 — ruch szybki", f3_1),
        L("F3.2", "G01 — interpolacja liniowa", f3_2),
        L("F3.3", "G02 i G03 z promieniem R", f3_3),
        L("F3.4", "Łuki przez I i J", f3_4),
        L("F3.5", "G04 — postój", f3_5),
      ] },
      { id: "F4", title: "Korekcje", lessons: [
        L("F4.1", "G43 — korekcja długości", f4_1),
        L("F4.2", "G41, G42, G40 — korekcja promienia", f4_2),
        L("F4.3", "Najazd i odjazd od konturu", f4_3),
      ] },
      { id: "F5", title: "Cykle wiercenia", lessons: [
        L("F5.1", "G81 i G82", f5_1),
        L("F5.2", "G83 i G73 — wiercenie z wycofaniem", f5_2),
        L("F5.3", "G84 — gwintowanie", f5_3),
        L("F5.4", "G98, G99 i G80", f5_4),
      ] },
      { id: "F6", title: "Kieszenie i kontury", lessons: [
        L("F6.1", "Planowanie", f6_1),
        L("F6.2", "Kieszeń prostokątna", f6_2),
        L("F6.3", "Kieszeń okrągła", f6_3),
      ] },
      { id: "F7", title: "Podprogramy", lessons: [
        L("F7.1", "M98 i M99", f7_1),
        L("F7.2", "Podprogramy w Sinumeriku", f7_2),
      ] },
    ],
  },
  toczenie: {
    key: "toczenie", mode: "lathe", title: "Toczenie",
    blurb: "Od osi X i Z do cykli zgrubnych, rowków i gwintów.",
    part: "Wałek stopniowany z fazą, rowkiem i gwintem",
    banner: "/img/banner-turn.jpg",
    modules: [
      { id: "T0", title: "Maszyna", lessons: [
        L("T0.1", "Układ współrzędnych tokarki"),
        L("T0.2", "Programowanie średnicowe"),
        L("T0.3", "Zero przedmiotu i położenie głowicy"),
      ] },
      { id: "T1", title: "Struktura programu", lessons: [
        L("T1.1", "Blok, adres i modalność"),
        L("T1.2", "G90, G91 oraz U i W"),
        L("T1.3", "Blok startowy tokarki"),
      ] },
      { id: "T2", title: "Wrzeciono i narzędzie", lessons: [
        L("T2.1", "Narzędzie: T0101 i T/D"),
        L("T2.2", "G96, G97 i limit obrotów"),
        L("T2.3", "Posuw na obrót: G95"),
      ] },
      { id: "T3", title: "Ruchy", lessons: [
        L("T3.1", "G00 — ruch szybki"),
        L("T3.2", "G01, fazy i promienie"),
        L("T3.3", "G02 i G03 a położenie głowicy"),
      ] },
      { id: "T4", title: "Korekcja promienia płytki", lessons: [
        L("T4.1", "G41 i G42 na tokarce"),
        L("T4.2", "Kierunek ostrza"),
      ] },
      { id: "T5", title: "Cykle zgrubne", lessons: [
        L("T5.1", "G71 i G70"),
        L("T5.2", "G72 — planowanie"),
        L("T5.3", "CYCLE95 w Sinumeriku"),
      ] },
      { id: "T6", title: "Rowki i wiercenie osiowe", lessons: [
        L("T6.1", "G75 — rowki"),
        L("T6.2", "G74 — wiercenie osiowe"),
      ] },
      { id: "T7", title: "Gwintowanie", lessons: [
        L("T7.1", "G76 — cykl gwintowania"),
        L("T7.2", "G32 i G33"),
      ] },
      { id: "T8", title: "Podprogramy", lessons: [
        L("T8.1", "Podprogramy na tokarce"),
      ] },
    ],
  },
};

export const trackList = [tracks.frezowanie, tracks.toczenie];

export const flat = (t: Track) => tracks[t].modules.flatMap((m) => m.lessons.map((l) => ({ ...l, module: m })));

/** Pozycja lekcji w ścieżce (0, 1, 2…) — do porównań „wcześniej / później”. */
export const orderOf = (t: Track, id: string) => flat(t).findIndex((l) => l.id === id);

export const readyLessons = (t: Track) => flat(t).filter((l) => l.doc);
export const lessonDoc = (t: Track, slug: string) => flat(t).find((l) => l.slug === slug);
export const trackStats = (t: Track) => { const all = flat(t); return { ready: all.filter((l) => l.doc).length, total: all.length }; };

export const lessonHref = (t: Track, slug: string) => `/nauka/${t}/${slug}`;
