import { useId, type ComponentProps } from "react";
import { cx, focusRing } from "./styles";
import { controlClasses, FieldLabel, FieldMessages, fieldAria, type FieldProps } from "./field";

type TextareaProps = Omit<ComponentProps<"textarea">, "children"> & FieldProps;

export function Textarea({ label, hint, error, id, rows = 4, className, ...props }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={textareaId}>{label}</FieldLabel>
      <textarea
        id={textareaId}
        rows={rows}
        className={cx(controlClasses, "py-2.5", focusRing, className)}
        {...fieldAria(textareaId, { hint, error })}
        {...props}
      />
      <FieldMessages id={textareaId} hint={hint} error={error} />
    </div>
  );
}
