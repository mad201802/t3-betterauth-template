"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { authClient } from "@/server/better-auth/client";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordSchema } from "@/lib/validation-schemas";

const passwordFormSchema = z.object({
  password: passwordSchema,
});

interface Enable2FAFormProps {
  onSuccess: (data: { totpUri: string; backupCodes: string[] }) => void;
}

export function Enable2FAForm({ onSuccess }: Enable2FAFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
    },
  });

  const handleEnable2FA = async (data: z.infer<typeof passwordFormSchema>) => {
    setIsLoading(true);
    try {
      const { data: result, error } = await authClient.twoFactor.enable({
        password: data.password,
      });

      if (error) {
        toast.error(error.message ?? "Failed to enable 2FA");
        return;
      }

      if (result) {
        passwordForm.reset();
        onSuccess({
          totpUri: result.totpURI,
          backupCodes: result.backupCodes,
        });
      }
    } catch (err) {
      console.error("Enable 2FA error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={passwordForm.handleSubmit(handleEnable2FA)}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="enable-password">Password</FieldLabel>
          <Input
            id="enable-password"
            type="password"
            placeholder="Enter your password"
            {...passwordForm.register("password")}
          />
          <FieldError>
            {passwordForm.formState.errors.password?.message}
          </FieldError>
          <FieldDescription>
            Enter your password to enable two-factor authentication
          </FieldDescription>
        </Field>
        <Field>
          <div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enabling..." : "Enable 2FA"}
            </Button>
          </div>
        </Field>
      </FieldGroup>
    </form>
  );
}
