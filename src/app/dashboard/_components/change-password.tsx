"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { authClient } from "@/server/better-auth/client";

interface ChangePasswordInterface {
  hasCredentialsAccount: boolean;
  email: string | undefined;
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function ChangePassword(props: ChangePasswordInterface) {
  const [isLoadingChangeRequest, setIsLoadingChangeRequest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof changePasswordSchema>) => {
    setIsLoadingChangeRequest(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await authClient.changePassword({
        newPassword: data.newPassword, // required
        currentPassword: data.currentPassword, // required
        revokeOtherSessions: true,
      });

      if (error) {
        setError(error.message ?? "Failed to update password");
        return;
      }

      setSuccess("Password updated successfully!");
      form.reset();
    } catch (err) {
      console.error("Password change error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoadingChangeRequest(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>Update your account password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400">
              {success}
            </div>
          )}

          <Controller
            name="currentPassword"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Current Password</FieldLabel>
                <FieldGroup>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Enter your current password"
                    disabled={!props.hasCredentialsAccount}
                  />
                </FieldGroup>
                <FieldError>
                  {form.formState.errors.currentPassword?.message}
                </FieldError>
              </Field>
            )}
          />

          <Controller
            name="newPassword"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>New Password</FieldLabel>
                <FieldGroup>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Enter your new password"
                    disabled={!props.hasCredentialsAccount}
                  />
                </FieldGroup>
                <FieldError>
                  {form.formState.errors.newPassword?.message}
                </FieldError>
              </Field>
            )}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Confirm New Password</FieldLabel>
                <FieldGroup>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Confirm your new password"
                    disabled={!props.hasCredentialsAccount}
                  />
                </FieldGroup>
                <FieldError>
                  {form.formState.errors.confirmPassword?.message}
                </FieldError>
              </Field>
            )}
          />

          <Button
            type="submit"
            disabled={isLoadingChangeRequest || !props.hasCredentialsAccount}
          >
            {isLoadingChangeRequest ? "Updating..." : "Update Password"}
          </Button>

          {!props.hasCredentialsAccount && (
            <p className="text-muted-foreground text-sm">
              You do not have a credentials account set up.{" "}
              <Link
                href={`/auth/recovery?email=${encodeURIComponent(props.email ?? "")}`}
                className="text-blue-600 underline hover:text-blue-700 dark:text-blue-400"
              >
                Set a password
              </Link>{" "}
              for your account.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
