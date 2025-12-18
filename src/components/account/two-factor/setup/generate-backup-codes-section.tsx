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
import { BackupCodesDisplay } from "./backup-codes-display";

const passwordFormSchema = z.object({
  password: passwordSchema,
});

export function GenerateBackupCodesSection() {
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [isGeneratingBackupCodes, setIsGeneratingBackupCodes] =
    useState(false);

  const backupCodesForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
    },
  });

  const handleGenerateBackupCodes = async (
    data: z.infer<typeof passwordFormSchema>,
  ) => {
    setIsGeneratingBackupCodes(true);
    try {
      const { data: result, error } =
        await authClient.twoFactor.generateBackupCodes({
          password: data.password,
        });

      if (error) {
        toast.error(error.message ?? "Failed to generate backup codes");
        return;
      }

      if (result) {
        setBackupCodes(result.backupCodes);
        backupCodesForm.reset();
        toast.success("New backup codes generated");
      }
    } catch (err) {
      console.error("Generate backup codes error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsGeneratingBackupCodes(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h4 className="font-medium">Generate New Backup Codes</h4>
      <p className="text-muted-foreground text-sm">
        Generate new backup codes. This will invalidate your old backup codes.
      </p>
      <form
        onSubmit={backupCodesForm.handleSubmit(handleGenerateBackupCodes)}
      >
        <FieldGroup className="gap-4">
          <Field>
            <Input
              type="password"
              placeholder="Enter your password"
              {...backupCodesForm.register("password")}
            />
            <FieldError>
              {backupCodesForm.formState.errors.password?.message}
            </FieldError>
          </Field>
          <Field>
            <div>
              <Button
                type="submit"
                variant="outline"
                disabled={isGeneratingBackupCodes}
              >
                {isGeneratingBackupCodes
                  ? "Generating..."
                  : "Generate New Backup Codes"}
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </form>

      {backupCodes && (
        <div className="mt-2">
          <BackupCodesDisplay
            backupCodes={backupCodes}
            title="Your new backup codes:"
            description=""
          />
        </div>
      )}
    </div>
  );
}
