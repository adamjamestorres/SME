import { useId, type ComponentProps } from "react";
import { cx, focusRing } from "./styles";
import { controlClasses, FieldLabel, FieldMessages, fieldAria, type FieldProps } from "./field";

// Pass `<option>` elements as children.
type SelectProps = ComponentProps<"select"> & FieldProps;

export function Select({ label, hint, error, id, className, children, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={selectId}>{label}</FieldLabel>
      <select
        id={selectId}
        className={cx(controlClasses, "min-h-11", focusRing, className)}
        {...fieldAria(selectId, { hint, error })}
        {...props}
      >
        {children}
      </select>
      <FieldMessages id={selectId} hint={hint} error={error} />
    </div>
  );
}
