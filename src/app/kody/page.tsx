import CodeCatalog from "./CodeCatalog";
import { gcodes } from "@/lib/gcodes";
import { pl } from "@/lib/plural";
import PageHead from "@/components/ui/PageHead";

export const metadata = {
  title: "Lista kodów G i M — GCat",
  description: "Karty kodów G i M frezarki i tokarki: składnia Fanuc i Sinumerik, przykład programu, typowe błędy i różnice sterowań — po polsku.",
};

export default function KodyPage() {
  return (
    <div className="grid gap-5">
      <PageHead title="Katalog kodów G i M" count={pl(gcodes.length, "karta", "karty", "kart")}
        lead="Składnia Fanuc i Sinumerik, przykład dla każdego kodu i animacja tam, gdzie symulator ją odtwarza. Kliknij kartę, żeby zobaczyć szczegóły bez wychodzenia z listy." />
      <CodeCatalog items={gcodes} />
    </div>
  );
}
