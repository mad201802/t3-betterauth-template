"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/server/better-auth/client";
import { useRedirectParam } from "@/hooks/use-redirect-param";
import { toast } from "sonner";
import { REGEXP_ONLY_DIGITS } from "input-otp";

export default function Verify2FAPage() {
  const router = useRouter();
  const redirectTo = useRedirectParam();
  const [isLoading, setIsLoading] = useState(false);
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [code, setCode] = useState("");
  const [backupCode, setBackupCode] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const verificationCode = showBackupCode ? backupCode : code;
    
    if (!verificationCode || verificationCode.length < 6) {
      toast.error("Please enter a valid code");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = showBackupCode 
        ? await authClient.twoFactor.verifyBackupCode({
            code: verificationCode,
          })
        : await authClient.twoFactor.verifyTotp({
            code: verificationCode,
            trustDevice: true,
          });

      if (error) {
        toast.error(error.message ?? "Failed to verify code");
      } else {
        toast.success("2FA verified successfully");
        router.push(redirectTo ?? "/dashboard");
      }
    } catch (err) {
      console.error("2FA verification error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4")}>
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            {showBackupCode 
              ? "Enter one of your backup codes to verify your identity"
              : "Enter the 6-digit code from your authenticator app"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {showBackupCode ? (
              <Field>
                <FieldGroup>
                  <FieldLabel htmlFor="backup-code">Backup Code</FieldLabel>
                  <Input
                    id="backup-code"
                    type="text"
                    placeholder="Enter backup code"
                    autoComplete="one-time-code"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value)}
                  />
                  <FieldDescription>
                    Use one of the backup codes you saved when enabling 2FA
                  </FieldDescription>
                </FieldGroup>
              </Field>
            ) : (
              <Field>
                <FieldGroup>
                  <FieldLabel>Authentication Code</FieldLabel>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS}
                      value={code}
                      onChange={setCode}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <FieldDescription className="text-center">
                    Open your authenticator app to get your verification code
                  </FieldDescription>
                </FieldGroup>
              </Field>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  setShowBackupCode(!showBackupCode);
                  setCode("");
                  setBackupCode("");
                }}
                className="text-sm"
              >
                {showBackupCode 
                  ? "Use authenticator code instead" 
                  : "Use backup code instead"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
