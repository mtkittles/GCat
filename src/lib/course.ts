import type { LessonDoc } from "@/lib/lesson";
import { f0_1 } from "@/content/nauka/f0-1";
import { f0_2 } from "@/content/nauka/f0-2";
import { f0_3 } from "@/content/nauka/f0-3";

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
        L("F1.1", "Blok, słowo i adres"),
        L("F1.2", "Modalność"),
        L("F1.3", "G90 i G91"),
        L("F1.4", "Jednostki i płaszczyzny: G21, G17"),
        L("F1.5", "Blok startowy i koniec programu"),
      ] },
      { id: "F2", title: "Wrzeciono i narzędzie", lessons: [
        L("F2.1", "Wymiana narzędzia: T i M06"),
        L("F2.2", "Obroty: S i M03/M04/M05"),
        L("F2.3", "Posuw F i G94"),
        L("F2.4", "Chłodziwo: M08 i M09"),
      ] },
      { id: "F3", title: "Ruchy", lessons: [
        L("F3.1", "G00 — ruch szybki"),
        L("F3.2", "G01 — interpolacja liniowa"),
        L("F3.3", "G02 i G03 z promieniem R"),
        L("F3.4", "Łuki przez I i J"),
        L("F3.5", "G04 — postój"),
      ] },
      { id: "F4", title: "Korekcje", lessons: [
        L("F4.1", "G43 — korekcja długości"),
        L("F4.2", "G41, G42, G40 — korekcja promienia"),
        L("F4.3", "Najazd i odjazd od konturu"),
      ] },
      { id: "F5", title: "Cykle wiercenia", lessons: [
        L("F5.1", "G81 i G82"),
        L("F5.2", "G83 i G73 — wiercenie z wycofaniem"),
        L("F5.3", "G84 — gwintowanie"),
        L("F5.4", "G98, G99 i G80"),
      ] },
      { id: "F6", title: "Kieszenie i kontury", lessons: [
        L("F6.1", "Planowanie"),
        L("F6.2", "Kieszeń prostokątna"),
        L("F6.3", "Kieszeń okrągła"),
      ] },
      { id: "F7", title: "Podprogramy", lessons: [
        L("F7.1", "M98 i M99"),
        L("F7.2", "Podprogramy w Sinumeriku"),
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
