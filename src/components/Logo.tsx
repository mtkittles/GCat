export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      {/* głowa kota jako litera G: otwarty pierścień z uszami */}
      <path d="M52 32a20 20 0 1 1-6-14.3" fill="none" stroke="var(--ink)" strokeWidth="7" strokeLinecap="round" />
      <path d="M34 32h18" stroke="var(--ink)" strokeWidth="7" strokeLinecap="round" />
      <path d="M14 20 L18 6 L28 15" fill="var(--amber)" />
      <path d="M50 20 L46 6 L36 15" fill="var(--amber)" />
      <circle cx="25" cy="30" r="3" fill="var(--ink)" /><circle cx="39" cy="30" r="3" fill="var(--ink)" />
    </svg>
  );
}
