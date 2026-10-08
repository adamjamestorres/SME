import { cx, focusRing } from "./styles";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand font-bold text-brand-ink hover:bg-brand-hover",
  secondary: "border border-line bg-surface-raised font-semibold text-fg hover:border-muted",
  ghost: "font-semibold text-fg hover:bg-surface-raised",
  danger: "bg-danger font-bold text-danger-ink hover:bg-danger/90",
};

// Both sizes stay at least 44px tall for touch.
const sizes: Record<ButtonSize, string> = {
  md: "min-h-11 gap-2 px-4 text-base",
  lg: "min-h-12 gap-2.5 px-6 text-lg",
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}): string {
  return cx(
    "inline-flex items-center justify-center rounded-control font-display tracking-wide uppercase transition-colors",
    "disabled:cursor-not-allowed disabled:opacity-60",
    focusRing,
    variants[variant],
    sizes[size],
    className,
  );
}
