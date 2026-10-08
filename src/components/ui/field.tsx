import type { ReactNode } from "react";

// Shared label, hint and error wiring for form controls.

export const controlClasses =
  "w-full rounded-control border border-line bg-surface px-3 text-base text-fg placeholder:text-muted transition-colors hover:border-muted aria-invalid:border-danger";

export type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
};

export function fieldAria(id: string, { hint, error }: Pick<FieldProps, "hint" | "error">) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");
  return {
    "aria-describedby": describedBy || undefined,
    "aria-invalid": error ? true : undefined,
  } as const;
}

export function FieldMessages({ id, hint, error }: { id: string } & Pick<FieldProps, "hint" | "error">) {
  return (
    <>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </>
  );
}

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-fg">
      {children}
    </label>
  );
}
