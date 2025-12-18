import type {
  ControllerFieldState,
  ControllerRenderProps,
} from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface TextFieldProps {
  label: string;
  id?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: ControllerRenderProps<any, any>;
  fieldState: ControllerFieldState;
}

/**
 * Reusable text input field component for react-hook-form Controller
 * Handles label, input, and error display
 */
export function TextField({
  label,
  id,
  placeholder,
  type = "text",
  disabled = false,
  required = false,
  autoComplete,
  field,
  fieldState,
}: TextFieldProps) {
  return (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        {...field}
        id={id}
        aria-invalid={fieldState.invalid}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  );
}

interface EmailFieldProps {
  id?: string;
  disabled?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: ControllerRenderProps<any, any>;
  fieldState: ControllerFieldState;
}

/**
 * Specialized email input field
 */
export function EmailField({
  id,
  disabled,
  field,
  fieldState,
}: EmailFieldProps) {
  return (
    <TextField
      label="Email"
      id={id}
      placeholder="m@example.com"
      type="email"
      disabled={disabled}
      required
      field={field}
      fieldState={fieldState}
    />
  );
}
