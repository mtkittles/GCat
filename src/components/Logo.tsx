/*
  Znak GCat — geometryczna głowa kota tworząca literę G.
  Kanciasty, techniczny rysunek: ostre uszy, otwarty pierścień litery
  z poprzeczką, pomarańczowy akcent w miejscu oka i pyszczka.
*/
export default function Logo({ size = 32, mono = false }: { size?: number; mono?: boolean }) {
  const ink = mono ? "currentColor" : "var(--brand-ink)";
  const accent = mono ? "currentColor" : "var(--brand-accent)";
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="gcat-logo">
      {/* uszy */}
      <path d="M8 26 L10 4 L30 17 Z" fill={ink} />
      <path d="M56 26 L54 4 L38 15 Z" fill={ink} />
      {/* głowa jako litera G: kanciasty pierścień otwarty po prawej */}
      <path d="M46 20 L30 20 L20 28 L20 40 L30 48 L42 48 L42 38 L33 38"
        fill="none" stroke={ink} strokeWidth="9" strokeLinejoin="miter" strokeLinecap="butt" />
      {/* akcent: skos oka i policzka */}
      <path d="M36 24 L52 24 L44 33 Z" fill={accent} />
      {/* pyszczek */}
      <path d="M27 41 L33 41 L30 45 Z" fill={accent} />
    </svg>
  );
}

/** Znak z sygnaturą tekstową — do nagłówka i stopki. */
export function Wordmark({ size = 30 }: { size?: number }) {
  return (
    <span className="wordmark">
      <Logo size={size} />
      <span className="wordmark-text"><b>G</b>Cat</span>
    </span>
  );
}
