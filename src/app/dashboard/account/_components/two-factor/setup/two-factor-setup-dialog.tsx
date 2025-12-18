"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import { authClient } from "@/server/better-auth/client";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { APP_CONFIG } from "@/config";
import { BackupCodesDisplay } from "./backup-codes-display";

const verifyCodeSchema = z.object({
  code: z
    .string()
    .min(6, "Code must be 6 characters")
    .max(6, "Code must be 6 characters"),
});

interface TwoFactorSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totpUri: string;
  backupCodes: string[];
  onSuccess: () => void;
}

export function TwoFactorSetupDialog({
  open,
  onOpenChange,
  totpUri,
  backupCodes,
  onSuccess,
}: TwoFactorSetupDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true);

  const verifyForm = useForm<z.infer<typeof verifyCodeSchema>>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code: "",
    },
  });

  const extractSecretFromUri = (uri: string): string => {
    try {
      const url = new URL(uri);
      return url.searchParams.get("secret") ?? "";
    } catch {
      return "";
    }
  };

  const copySecret = (secret: string) => {
    void navigator.clipboard.writeText(secret);
    toast.success("Secret key copied to clipboard");
  };

  const handleVerifyCode = async (data: z.infer<typeof verifyCodeSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await authClient.twoFactor.verifyTotp({
        code: data.code,
      });

      if (error) {
        toast.error(error.message ?? "Invalid code");
        return;
      }

      if (revokeOtherSessions) {
        await authClient.revokeOtherSessions();
      }

      toast.success("2FA enabled successfully!");
      verifyForm.reset();
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error("Verify code error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Follow the steps below to secure your account with 2FA
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* Step 1: QR Code */}
          <div className="flex flex-col gap-2">
            <h4 className="font-medium">1. Scan QR Code</h4>
            <p className="text-muted-foreground text-sm">
              Scan this QR code with your authenticator app (Google
              Authenticator, Authy, etc.)
            </p>
            <div className="bg-muted flex flex-col items-center gap-4 rounded-xl border-2 border-border p-6">
              <div className="rounded-xl bg-white p-4 shadow-lg">
                <QRCode value={totpUri} size={APP_CONFIG.ui.qrCodeSize} />
              </div>
              <div className="flex w-full flex-col gap-2">
                <p className="text-muted-foreground text-center text-xs">
                  Can&apos;t scan the code? Enter this key manually:
                </p>
                <div className="bg-background flex items-center justify-between gap-2 rounded-lg border p-3">
                  <code className="text-xs font-mono break-all">
                    {extractSecretFromUri(totpUri)}
                  </code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copySecret(extractSecretFromUri(totpUri))}
                    className="shrink-0"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Backup Codes */}
          <BackupCodesDisplay
            backupCodes={backupCodes}
            title="2. Save Backup Codes"
          />

          {/* Step 3: Verify */}
          <div className="flex flex-col gap-2">
            <h4 className="font-medium">3. Verify Code</h4>
            <p className="text-muted-foreground text-sm">
              Enter the 6-digit code from your authenticator app to complete
              setup
            </p>
            <form onSubmit={verifyForm.handleSubmit(handleVerifyCode)}>
              <FieldGroup className="gap-4">
                <Field>
                  <Input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    {...verifyForm.register("code")}
                  />
                  <FieldError>
                    {verifyForm.formState.errors.code?.message}
                  </FieldError>
                </Field>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="revoke-sessions"
                    checked={revokeOtherSessions}
                    onCheckedChange={(checked) =>
                      setRevokeOtherSessions(checked === true)
                    }
                  />
                  <label
                    htmlFor="revoke-sessions"
                    className="text-sm cursor-pointer"
                  >
                    Log out all other sessions for security
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Verify & Enable"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      verifyForm.reset();
                      onOpenChange(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
