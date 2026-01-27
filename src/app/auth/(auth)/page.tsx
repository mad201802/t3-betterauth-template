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
import { z } from "zod";
import { authClient } from "@/server/better-auth/client";
import { useRedirectParam } from "@/hooks/use-redirect-param";
import { AuthFormFooter } from "@/components/auth-form-footer";
import { APP_CONFIG } from "@/config";
import { Github } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { emailSchema } from "@/lib/validation-schemas";
import { EmailField } from "@/components/ui/text-field";

// Google icon SVG component
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const authFormSchema = z.object({
  email: emailSchema,
});

export default function AuthPage() {
  const redirectTo = useRedirectParam();
  const [error, setError] = useState<string | null>(null);
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
      return;
    }
    
    // Check if conditional mediation is available
    void PublicKeyCredential.isConditionalMediationAvailable().then(
      (available) => {
        if (available) {
          // Preload passkeys with autoFill for conditional UI
          void authClient.signIn.passkey({ autoFill: true });
        }
      },
    );
  }, []);

  const onSubmit = async (data: z.infer<typeof authFormSchema>) => {
    setError(null);
    setIsLoading("email");

    try {
      await authClient.signIn.magicLink({
        email: data.email,
        callbackURL: redirectTo ?? APP_CONFIG.routes.dashboard,
      });
      
      // Show success message - user should check their email
      setError(null);
      alert("Check your email for a magic link to sign in!");
    } catch (err) {
      console.error("Magic link error:", err);
      setError("Failed to send magic link. Please try again.");
    } finally {
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
          <div className="flex flex-col gap-4">
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
                  {isLoading === "email" ? "Authenticating..." : "Authenticate"}
                </Button>
              </FieldGroup>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

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
                <GoogleIcon />
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
