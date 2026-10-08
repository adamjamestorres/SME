import type { ComponentProps } from "react";
import { cx } from "./styles";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cx("rounded-card border border-line bg-surface-raised p-6 sm:p-8", className)}
      {...props}
    />
  );
}
