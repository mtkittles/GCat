export default function Logo({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="gcat-logo">
      {/* uszy */}
      <path d="M12 22 L14.5 7.5 L26 15.5 Z" fill="var(--amber)" />
      <path d="M52 22 L49.5 7.5 L38 15.5 Z" fill="var(--amber)" />
      <path d="M15 20 L16.5 12 L23 16.5 Z" fill="var(--bg)" opacity=".55" />
      <path d="M49 20 L47.5 12 L41 16.5 Z" fill="var(--bg)" opacity=".55" />
      {/* głowa jako litera G: pierścień otwarty po prawej + poprzeczka */}
      <path d="M50.5 24.5 A20.5 20.5 0 1 0 50.5 43.5" fill="none" stroke="var(--ink)" strokeWidth="7.5" strokeLinecap="round" />
      <path d="M50.5 43.5 L50.5 34 L38 34" fill="none" stroke="var(--ink)" strokeWidth="7.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* oczy */}
      <ellipse cx="24" cy="31" rx="3" ry="3.6" fill="var(--ink)" />
      <ellipse cx="36" cy="31" rx="3" ry="3.6" fill="var(--ink)" />
      {/* nos i pyszczek */}
      <path d="M28.4 39 L31.6 39 L30 41 Z" fill="var(--amber)" />
      <path d="M30 41 L30 43 M30 43 Q27.4 43.8 26.2 42.2 M30 43 Q32.6 43.8 33.8 42.2" fill="none" stroke="var(--ink)" strokeWidth="1.6" strokeLinecap="round" />
      {/* wąsy jak tor narzędzia */}
      <path d="M14 37 L22.5 38.5 M14.5 42.5 L22.5 41.5" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" opacity=".65" />
      <path d="M50 37 L41.5 38.5 M49.5 42.5 L41.5 41.5" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" opacity=".65" />
    </svg>
  );
}
