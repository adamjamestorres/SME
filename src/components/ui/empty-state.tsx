import type { ReactNode } from "react";

type EmptyStateProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  /** Usually a Button or LinkButton for the next step. */
  action?: ReactNode;
};

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line px-6 py-12 text-center">
      {icon && <div className="text-muted [&_svg]:size-8">{icon}</div>}
      <h2 className="font-display text-2xl font-semibold tracking-wide uppercase">{title}</h2>
      {description && <p className="max-w-sm text-pretty text-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
