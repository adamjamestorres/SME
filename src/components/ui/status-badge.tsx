import { cx } from "./styles";

// Mirrors the status columns in the database schema (#5).
export const statuses = {
  lead: ["new", "contacted", "converted", "closed"],
  payment: ["open", "processing", "paid", "canceled"],
  document: ["open", "signed", "voided"],
} as const;

type Kind = keyof typeof statuses;
type Tone = "info" | "warning" | "success" | "danger" | "neutral";

const tones: { [K in Kind]: Record<(typeof statuses)[K][number], { tone: Tone; label: string }> } = {
  lead: {
    new: { tone: "info", label: "New" },
    contacted: { tone: "warning", label: "Contacted" },
    converted: { tone: "success", label: "Converted" },
    closed: { tone: "neutral", label: "Closed" },
  },
  payment: {
    open: { tone: "info", label: "Unpaid" },
    processing: { tone: "warning", label: "Processing" },
    paid: { tone: "success", label: "Paid" },
    canceled: { tone: "neutral", label: "Canceled" },
  },
  document: {
    open: { tone: "info", label: "Awaiting signature" },
    signed: { tone: "success", label: "Signed" },
    voided: { tone: "neutral", label: "Voided" },
  },
};

const toneClasses: Record<Tone, string> = {
  info: "bg-info text-info-ink",
  warning: "bg-warning text-warning-ink",
  success: "bg-success text-success-ink",
  danger: "bg-danger text-danger-ink",
  neutral: "border border-line bg-surface-raised text-muted",
};

type StatusBadgeProps = {
  [K in Kind]: { kind: K; status: (typeof statuses)[K][number]; className?: string };
}[Kind];

export function StatusBadge({ kind, status, className }: StatusBadgeProps) {
  // Fall back to a neutral badge if the data holds a status this map doesn't know yet.
  const { tone, label } = (tones[kind] as Record<string, { tone: Tone; label: string }>)[status] ?? {
    tone: "neutral",
    label: status,
  };
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase",
        toneClasses[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
