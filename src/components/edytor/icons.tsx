import type { ReactNode } from "react";

/* Ikony edytora treści — ten sam rysunek co w rysowniku: 20 × 20, kreska 1.6, currentColor. */
const I = ({ children }: { children: ReactNode }) => (
  <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
);

export const ei = {
  p: <I><path d="M8 16V4h5a3.5 3.5 0 0 1 0 7H8M12 4v12" /></I>,
  h2: <I><path d="M3 5v10M9 5v10M3 10h6" /><path d="M12.5 9a2 2 0 0 1 4 .3c0 1.6-4 3.2-4 5.7h4" /></I>,
  h3: <I><path d="M3 5v10M9 5v10M3 10h6" /><path d="M12.5 8h4l-2.2 2.6a2 2 0 1 1-1.8 3.4" /></I>,
  bold: <I><path d="M6 4h5a3 3 0 0 1 0 6H6zM6 10h6a3 3 0 0 1 0 6H6z" /></I>,
  italic: <I><path d="M9 4h6M5 16h6M12 4 8 16" /></I>,
  code: <I><path d="M7 6 3 10l4 4M13 6l4 4-4 4" /></I>,
  kolor: <I><path d="M10 3s5 5.2 5 8.5a5 5 0 0 1-10 0C5 8.2 10 3 10 3z" /></I>,
  term: <I><path d="M6 4H4v12h2M14 4h2v12h-2" /><path d="M8 10h4" /></I>,
  link: <I><path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.5-2.5a3 3 0 0 0-4.2-4.2l-1 1" /><path d="M11.5 8.5a3 3 0 0 0-4.2 0L4.8 11a3 3 0 0 0 4.2 4.2l1-1" /></I>,
  ul: <I><path d="M8 5h9M8 10h9M8 15h9" /><circle cx="4" cy="5" r="1" fill="currentColor" /><circle cx="4" cy="10" r="1" fill="currentColor" /><circle cx="4" cy="15" r="1" fill="currentColor" /></I>,
  ol: <I><path d="M8 5h9M8 10h9M8 15h9" /><path d="M3.5 4l1-.6V7M3 11.2a1 1 0 0 1 2 0c0 .8-2 1.5-2 2.3h2" /></I>,
  table: <I><rect x="3" y="4" width="14" height="12" rx="1" /><path d="M3 8h14M3 12h14M8 4v12" /></I>,
  note: <I><rect x="3" y="4" width="14" height="12" rx="2" /><path d="M7 4v12" /><path d="M10 8h4M10 12h3" /></I>,
  prog: <I><rect x="3" y="4" width="14" height="12" rx="1.5" /><path d="M6 8h5M6 11h7M6 14h3" /></I>,
  sim: <I><rect x="3" y="4" width="14" height="12" rx="1.5" /><path d="M8.5 7.5v5l4-2.5z" fill="currentColor" /></I>,
  demo: <I><rect x="3" y="6" width="14" height="10" rx="1.5" /><path d="M5 3.5h10" /><path d="M9 9v4l3.2-2z" fill="currentColor" /></I>,
  diagram: <I><path d="M3 16h14M4 15V4" /><path d="M5 13l3.5-4 3 2.5L16 6" /></I>,
  rys: <I><path d="M4 16 15 5l1.5 1.5L5.5 17.5H4z" /><path d="M13 7l1.5 1.5" /></I>,
  image: <I><rect x="3" y="4" width="14" height="12" rx="1.5" /><circle cx="7.5" cy="8.5" r="1.4" /><path d="M3.5 15l4.5-4 3 2.5 2.5-2 3 3" /></I>,
  wzor: <I><path d="M5 5.5h3.5M6.8 5.5v9M11 9l3.5 5.5M14.5 9 11 14.5M4 16h4" /></I>,
  widget: <I><rect x="4" y="3" width="12" height="14" rx="1.5" /><path d="M7 6h6M7 9.5h1.5M11.5 9.5H13M7 13h1.5M11.5 13H13" /></I>,
  undo: <I><path d="M7 5L3.5 8.5 7 12" /><path d="M3.5 8.5H12a4 4 0 0 1 0 8H9" /></I>,
  redo: <I><path d="M13 5l3.5 3.5L13 12" /><path d="M16.5 8.5H8a4 4 0 0 0 0 8h3" /></I>,
  history: <I><path d="M3.5 10a6.5 6.5 0 1 0 2-4.7" /><path d="M3 3.5v3h3" /><path d="M10 6.5V10l2.5 1.5" /></I>,
  eye: <I><path d="M2.5 10s2.8-5 7.5-5 7.5 5 7.5 5-2.8 5-7.5 5-7.5-5-7.5-5z" /><circle cx="10" cy="10" r="2.3" /></I>,
  pen: <I><path d="M4 16l1-4 8.5-8.5 3 3L8 15z" /><path d="M11.5 5.5l3 3" /></I>,
  desktop: <I><rect x="2.5" y="4" width="15" height="10" rx="1" /><path d="M7 17h6M10 14v3" /></I>,
  tablet: <I><rect x="4.5" y="2.5" width="11" height="15" rx="1.5" /><path d="M9 15h2" /></I>,
  phone: <I><rect x="6" y="2.5" width="8" height="15" rx="1.5" /><path d="M9 15h2" /></I>,
  up: <I><path d="M10 16V4M5 9l5-5 5 5" /></I>,
  down: <I><path d="M10 4v12M5 11l5 5 5-5" /></I>,
  dup: <I><rect x="7" y="7" width="9" height="9" rx="1.2" /><path d="M13 7V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2" /></I>,
  trash: <I><path d="M4 6h12M8 6V4h4v2M6 6l.7 10h6.6L14 6" /></I>,
  publish: <I><path d="M10 13V3M6 7l4-4 4 4" /><path d="M4 12v4h12v-4" /></I>,
  check: <I><path d="M4 10.5l4 4 8-9" /></I>,
  plus: <I><path d="M10 4v12M4 10h12" /></I>,
  back: <I><path d="M8 5l-5 5 5 5M3 10h14" /></I>,
};
export type EIcon = keyof typeof ei;
