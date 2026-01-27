"use client";

import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { set, z } from "zod";
import { authClient } from "@/server/better-auth/client";
import { useRedirectParam } from "@/hooks/use-redirect-param";
import { AuthFormFooter } from "@/components/auth-form-footer";
import { APP_CONFIG } from "@/config";
import { Github, KeyRound } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { emailSchema } from "@/lib/validation-schemas";
import { EmailField } from "@/components/ui/text-field";

const authFormSchema = z.object({
  email: emailSchema,
});

export default function AuthPage() {
  const redirectTo = useRedirectParam();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const form = useForm<z.infer<typeof authFormSchema>>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: "",
    },
  });

  // Initialize conditional UI for passkey authentication
  useEffect(() => {
    // Check if browser supports conditional UI
    if (!PublicKeyCredential?.isConditionalMediationAvailable) {
      console.log("Conditional mediation not supported");
      return;
    } else {
      console.log("Conditional mediation supported");
    }

    // Check if conditional mediation is available
    void PublicKeyCredential.isConditionalMediationAvailable().then(
      (available) => {
        if (available) {
          // Preload passkeys with autoFill for conditional UI
          void authClient.signIn.passkey({ autoFill: true });
        } else {
          console.log("Conditional mediation not available");
        }
      },
    );
  }, []);

  // Clear success message after 10 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const onSubmit = async (data: z.infer<typeof authFormSchema>) => {
    setError(null);
    setSuccess(null);
    setIsLoading("email");

    try {
      await authClient.signIn.magicLink({
        email: data.email,
        callbackURL: redirectTo ?? APP_CONFIG.routes.dashboard,
      });

      // Show success message - user should check their email
      setError(null);
      setSuccess("Check your email for a magic link to sign in!");
      form.reset();
    } catch (err) {
      console.error("Magic link error:", err);
      setError("Failed to send magic link. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const handlePasskeyAuth = async () => {
    setError(null);
    setIsLoading("passkey");
    try {
      await authClient.signIn.passkey({
        autoFill: false,
        fetchOptions: {
          onSuccess(_context) {
            // Redirect to dashboard after successful authentication
            setIsLoading(null);
            window.location.href = redirectTo ?? APP_CONFIG.routes.dashboard;
          },
          onError(context) {
            // Handle authentication errors
            console.error("Authentication failed:", context.error.message);
          },
        },
      });
      // Successful authentication will redirect automatically
    } catch (err) {
      console.error("Passkey auth error:", err);
      setError("Failed to sign in with passkey");
      setIsLoading(null);
    }
  };

  const handleSocialAuth = async (provider: "github" | "google") => {
    setError(null);
    setIsLoading(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: redirectTo ?? APP_CONFIG.routes.dashboard,
      });
    } catch (err) {
      console.error(`${provider} auth error:`, err);
      setError(`Failed to sign in with ${provider}`);
      setIsLoading(null);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {/* Email Authentication Form */}
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup className="gap-3">
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <EmailField
                      id="auth-email"
                      field={field}
                      fieldState={fieldState}
                      autoComplete="email webauthn"
                    />
                  )}
                />
                <Button
                  type="submit"
                  disabled={isLoading !== null}
                  className="w-full"
                >
                  {isLoading === "email" ? "Sending link..." : "Send Magic Link"}
                </Button>
                {/* Success Message */}
                {success && (
                  <div className="text-sm text-center text-green-600 dark:text-green-500">
                    {success}
                  </div>
                )}
              </FieldGroup>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card text-muted-foreground px-2">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Passkey Auth Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handlePasskeyAuth}
              disabled={isLoading !== null}
              className="w-full"
            >
              <KeyRound className="mr-2 h-5 w-5" />
              {isLoading === "passkey" ? "Authenticating..." : "Passkey"}
            </Button>

            {/* Social Auth Buttons */}
            <div className="grid gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialAuth("github")}
                disabled={isLoading !== null}
                className="w-full"
              >
                <Github className="mr-2 h-5 w-5" />
                {isLoading === "github" ? "Connecting..." : "GitHub"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialAuth("google")}
                disabled={isLoading !== null}
                className="w-full"
              >
                <span className="ml-2">
                  {isLoading === "google" ? "Connecting..." : "Google"}
                </span>
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <Field>
                <FieldError errors={[{ message: error }]} />
              </Field>
            )}
          </div>
        </CardContent>
      </Card>
      <AuthFormFooter />
    </div>
  );
}
