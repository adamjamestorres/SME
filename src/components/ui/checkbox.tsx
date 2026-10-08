import { useId, type ComponentProps } from "react";
import { cx, focusRing } from "./styles";
import { FieldMessages, fieldAria, type FieldProps } from "./field";

type CheckboxProps = Omit<ComponentProps<"input">, "type" | "children"> & FieldProps;

export function Checkbox({ label, hint, error, id, "aria-describedby": describedBy, className, ...props }: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  return (
    <div className="flex flex-col gap-1">
      {/* The whole row is the touch target, at least 44px tall. */}
      <label htmlFor={checkboxId} className="flex min-h-11 cursor-pointer items-center gap-3 text-base text-fg">
        <input
          id={checkboxId}
          type="checkbox"
          className={cx("size-5 shrink-0 cursor-pointer rounded-sm accent-brand", focusRing, className)}
          {...props}
          {...fieldAria(checkboxId, { hint, error, describedBy })}
        />
        <span>{label}</span>
      </label>
      <div className="pl-8">
        <FieldMessages id={checkboxId} hint={hint} error={error} />
      </div>
    </div>
  );
}
