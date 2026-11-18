import { describe, expect, it } from "vitest";
import { parseProgram, playLength } from "../src/lib/parser";
import { segSeconds } from "../src/lib/parser/stats";
import {
  advance, BASE_RATE, blockEnd, cumulativeSeconds, DRY_MULT, FEED_DETENTS, fmtClock, RAPID_MULT,
  secondsAt, segmentRate, snapFeed, stepFeed,
} from "../src/components/simulator/transport";

const PROG = [
  "O1000",
  "G21 G90 G94 G17",
  "G54",
  "T1 M06",
  "G00 G43 H1 Z50.",
  "S2000 M03",
  "G00 X0. Y0.",
  "G00 Z2.",
  "G01 Z-2. F100",
  "G01 X40. F400",
  "G81 X10. Y10. Z-5. R2. F120",
  "X20.",
  "G80",
  "G00 Z50.",
  "M30",
].join("\n");

describe("override posuwu — zapadki", () => {
  it("0–150% co 10%", () => {
    expect(FEED_DETENTS[0]).toBe(0);
    expect(FEED_DETENTS.at(-1)).toBe(150);
    expect(FEED_DETENTS).toHaveLength(16);
  });
  it("dosunięcie do zapadki i zakres", () => {
    expect(snapFeed(104)).toBe(100);
    expect(snapFeed(105)).toBe(110);
    expect(snapFeed(-20)).toBe(0);
    expect(snapFeed(400)).toBe(150);
    expect(snapFeed(NaN)).toBe(100);
  });
  it("krok o zapadkę zatrzymuje się na końcach", () => {
    expect(stepFeed(100, 1)).toBe(110);
    expect(stepFeed(150, 1)).toBe(150);
    expect(stepFeed(0, -1)).toBe(0);
    expect(stepFeed(100, -5)).toBe(50);
  });
});

describe("tempo odcinka", () => {
  it("AUTO: override tylko na ruchach roboczych", () => {
    expect(segmentRate("linear", 50, "auto")).toBe(BASE_RATE * 0.5);
    expect(segmentRate("arc", 150, "auto")).toBe(BASE_RATE * 1.5);
    expect(segmentRate("rapid", 50, "auto")).toBe(BASE_RATE * RAPID_MULT);
    expect(segmentRate("dwell", 0, "auto")).toBe(BASE_RATE);
  });
  it("0% zatrzymuje ruch roboczy, G00 jedzie dalej", () => {
    expect(segmentRate("linear", 0, "single")).toBe(0);
    expect(segmentRate("rapid", 0, "single")).toBeGreaterThan(0);
  });
  it("DRY RUN: jedno tempo dla wszystkich ruchów, override działa także na G00", () => {
    expect(segmentRate("linear", 100, "dry")).toBe(BASE_RATE * DRY_MULT);
    expect(segmentRate("rapid", 100, "dry")).toBe(BASE_RATE * DRY_MULT);
    expect(segmentRate("rapid", 50, "dry")).toBe(BASE_RATE * DRY_MULT * 0.5);
  });
});

describe("SINGLE BLOCK — koniec bloku", () => {
  const prog = parseProgram(PROG, {});
  const segs = prog.segments;
  const lengths = segs.map(playLength);
  const total = lengths.reduce((a, b) => a + b, 0);

  it("blok z kilkoma odcinkami (cykl G81) kończy się po ostatnim z nich", () => {
    const i = segs.findIndex((s) => prog.lines[s.line].raw.startsWith("G81"));
    const line = segs[i].line;
    const last = segs.map((s) => s.line).lastIndexOf(line);
    expect(last).toBeGreaterThan(i); // cykl to kilka ruchów w jednym bloku
    const start = lengths.slice(0, i).reduce((a, b) => a + b, 0);
    const end = lengths.slice(0, last + 1).reduce((a, b) => a + b, 0);
    expect(blockEnd(start + 0.01, segs, lengths)).toBeCloseTo(end, 6);
    expect(blockEnd(start, segs, lengths)).toBeCloseTo(end, 6);
  });
  it("na granicy bloków — koniec następnego bloku", () => {
    const e1 = blockEnd(0, segs, lengths);
    const e2 = blockEnd(e1, segs, lengths);
    expect(e2).toBeGreaterThan(e1);
    expect(segs.find((_, k) => lengths.slice(0, k).reduce((a, b) => a + b, 0) >= e1 - 1e-9)!.line)
      .not.toBe(segs[0].line);
  });
  it("na końcu programu — koniec programu", () => {
    expect(blockEnd(total, segs, lengths)).toBeCloseTo(total, 6);
    expect(blockEnd(0, [], [])).toBe(0);
  });
  it("odtwarzanie w SINGLE BLOCK staje dokładnie na końcu bloku", () => {
    const stopAt = blockEnd(0, segs, lengths);
    let p = 0, stop = false, n = 0;
    while (!stop && n++ < 10_000) ({ p, stop } = advance(p, 1 / 60, { segments: segs, lengths, feed: 100, mode: "single", stopAt }));
    expect(stop).toBe(true);
    expect(p).toBeCloseTo(stopAt, 9);
  });
});

describe("krok animacji", () => {
  const segments = [{ kind: "rapid" as const }, { kind: "linear" as const }];
  const lengths = [30, 40];
  it("przechodzi przez granicę odcinka z tempem każdego z nich", () => {
    // 30 mm G00 przy 120 mm/s = 0,25 s; zostaje 0,25 s G01 przy 40 mm/s = 10 mm
    const r = advance(0, 0.5, { segments, lengths, feed: 100, mode: "auto", stopAt: Infinity });
    expect(r.p).toBeCloseTo(40, 6);
    expect(r.stop).toBe(false);
  });
  it("override 0%: G00 dojeżdża, ruch roboczy stoi, odtwarzanie trwa", () => {
    const r = advance(0, 5, { segments, lengths, feed: 0, mode: "auto", stopAt: Infinity });
    expect(r.p).toBeCloseTo(30, 6);
    expect(r.stop).toBe(false);
  });
  it("koniec programu zatrzymuje odtwarzanie", () => {
    const r = advance(60, 5, { segments, lengths, feed: 150, mode: "auto", stopAt: Infinity });
    expect(r).toEqual({ p: 70, stop: true });
  });
});

describe("czas programu w punkcie", () => {
  const prog = parseProgram(PROG, {});
  const segs = prog.segments;
  const lengths = segs.map(playLength);
  const cum = cumulativeSeconds(segs, (s) => segSeconds(s, prog));
  it("0 na starcie, suma na końcu, rośnie monotonicznie", () => {
    const total = lengths.reduce((a, b) => a + b, 0);
    expect(secondsAt(0, lengths, cum)).toBe(0);
    expect(secondsAt(total, lengths, cum)).toBeCloseTo(cum.at(-1)!, 9);
    let prev = -1;
    for (let p = 0; p <= total; p += total / 50) { const s = secondsAt(p, lengths, cum); expect(s).toBeGreaterThanOrEqual(prev - 1e-9); prev = s; }
  });
  it("G01 X40. F400: 40 mm w 6 s", () => {
    const i = segs.findIndex((s) => prog.lines[s.line].raw === "G01 X40. F400");
    expect(cum[i + 1] - cum[i]).toBeCloseTo(6, 6);
  });
  it("format zegara", () => {
    expect(fmtClock(0)).toBe("0:00");
    expect(fmtClock(83)).toBe("1:23");
    expect(fmtClock(3725)).toBe("1:02:05");
  });
});
