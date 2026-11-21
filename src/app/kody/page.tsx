import CodeCatalog from "./CodeCatalog";
import { gcodes } from "@/lib/gcodes";
import { pl } from "@/lib/plural";

export const metadata = {
  title: "Lista kodów G i M — GCat",
  description: "Karty kodów G i M frezarki i tokarki: składnia Fanuc i Sinumerik, przykład programu, typowe błędy i różnice sterowań — po polsku.",
};

export default function KodyPage() {
  return (
    <div className="grid gap-5">
      <header className="ph">
        <h1 className="ph-title">Katalog kodów G i M <span className="ph-n">{pl(gcodes.length, "karta", "karty", "kart")}</span></h1>
        <p className="ph-lead">Składnia Fanuc i Sinumerik, przykład dla każdego kodu i animacja tam, gdzie symulator ją odtwarza. Kliknij kartę, żeby zobaczyć szczegóły bez wychodzenia z listy.</p>
      </header>
      <CodeCatalog items={gcodes} />
    </div>
  );
}
