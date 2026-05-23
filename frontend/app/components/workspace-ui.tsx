import type { HTMLAttributes, ReactNode } from "react";

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

type SharedStateProps = {
  title: string;
  description?: string;
  className?: string;
  children?: ReactNode;
};

type StateFrameProps = SharedStateProps & {
  variant: "empty" | "loading" | "error";
  role?: "status" | "alert";
  ariaLive?: "polite" | "assertive";
  showSpinner?: boolean;
};

function StateFrame({
  variant,
  title,
  description,
  className = "",
  children,
  role,
  ariaLive,
  showSpinner = false
}: StateFrameProps) {
  const classes = ["state-block", variant, className].filter(Boolean).join(" ");

  return (
    <section
      className={classes}
      role={role}
      aria-live={ariaLive}
      aria-busy={variant === "loading" ? true : undefined}
    >
      {showSpinner ? <span className="state-spinner" aria-hidden="true" /> : null}
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
      {children ? <div className="action-bar">{children}</div> : null}
    </section>
  );
}

export function EmptyState({ title, description, className = "", children }: SharedStateProps) {
  return (
    <StateFrame variant="empty" title={title} description={description} className={className}>
      {children}
    </StateFrame>
  );
}

type LoadingStateProps = Omit<SharedStateProps, "title"> & { title?: string };

export function LoadingState({
  title = "Loading",
  description,
  className = "",
  children
}: LoadingStateProps) {
  return (
    <StateFrame
      variant="loading"
      title={title}
      description={description}
      className={className}
      role="status"
      ariaLive="polite"
      showSpinner
    >
      {children}
    </StateFrame>
  );
}

type ErrorStateProps = Omit<SharedStateProps, "title"> & { title?: string };

export function ErrorState({
  title = "Something went wrong",
  description,
  className = "",
  children
}: ErrorStateProps) {
  return (
    <StateFrame
      variant="error"
      title={title}
      description={description}
      className={className}
      role="alert"
      ariaLive="assertive"
    >
      {children}
    </StateFrame>
  );
}

type FieldHintTone = "neutral" | "good" | "warning" | "danger";

type FieldHintProps = HTMLAttributes<HTMLParagraphElement> & {
  children: ReactNode;
  tone?: FieldHintTone;
};

export function FieldHint({ children, tone = "neutral", className = "", ...props }: FieldHintProps) {
  const classes = ["field-hint", tone, className].filter(Boolean).join(" ");
  return (
    <p className={classes} {...props}>
      {children}
    </p>
  );
}
