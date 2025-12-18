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
} from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { authClient } from "@/server/better-auth/client";
import { useRedirectParam } from "@/hooks/use-redirect-param";
import PasswordInputField from "@/components/ui/password-input";
import { emailSchema, passwordSchema } from "@/lib/validation-schemas";
import { EmailField, TextField } from "@/components/ui/text-field";
import { AuthFormFooter } from "@/components/auth-form-footer";
import { APP_CONFIG } from "@/config";

const signUpFormSchema = z
  .object({
    name: z.string().min(2).max(50),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(APP_CONFIG.auth.passwordMinLength),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function SignInPage() {
  const redirectTo = useRedirectParam();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState<string>("");

  const form = useForm<z.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signUpFormSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      await authClient.signUp.email(
        {
          email: data.email,
          password: data.password,
          name: data.name,
          callbackURL: redirectTo ?? APP_CONFIG.routes.dashboard,
        },
        {
          onError: (ctx) => {
            if (ctx.error.status === 403) {
              setError("Please verify your email address");
            } else {
              setError(ctx.error.message ?? "Failed to create account");
            }
          },
        },
      );

      // If successful, show confirmation message
      setSentToEmail(data.email);
      setEmailSent(true);
    } catch (err) {
      console.error("Sign up error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className={cn("flex flex-col gap-6")}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Check your email</CardTitle>
            <CardDescription>
              We sent a verification email to {sentToEmail}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground text-center text-sm">
                Please check your inbox and click the verification link to
                complete your registration.
              </p>
              <div className="flex justify-center">
                <Button asChild variant="outline">
                  <Link href={APP_CONFIG.routes.signIn}>Go to Sign In</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="form-sign-up" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="gap-3">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <TextField
                    label="Full Name"
                    id="form-sign-up-name"
                    placeholder="John Doe"
                    autoComplete="off"
                    field={field}
                    fieldState={fieldState}
                  />
                )}
              />
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <EmailField
                    id="form-sign-up-email"
                    field={field}
                    fieldState={fieldState}
                  />
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <PasswordInputField
                    label="Password"
                    id="form-sign-up-password"
                    field={field}
                    fieldState={fieldState}
                  />
                )}
              />
              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <PasswordInputField
                    label="Confirm Password"
                    id="form-sign-up-confirm-password"
                    field={field}
                    fieldState={fieldState}
                  />
                )}
              />
              <Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              {error && (
                <Field>
                  <FieldError errors={[{ message: error }]} />
                </Field>
              )}
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link
                    href={
                      redirectTo
                        ? `${APP_CONFIG.routes.signIn}?redirect=${encodeURIComponent(redirectTo)}`
                        : APP_CONFIG.routes.signIn
                    }
                  >
                    Sign in
                  </Link>
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
