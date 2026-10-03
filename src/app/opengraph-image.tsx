import { ImageResponse } from "next/og";

export const alt = "GCat — nauka G-kodu po polsku";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 72, background: "linear-gradient(160deg, #1A1B1F 0%, #0F1012 70%)", color: "#fff", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#F97316", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 800, color: "#111" }}>G</div>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>GCat</div>
        </div>
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>Naucz się czytać i pisać G‑kod.</div>
        <div style={{ fontSize: 28, color: "#A1A4AB", marginTop: 22 }}>Lekcje frezowania i toczenia · symulator 2D/3D · karty kodów Fanuc i Sinumerik</div>
        <div style={{ position: "absolute", top: 60, right: 72, fontSize: 22, color: "#F97316", letterSpacing: 6, fontFamily: "monospace" }}>UCZ SIĘ · PROGRAMUJ · SKRAWAJ</div>
      </div>
    ),
    size,
  );
}
