import PageBanner from "@/components/ui/PageBanner";
import CodeTable from "./CodeTable";
import { gcodes } from "@/lib/gcodes";

export const metadata = {
  title: "Lista kodów G i M — GCat",
  description: "Karty kodów G i M frezarki i tokarki: składnia Fanuc i Sinumerik, przykład programu, typowe błędy i różnice sterowań — po polsku.",
};

export default function KodyPage() {
  return (
    <div className="grid gap-5">
      <PageBanner src="/img/banner-kody.jpg" kicker="Referencja" title="Kody G i M"
        subtitle="Składnia Fanuc i Sinumerik i przykład dla każdego kodu; animacja tam, gdzie symulator ją odtwarza." priority />
      <CodeTable items={gcodes} />
    </div>
  );
}
