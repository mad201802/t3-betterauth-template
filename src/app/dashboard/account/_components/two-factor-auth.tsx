"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import QRCode from "react-qr-code";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@/components/ui/badge";
import { passwordSchema } from "@/lib/validation-schemas";
import { APP_CONFIG } from "@/config";

const passwordFormSchema = z.object({
  password: passwordSchema,
});

const verifyCodeSchema = z.object({
  code: z.string().min(6, "Code must be 6 characters").max(6, "Code must be 6 characters"),
});

interface TwoFactorAuthProps {
  twoFactorEnabled: boolean;
  hasCredentialsAccount: boolean;
}

export default function TwoFactorAuth({
  twoFactorEnabled: initialTwoFactorEnabled,
  hasCredentialsAccount,
}: TwoFactorAuthProps) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialTwoFactorEnabled);
  const [isEnabling, setIsEnabling] = useState(false);
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      password: "",
    },
  });

  const verifyForm = useForm<z.infer<typeof verifyCodeSchema>>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code: "",
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
        setTotpUri(result.totpURI);
        setBackupCodes(result.backupCodes);
        setIsEnabling(true);
        toast.success("Scan the QR code with your authenticator app");
      }
    } catch (err) {
      console.error("Enable 2FA error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
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

      toast.success("2FA enabled successfully!");
      setTwoFactorEnabled(true);
      setIsEnabling(false);
      setTotpUri(null);
      setBackupCodes(null);
      verifyForm.reset();
      passwordForm.reset();
    } catch (err) {
      console.error("Verify code error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async (data: z.infer<typeof passwordFormSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await authClient.twoFactor.disable({
        password: data.password,
      });

      if (error) {
        toast.error(error.message ?? "Failed to disable 2FA");
        return;
      }

      toast.success("2FA disabled successfully");
      setTwoFactorEnabled(false);
      passwordForm.reset();
    } catch (err) {
      console.error("Disable 2FA error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBackupCodes = async (data: z.infer<typeof passwordFormSchema>) => {
    setIsLoading(true);
    try {
      const { data: result, error } = await authClient.twoFactor.generateBackupCodes({
        password: data.password,
      });

      if (error) {
        toast.error(error.message ?? "Failed to generate backup codes");
        return;
      }

      if (result) {
        setBackupCodes(result.backupCodes);
        toast.success("New backup codes generated");
      }
    } catch (err) {
      console.error("Generate backup codes error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    if (backupCodes) {
      void navigator.clipboard.writeText(backupCodes.join("\n"));
      toast.success("Backup codes copied to clipboard");
    }
  };

  if (!hasCredentialsAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Two-factor authentication is only available for accounts with email/password login.
            Please add a password to your account first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </div>
          {twoFactorEnabled && (
            <Badge variant="default" className="bg-green-600">
              Enabled
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!twoFactorEnabled && !isEnabling && (
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
                <FieldError>{passwordForm.formState.errors.password?.message}</FieldError>
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
        )}

        {isEnabling && totpUri && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <h4 className="font-medium">1. Scan QR Code</h4>
              <p className="text-sm text-muted-foreground">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className="flex justify-center p-2 bg-white rounded-lg">
                <QRCode value={totpUri} size={APP_CONFIG.ui.qrCodeSize} />
              </div>
            </div>

            {backupCodes && (
              <div className="flex flex-col gap-2">
                <h4 className="font-medium">2. Save Backup Codes</h4>
                <p className="text-sm text-muted-foreground">
                  Store these backup codes in a safe place. You can use them to access your account if you lose your device.
                </p>
                <div className="bg-muted p-2 rounded-lg flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {backupCodes.map((code, index) => (
                      <div key={index}>{code}</div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyBackupCodes}
                  >
                    Copy Codes
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <h4 className="font-medium">3. Verify Code</h4>
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app to complete setup
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
                    <FieldError>{verifyForm.formState.errors.code?.message}</FieldError>
                  </Field>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Verifying..." : "Verify & Enable"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEnabling(false);
                        setTotpUri(null);
                        setBackupCodes(null);
                        passwordForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </FieldGroup>
              </form>
            </div>
          </div>
        )}

        {twoFactorEnabled && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <h4 className="font-medium">Generate New Backup Codes</h4>
              <p className="text-sm text-muted-foreground">
                Generate new backup codes. This will invalidate your old backup codes.
              </p>
              <form onSubmit={passwordForm.handleSubmit(handleGenerateBackupCodes)}>
                <FieldGroup className="gap-4">
                  <Field>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...passwordForm.register("password")}
                    />
                    <FieldError>{passwordForm.formState.errors.password?.message}</FieldError>
                  </Field>
                  <Field>
                    <div>
                      <Button type="submit" variant="outline" disabled={isLoading}>
                        {isLoading ? "Generating..." : "Generate New Backup Codes"}
                      </Button>
                    </div>
                  </Field>
                </FieldGroup>
              </form>

              {backupCodes && (
                <div className="flex flex-col gap-2 mt-2">
                  <p className="text-sm font-medium">Your new backup codes:</p>
                  <div className="bg-muted p-2 rounded-lg flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                      {backupCodes.map((code, index) => (
                        <div key={index}>{code}</div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyBackupCodes}
                    >
                      Copy Codes
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t flex flex-col gap-2">
              <h4 className="font-medium">Disable Two-Factor Authentication</h4>
              <p className="text-sm text-muted-foreground">
                This will remove the extra security layer from your account.
              </p>
              <form onSubmit={passwordForm.handleSubmit(handleDisable2FA)}>
                <FieldGroup className="gap-4">
                  <Field>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...passwordForm.register("password")}
                    />
                    <FieldError>{passwordForm.formState.errors.password?.message}</FieldError>
                  </Field>
                  <Field>
                    <div>
                      <Button type="submit" variant="destructive" disabled={isLoading}>
                        {isLoading ? "Disabling..." : "Disable 2FA"}
                      </Button>
                    </div>
                  </Field>
                </FieldGroup>
              </form>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
