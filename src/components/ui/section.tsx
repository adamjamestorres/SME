import type { ComponentProps } from "react";
import { Container } from "./container";
import { cx } from "./styles";

// A page band with vertical rhythm and a centered container.
export function Section({ className, children, ...props }: ComponentProps<"section">) {
  return (
    <section className={cx("py-12 lg:py-20", className)} {...props}>
      <Container>{children}</Container>
    </section>
  );
}
