import type { ReactNode } from "react";

import type { Metric, RiskLevel } from "@/app/lib/workspace-data";

type PanelProps = {
  title: string;
  meta?: string;
  className?: string;
  children: ReactNode;
};

export function Panel({ title, meta, className = "", children }: PanelProps) {
  return (
    <article className={`panel ${className}`}>
      <div className="panel-heading">
        <h3>{title}</h3>
        {meta ? <span>{meta}</span> : null}
      </div>
      {children}
    </article>
  );
}

export function MetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <section className="metric-grid" aria-label="Operational metrics">
      {metrics.map((metric) => (
        <article className="metric-card" key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <small>{metric.trend}</small>
        </article>
      ))}
    </section>
  );
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return <span className={`risk ${risk.toLowerCase()}`}>{risk}</span>;
}

export function StatusBadge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "good" | "warning" | "danger" | "neutral";
}) {
  return <span className={`status-badge ${tone}`}>{children}</span>;
}

export function ActionBar({ children }: { children: ReactNode }) {
  return <div className="action-bar">{children}</div>;
}
