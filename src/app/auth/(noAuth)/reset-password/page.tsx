"use client";

import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
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
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { z } from "zod";
import { authClient } from "@/server/better-auth/client";
import { createPasswordConfirmationSchema } from "@/lib/validation-schemas";
import { APP_CONFIG } from "@/config";
import { AuthFormFooter } from "@/components/auth-form-footer";

const resetPasswordFormSchema = createPasswordConfirmationSchema()
  .extend({
    newPassword: z
      .string()
      .min(
        APP_CONFIG.auth.passwordMinLength,
        `Password must be at least ${APP_CONFIG.auth.passwordMinLength} characters long`,
      ),
  })
  .omit({ password: true });

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError("Invalid or expired reset link. Please request a new one.");
    } else if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("No reset token found. Please request a new password reset.");
    }
  }, [searchParams]);

  const onSubmit = async (data: z.infer<typeof resetPasswordFormSchema>) => {
    if (!token) {
      setError("No reset token found. Please request a new password reset.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await authClient.resetPassword({
        newPassword: data.newPassword,
        token,
      });

      if (error) {
        setError(error.message ?? "Failed to reset password");
      } else {
        router.push(`${APP_CONFIG.routes.signIn}?reset=success`);
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="newPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-reset-password">
                      New Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-reset-password"
                      aria-invalid={fieldState.invalid}
                      type="password"
                      required
                      disabled={!token || !!error}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-reset-confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-reset-confirm-password"
                      aria-invalid={fieldState.invalid}
                      type="password"
                      required
                      disabled={!token || !!error}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {error && (
                <Field className="text-center">
                  <FieldError errors={[{ message: error }]} />
                </Field>
              )}
              <Field>
                <Button type="submit" disabled={isLoading || !token || !!error}>
                  {isLoading ? "Resetting..." : "Reset password"}
                </Button>
                <FieldDescription className="text-center">
                  Remember your password?{" "}
                  <Link href={APP_CONFIG.routes.signIn}>Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <AuthFormFooter />
    </div>
  );
}
