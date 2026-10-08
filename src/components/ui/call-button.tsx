import type { ComponentProps } from "react";
import { PhoneIcon } from "@/components/icons";
import { site } from "@/config/site";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./button-styles";

type CallButtonProps = Omit<ComponentProps<"a">, "href"> & {
  /** E.164 number. Defaults to the shop's number. */
  tel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function CallButton({
  tel = site.phone.tel,
  variant,
  size,
  className,
  children = "Call now",
  ...props
}: CallButtonProps) {
  return (
    <a href={`tel:${tel}`} className={buttonClasses({ variant, size, className })} {...props}>
      <PhoneIcon className={size === "lg" ? "size-5" : "size-4"} />
      {children}
    </a>
  );
}
