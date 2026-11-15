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
  flip: <I><path d="M4 8h12l-3-3M16 12H4l3 3" /></I>,
};
export type IconName = keyof typeof icons;
