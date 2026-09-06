/*
  Techniczna kompozycja do sekcji otwierającej: siatka współrzędnych,
  osie XY, tor narzędzia z węzłami i aktywnym punktem.
  Buduje klimat CNC bez fotografii stockowych.
*/
export default function TechGrid({ className = "" }: { className?: string }) {
  const cells = [];
  for (let i = 0; i <= 12; i++) cells.push(i);
  return (
    <svg viewBox="0 0 480 300" className={`techgrid ${className}`} aria-hidden="true">
      <defs>
        <linearGradient id="tg-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F97316" stopOpacity=".22" />
          <stop offset="1" stopColor="#F97316" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g stroke="currentColor" strokeOpacity=".14" strokeWidth="1">
        {cells.map((i) => <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="300" />)}
        {cells.slice(0, 8).map((i) => <line key={`h${i}`} x1="0" y1={i * 40} x2="480" y2="300 " />)}
      </g>
      <g stroke="currentColor" strokeOpacity=".14" strokeWidth="1">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <line key={`hh${i}`} x1="0" y1={i * 40} x2="480" y2={i * 40} />)}
      </g>
      {/* osie */}
      <g stroke="currentColor" strokeOpacity=".45" strokeWidth="1.5">
        <line x1="60" y1="240" x2="430" y2="240" />
        <line x1="60" y1="240" x2="60" y2="40" />
      </g>
      <text x="424" y="257" fontSize="11" fill="currentColor" fillOpacity=".55" fontFamily="var(--font-mono)">X</text>
      <text x="46" y="46" fontSize="11" fill="currentColor" fillOpacity=".55" fontFamily="var(--font-mono)">Y</text>
      {/* tor: ruch szybki + roboczy + łuk */}
      <path d="M60 240 L110 200" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5 4" fill="none" />
      <path d="M110 200 L230 200 A60 60 0 0 1 290 140 L290 90" stroke="#F97316" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M290 90 L390 90" stroke="#F97316" strokeWidth="2.5" strokeOpacity=".35" fill="none" strokeLinecap="round" />
      <path d="M110 200 L230 200 A60 60 0 0 1 290 140 L290 240 L110 240 Z" fill="url(#tg-fade)" />
      {/* węzły */}
      {[[110, 200], [230, 200], [290, 140], [290, 90]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" fill="none" stroke="#F97316" strokeWidth="1.6" />
      ))}
      {/* aktywny punkt narzędzia */}
      <circle cx="290" cy="90" r="7" fill="#F97316" />
      <circle cx="290" cy="90" r="13" fill="none" stroke="#F97316" strokeOpacity=".45" strokeWidth="1.5" />
      <text x="302" y="86" fontSize="10.5" fill="#F97316" fontFamily="var(--font-mono)">X290 Y90</text>
      <text x="150" y="192" fontSize="10" fill="currentColor" fillOpacity=".5" fontFamily="var(--font-mono)">G01</text>
      <text x="252" y="160" fontSize="10" fill="currentColor" fillOpacity=".5" fontFamily="var(--font-mono)">G03 R60</text>
      <text x="70" y="222" fontSize="10" fill="currentColor" fillOpacity=".4" fontFamily="var(--font-mono)">G00</text>
    </svg>
  );
}
