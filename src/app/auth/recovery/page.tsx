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
import { useState } from "react";
import { z } from "zod";
import { authClient } from "@/server/better-auth/client";

const recoveryFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function RecoveryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof recoveryFormSchema>>({
    resolver: zodResolver(recoveryFormSchema),
    defaultValues: {
      email: "",
    },
  });

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
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-recovery-email">
                      Email
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-recovery-email"
                      aria-invalid={fieldState.invalid}
                      type="email"
                      placeholder="m@example.com"
                      required
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
                  <Link href="/auth/sign-in">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
