import { useId, type ComponentProps } from "react";
import { cx, focusRing } from "./styles";
import { controlClasses, FieldLabel, FieldMessages, fieldAria, type FieldProps } from "./field";

// `type`, `inputMode`, `autoComplete` and other input attributes pass straight through.
type InputProps = Omit<ComponentProps<"input">, "children"> & FieldProps;

export function Input({ label, hint, error, id, "aria-describedby": describedBy, className, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <input
        id={inputId}
        className={cx(controlClasses, "min-h-11", focusRing, className)}
        {...props}
        {...fieldAria(inputId, { hint, error, describedBy })}
      />
      <FieldMessages id={inputId} hint={hint} error={error} />
    </div>
  );
}
