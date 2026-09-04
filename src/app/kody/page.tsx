import CodeTable from "./CodeTable";
import { gcodes } from "@/lib/gcodes";

export const metadata = { title: "Lista kodów G i M — GCat" };

export default function KodyPage() {
  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold">Kody G i M</h1>
        <p className="text-muted">Kliknij kod, żeby zobaczyć składnię Fanuc i Sinumerik, przykład i animację.</p>
      </div>
      <CodeTable items={gcodes} />
    </div>
  );
}
