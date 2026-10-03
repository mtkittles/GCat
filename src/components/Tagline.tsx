/* Hasło marki: Ucz się · Programuj · Skrawaj — „Programuj” w kolorze akcentu. */
export default function Tagline() {
  return (
    <span className="gcat-tagline">
      Ucz się <span aria-hidden="true" style={{ opacity: 0.5 }}>·</span>{" "}
      <span style={{ color: "var(--brand-accent, #F97316)" }}>Programuj</span>{" "}
      <span aria-hidden="true" style={{ opacity: 0.5 }}>·</span> Skrawaj
    </span>
  );
}
