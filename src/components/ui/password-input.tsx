import { Eye, EyeOff } from "lucide-react";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";
import type { ControllerFieldState, ControllerRenderProps } from "react-hook-form";
import { useState } from "react";
import { Input } from "./input";
import { Button } from "./button";
import type { ReactNode } from "react";

interface PasswordFieldProps {
  label: string;
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: ControllerRenderProps<any, any>;
  fieldState: ControllerFieldState;
  labelAddon?: ReactNode;
}

export default function PasswordInputField({ label, id, field, fieldState, labelAddon }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Field data-invalid={fieldState.invalid}>
      <div className="flex items-center pt-3">
        <FieldLabel htmlFor={id}>
          {label}
        </FieldLabel>
        {labelAddon}
      </div>
      <div className="relative">
        <Input
          {...field}
          id={id}
          aria-invalid={fieldState.invalid}
          type={showPassword ? "text" : "password"}
          required
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </Field>
  );
}