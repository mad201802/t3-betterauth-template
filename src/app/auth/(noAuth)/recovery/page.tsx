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
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { authClient } from "@/server/better-auth/client";
import { emailSchema } from "@/lib/validation-schemas";
import { EmailField } from "@/components/ui/text-field";
import { AuthFormFooter } from "@/components/auth-form-footer";
import { APP_CONFIG } from "@/config";

const recoveryFormSchema = z.object({
  email: emailSchema,
});

export default function RecoveryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecoveryForm />
    </Suspense>
  );
}

function RecoveryForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const searchParams = useSearchParams();
  const rawEmail = searchParams?.get("email") ?? "";

  // If the query param is percent-encoded (e.g. `%40` for `@`), decode it safely.
  let emailFromQuery = rawEmail;
  try {
    if (rawEmail.includes("%")) {
      emailFromQuery = decodeURIComponent(rawEmail);
    }
  } catch {
    emailFromQuery = rawEmail;
  }

  const form = useForm<z.infer<typeof recoveryFormSchema>>({
    resolver: zodResolver(recoveryFormSchema),
    defaultValues: {
      email: emailFromQuery,
    },
  });

  // If the `email` query param changes after mount, update the form value
  useEffect(() => {
    if (emailFromQuery) form.setValue("email", emailFromQuery);
  }, [emailFromQuery, form]);

  const onSubmit = async (data: z.infer<typeof recoveryFormSchema>) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: "/auth/reset-password",
      });

      if (error) {
        setError(error.message ?? "Failed to send recovery email");
      } else {
        setSuccess(true);
        form.reset();
      }
    } catch (err) {
      console.error("Password recovery error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forget password</CardTitle>
          <CardDescription>
            Please provide your email to recover your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <EmailField
                    id="form-recovery-email"
                    field={field}
                    fieldState={fieldState}
                  />
                )}
              />
              {error && (
                <Field className="text-center">
                  <FieldError errors={[{ message: error }]} />
                </Field>
              )}
              {success && (
                <Field className="text-center">
                  <FieldDescription className="text-green-600">
                    Recovery email sent! Please check your inbox.
                  </FieldDescription>
                </Field>
              )}
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send recovery mail"}
                </Button>
                <FieldDescription className="text-center">
                  Can you remember your password?{" "}
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
