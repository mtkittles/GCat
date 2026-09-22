import PageBanner from "@/components/ui/PageBanner";
import CodeTable from "./CodeTable";
import { gcodes } from "@/lib/gcodes";

export const metadata = { title: "Lista kodów G i M — GCat" };

export default function KodyPage() {
  return (
    <div className="grid gap-5">
      <PageBanner src="/img/banner-drill.jpg" kicker="Referencja" title="Kody G i M"
        subtitle="Składnia Fanuc i Sinumerik, przykład i animacja dla każdego kodu." priority />
      <CodeTable items={gcodes} />
    </div>
  );
}
