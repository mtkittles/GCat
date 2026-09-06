import type { ReactNode } from "react";

export default function SectionHeader({ eyebrow, title, lead, action }: { eyebrow?: string; title: string; lead?: string; action?: ReactNode }) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="section-title">{title}</h2>
        {lead && <p className="section-lead">{lead}</p>}
      </div>
      {action}
    </div>
  );
}
