import type { Track } from "@/lib/course";

/*
  Stan detalu przewodniego po kolejnych lekcjach — do rysunku nad programem narastającym.
  `since` to lekcja, w której program zaczyna obrabiać dany element (zgodnie z buildup.ts).
  Klucze `id` odpowiadają elementom rysowanym w PartState.tsx.
*/

export interface PartFeature { id: string; since: string; label: string }

export const partFeatures: Record<Track, PartFeature[]> = {
  frezowanie: [
    { id: "contour", since: "F3.2", label: "kontur 80 × 50 na głębokość 5" },
    { id: "corners", since: "F3.3", label: "naroża R10" },
    { id: "spot", since: "F5.1", label: "4 nawiercenia" },
    { id: "drill", since: "F5.2", label: "4 otwory Ø5 gł. 18" },
    { id: "tap", since: "F5.3", label: "gwint M6 w 4 otworach" },
    { id: "face", since: "F6.1", label: "górna powierzchnia splanowana do Z0" },
    { id: "pocket", since: "F6.2", label: "kieszeń 26 × 20 R6 gł. 4" },
    { id: "circle", since: "F6.3", label: "kieszeń Ø20 gł. 4" },
  ],
  toczenie: [
    { id: "face", since: "T2.3", label: "splanowane czoło" },
    { id: "rough", since: "T3.1", label: "toczenie zgrubne na Ø36,4" },
    { id: "steps", since: "T3.2", label: "stopnie Ø20, Ø30, Ø36 z fazami" },
    { id: "radii", since: "T3.3", label: "zaokrąglenia R1 i R0,5 na stopniu Ø30 → Ø36" },
    { id: "groove", since: "T6.1", label: "podcięcie Ø17 pod gwint" },
    { id: "hole", since: "T6.2", label: "otwór osiowy Ø8 gł. 15" },
    { id: "thread", since: "T7.1", label: "gwint M20 × 1,5" },
  ],
};
