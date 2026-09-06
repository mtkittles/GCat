import PageBanner from "@/components/ui/PageBanner";
import CodeTable from "./CodeTable";
import { gcodes } from "@/lib/gcodes";

export const metadata = { title: "Lista kodów G i M — GCat" };

export default function KodyPage() {
  return (
    <div className="grid gap-5">
      <PageBanner src="/img/banner-drill.jpg" title="Kody G i M" subtitle="Karty funkcji ze składnią Fanuc i Sinumerik." priority />
      <div>
        <h1 className="text-3xl font-bold">Kody G i M</h1>
        <p className="text-muted">Kliknij kod, żeby zobaczyć składnię Fanuc i Sinumerik, przykład i animację.</p>
      </div>
      <CodeTable items={gcodes} />
    </div>
  );
}
