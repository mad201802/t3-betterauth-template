"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { authClient } from "@/server/better-auth/client";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordSchema } from "@/lib/validation-schemas";

const passwordFormSchema = z.object({
  password: passwordSchema,
});

interface Disable2FASectionProps {
  onDisableSuccess: () => void;
}

export function Disable2FASection({
  onDisableSuccess,
}: Disable2FASectionProps) {
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);

  const disableForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
    },
  });

  const handleDisable2FA = async (data: z.infer<typeof passwordFormSchema>) => {
    setIsDisabling2FA(true);
    try {
      const { error } = await authClient.twoFactor.disable({
        password: data.password,
      });

      if (error) {
        toast.error(error.message ?? "Failed to disable 2FA");
        return;
      }

      toast.success("2FA disabled successfully");
      disableForm.reset();
      onDisableSuccess();
    } catch (err) {
      console.error("Disable 2FA error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsDisabling2FA(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 border-t pt-2">
      <h4 className="font-medium">Disable Two-Factor Authentication</h4>
      <p className="text-muted-foreground text-sm">
        This will remove the extra security layer from your account.
      </p>
      <form onSubmit={disableForm.handleSubmit(handleDisable2FA)}>
        <FieldGroup className="gap-4">
          <Field>
            <Input
              type="password"
              placeholder="Enter your password"
              {...disableForm.register("password")}
            />
            <FieldError>
              {disableForm.formState.errors.password?.message}
            </FieldError>
          </Field>
          <Field>
            <div>
              <Button
                type="submit"
                variant="destructive"
                disabled={isDisabling2FA}
              >
                {isDisabling2FA ? "Disabling..." : "Disable 2FA"}
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
