import type { ReactNode } from "react";

/* Ikony narzędzi rysownika: 20 × 20, kreska 1.6, kolor z currentColor. */
const I = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
);

export const icons = {
  select: <I><path d="M5 3l9 6.5-4 .9 2.3 4.6-1.8.9-2.3-4.6L5 14z" /></I>,
  line: <I><path d="M4 16L16 4" /><circle cx="4" cy="16" r="1.4" fill="currentColor" /><circle cx="16" cy="4" r="1.4" fill="currentColor" /></I>,
  poly: <I><path d="M3 15l4-9 5 6 5-8" /><circle cx="7" cy="6" r="1.2" fill="currentColor" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /></I>,
  rect: <I><rect x="3.5" y="5" width="13" height="10" rx="1" /></I>,
  circle: <I><circle cx="10" cy="10" r="6.5" /></I>,
  arc: <I><path d="M4 15A11 11 0 0 1 15 4" /><circle cx="15" cy="15" r="1.2" fill="currentColor" /></I>,
  arcc: <I><path d="M4 15A11 11 0 0 1 15 4" /><path d="M15 15L4 15M15 15L15 4" strokeDasharray="1.6 1.8" /><circle cx="15" cy="15" r="1.4" fill="currentColor" /></I>,
  text: <I><path d="M5 5h10M10 5v10M8 15h4" /></I>,
  dim: <I><path d="M3 10h14M3 6v8M17 6v8M3 10l2.5-1.6M3 10l2.5 1.6M17 10l-2.5-1.6M17 10l-2.5 1.6" /></I>,
  pt: <I><circle cx="10" cy="10" r="2.6" fill="currentColor" /><path d="M10 3v2.5M10 14.5V17M3 10h2.5M14.5 10H17" /></I>,
  step: <I><circle cx="10" cy="10" r="6.5" /><path d="M9 8l1.4-1v6" /></I>,
  grid: <I><path d="M3.5 3.5h13v13h-13zM3.5 8h13M3.5 12.5h13M8 3.5v13M12.5 3.5v13" /></I>,
  undo: <I><path d="M7 5L3.5 8.5 7 12" /><path d="M3.5 8.5H12a4 4 0 0 1 0 8H9" /></I>,
  redo: <I><path d="M13 5l3.5 3.5L13 12" /><path d="M16.5 8.5H8a4 4 0 0 0 0 8h3" /></I>,
  magnet: <I><path d="M5 4v6a5 5 0 0 0 10 0V4h-3v6a2 2 0 0 1-4 0V4z" /><path d="M5 7h3M12 7h3" /></I>,
  dots: <I><circle cx="5" cy="5" r=".9" fill="currentColor" /><circle cx="10" cy="5" r=".9" fill="currentColor" /><circle cx="15" cy="5" r=".9" fill="currentColor" /><circle cx="5" cy="10" r=".9" fill="currentColor" /><circle cx="10" cy="10" r=".9" fill="currentColor" /><circle cx="15" cy="10" r=".9" fill="currentColor" /><circle cx="5" cy="15" r=".9" fill="currentColor" /><circle cx="10" cy="15" r=".9" fill="currentColor" /><circle cx="15" cy="15" r=".9" fill="currentColor" /></I>,
  trash: <I><path d="M4 6h12M8 6V4h4v2M6 6l.7 10h6.6L14 6" /></I>,
  copy: <I><rect x="7" y="7" width="9" height="9" rx="1.5" /><path d="M13 7V5.5A1.5 1.5 0 0 0 11.5 4h-6A1.5 1.5 0 0 0 4 5.5v6A1.5 1.5 0 0 0 5.5 13H7" /></I>,
  up: <I><path d="M10 15V5M6 9l4-4 4 4" /></I>,
  down: <I><path d="M10 5v10M6 11l4 4 4-4" /></I>,
  import: <I><path d="M10 3v9M6.5 8.5L10 12l3.5-3.5" /><path d="M4 13v3h12v-3" /></I>,
  zin: <I><circle cx="8.5" cy="8.5" r="5" /><path d="M12.2 12.2L16.5 16.5M6.3 8.5h4.4M8.5 6.3v4.4" /></I>,
  zout: <I><circle cx="8.5" cy="8.5" r="5" /><path d="M12.2 12.2L16.5 16.5M6.3 8.5h4.4" /></I>,
  fit: <I><path d="M3.5 7V3.5H7M13 3.5h3.5V7M16.5 13v3.5H13M7 16.5H3.5V13" /><rect x="7" y="7" width="6" height="6" rx="1" /></I>,
  flip: <I><path d="M4 8h12l-3-3M16 12H4l3 3" /></I>,
  polar: <I><path d="M3 16h14" /><path d="M3 16L14 5" /><path d="M9 16a6 6 0 0 0-1.8-4.2" /></I>,
  track: <I><path d="M3 10h14M10 3v14" strokeDasharray="1.6 1.8" /><circle cx="10" cy="10" r="2" fill="currentColor" /></I>,
  axes: <I><path d="M5 16V3.5M5 16h12" /><path d="M3.5 5L5 3.5 6.5 5M15.5 14.5L17 16l-1.5 1.5" /></I>,
  file: <I><path d="M5 2.5h7l3.5 3.5v11.5h-10.5z" /><path d="M12 2.5V6h3.5" /></I>,
  eye: <I><path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z" /><circle cx="10" cy="10" r="2.3" /></I>,
  eyeOff: <I><path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10z" opacity=".45" /><path d="M3.5 16.5l13-13" /></I>,
  lock: <I><rect x="4.5" y="9" width="11" height="8" rx="1.2" /><path d="M7 9V6.5a3 3 0 0 1 6 0V9" /></I>,
  unlock: <I><rect x="4.5" y="9" width="11" height="8" rx="1.2" /><path d="M7 9V6.5a3 3 0 0 1 5.8-1" /></I>,
  xray: <I><rect x="3" y="5" width="9" height="9" rx="1" /><rect x="8" y="8" width="9" height="9" rx="1" fill="currentColor" fillOpacity=".25" /><path d="M8 11.5V8h4" strokeDasharray="1.4 1.6" /></I>,
  chevron: <I><path d="M6 8l4 4 4-4" /></I>,
};
export type IconName = keyof typeof icons;
