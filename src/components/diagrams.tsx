import type { ReactNode } from "react";
import { AbsInc, ArcIJ, Comp, CycleRetract, LatheRough, LatheSingle, Peck, Planes, Polar, RefPoint, ToolLen } from "./figs";
import {
  Allowance, ApAe, Climb, CompEntry, ConstVc, DiaX, Dwell, FineBore, Groove, HelixTop, HelixViews, LatheFace, Linear,
  Probe, RapidClamp, RapidPath, Runout, RzDiag, Thinning, VcDiag, WorkOffset, Zone,
} from "./figs2";
import { f0Figs } from "./lesson/figs-f0";
import { f1Figs } from "./lesson/figs-f1";
import { f2Figs } from "./lesson/figs-f2";
import { f3Figs } from "./lesson/figs-f3";
import { f4Figs } from "./lesson/figs-f4";
import { f5Figs } from "./lesson/figs-f5";

/*
  Wszystkie rysunki techniczne serwisu — jeden styl (fig.tsx).
  Klucze: slug karty kodu albo nazwa tematu używana w artykułach i słowniku.
  Kody bez dopasowanego rysunku celowo nie mają żadnego — lepiej brak niż schemat od innego tematu.
*/
export const diagrams: Record<string, () => ReactNode> = {
  ...f0Figs,
  ...f1Figs,
  ...f2Figs,
  ...f3Figs,
  ...f4Figs,
  ...f5Figs,
  // tematy (artykuły, słownik, kalkulator)
  "rapid-path": () => <RapidPath />,
  "rapid-clamp": () => <RapidClamp />,
  "helix": () => <HelixTop />,
  "helix-z": () => <HelixViews />,
  "comp-entry": () => <CompEntry />,
  dia: () => <DiaX />,
  apae: () => <ApAe />,
  thinning: () => <Thinning />,
  vc: () => <VcDiag />,
  climb: () => <Climb />,
  rz: () => <RzDiag />,
  allowance: () => <Allowance />,
  runout: () => <Runout />,
  // karty kodów
  g00: () => <RapidPath />,
  g01: () => <Linear />,
  g02: () => <ArcIJ dir={2} />,
  g03: () => <ArcIJ dir={3} />,
  g04: () => <Dwell />,
  "g15-g16": () => <Polar />,
  "g17-g19": () => <Planes />,
  "g22-g23": () => <Zone />,
  g28: () => <RefPoint />,
  "g27-g30": () => <RefPoint />,
  g31: () => <Probe />,
  "g40-g42": () => <Comp />,
  "g43-g49": () => <ToolLen />,
  "g54-g59": () => <WorkOffset />,
  "g71-g70": () => <LatheRough />,
  g72: () => <LatheFace />,
  g73: () => <Peck />,
  g75: () => <Groove />,
  "g76-g89": () => <FineBore />,
  "g81-g83": () => <CycleRetract />,
  "g98-g99": () => <CycleRetract />,
  "g90-g91": () => <AbsInc />,
  "g90-g94-t": () => <LatheSingle />,
  "g96-g97": () => <ConstVc />,
  g50: () => <ConstVc />,
};
