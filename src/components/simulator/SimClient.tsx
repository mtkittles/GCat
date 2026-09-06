"use client";
import { useState } from "react";
import Simulator, { type SimMode } from "./Simulator";

export default function SimClient({ initial, mode, compact, autoplay, editable = true, showcase }: { initial: string; mode: SimMode; compact?: boolean; autoplay?: boolean; editable?: boolean; showcase?: boolean }) {
  const [src, setSrc] = useState(initial);
  return <Simulator source={src} onSourceChange={setSrc} mode={mode} compact={compact} autoplay={autoplay} editable={editable} showcase={showcase} />;
}
