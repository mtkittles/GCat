"use client";
import { useState } from "react";
import Simulator, { type Dialect, type SimMode } from "./Simulator";
import type { Stock } from "./setup";

export default function SimClient({ initial, mode, compact, autoplay, controls, editable = true, showcase, stock, dialect }: { initial: string; mode: SimMode; compact?: boolean; autoplay?: boolean | "wide"; controls?: boolean; editable?: boolean; showcase?: boolean; stock?: Partial<Omit<Stock, "auto">>; dialect?: Dialect }) {
  const [src, setSrc] = useState(initial);
  return <Simulator source={src} onSourceChange={setSrc} mode={mode} compact={compact} autoplay={autoplay} controls={controls} editable={editable} showcase={showcase} stock={stock} dialect={dialect} />;
}
