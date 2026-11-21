import type { ReactNode } from "react";
import Breadcrumbs from "./Breadcrumbs";

/*
  Nagłówek podstrony (UI-6, docs/standard-ui.md → „Szkielet podstrony”): okruszki, tytuł z liczbą szarym tekstem,
  opis 16 px. Bez napisów wersalikami nad tytułem. `aside` — element po prawej (postęp, wybór talii),
  na telefonie pod opisem; `icon` — ikona działu przed tytułem.
*/
export interface PageHeadProps {
  title: ReactNode;
  /** liczba elementów, np. „55 kart” — szarym tekstem przy tytule */
  count?: ReactNode;
  lead?: ReactNode;
  crumbs?: { href?: string; label: string }[];
  icon?: ReactNode;
  aside?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export default function PageHead({ title, count, lead, crumbs, icon, aside, className, children }: PageHeadProps) {
  return (
    <>
      {crumbs && <Breadcrumbs items={crumbs} />}
      <header className={`ph${aside ? " has-aside" : ""}${icon ? " has-icon" : ""}${className ? ` ${className}` : ""}`}>
        {icon && <span className="ph-ico" aria-hidden>{icon}</span>}
        <div className="ph-main">
          <h1 className="ph-title">{title}{count !== undefined && <> <span className="ph-n">{count}</span></>}</h1>
          {lead && <p className="ph-lead">{lead}</p>}
          {children}
        </div>
        {aside && <div className="ph-aside">{aside}</div>}
      </header>
    </>
  );
}
