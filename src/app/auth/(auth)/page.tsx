"use client";

import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
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
import { KeyRound } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { emailSchema } from "@/lib/validation-schemas";
import { EmailField } from "@/components/ui/text-field";
import { IconBrandGithubFilled, IconBrandGoogleFilled } from "@tabler/icons-react";

const authFormSchema = z.object({
  email: emailSchema,
});

export default function AuthPage() {
  const redirectTo = useRedirectParam();
  const [responseMessage, setResponseMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);
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
    if (responseMessage) {
      const timer = setTimeout(() => {
        setResponseMessage(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [responseMessage]);

  const onSubmit = async (data: z.infer<typeof authFormSchema>) => {
    setResponseMessage(null);
    setIsLoading("email");

    try {
      const response = await authClient.signIn.magicLink({
        email: data.email,
        callbackURL: redirectTo ?? APP_CONFIG.routes.dashboard,
      });

      if (response.error) {
        setResponseMessage({ type: "error", message: "Failed to send magic link. Please try again." });
        return;
      }

      // Show success message - user should check their email
      setResponseMessage({ type: "success", message: "Check your email for a magic link to sign in!" });
      form.reset();
    } catch (err) {
      console.error("Magic link error:", err);
      setResponseMessage({ type: "error", message: "Failed to send magic link. Please try again." });
    } finally {
      setIsLoading(null);
    }
  };

  const handlePasskeyAuth = async () => {
    setResponseMessage(null);
    setIsLoading("passkey");
    try {
      const response = await authClient.signIn.passkey({
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

      console.log(response);

      // Successful authentication will redirect automatically
    } catch (err) {
      console.error("Passkey auth error:", err);
      setResponseMessage({ type: "error", message: "Failed to sign in with passkey" });
      setIsLoading(null);
    }
  };

  const handleSocialAuth = async (provider: "github" | "google") => {
    setResponseMessage(null);
    setIsLoading(provider);
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: redirectTo ?? APP_CONFIG.routes.dashboard,
      });
    } catch (err) {
      console.error(`${provider} auth error:`, err);
      setResponseMessage({ type: "error", message: `Failed to sign in with ${provider}` });
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
              <KeyRound className="h-5 w-5" />
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
                <IconBrandGithubFilled className="h-5 w-5" />
                {isLoading === "github" ? "Connecting..." : "GitHub"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialAuth("google")}
                disabled={isLoading !== null}
                className="w-full"
              >
                <IconBrandGoogleFilled className="h-5 w-5" />
                {isLoading === "google" ? "Connecting..." : "Google"}
              </Button>
            </div>

            {/* Response Message Display */}
            {responseMessage && (
              <Field>
                <p className={cn("text-center", responseMessage.type === "error" ? "text-red-500" : "text-green-500")}>{responseMessage.message}</p>
              </Field>
            )}
          </div>
        </CardContent>
      </Card>
      <AuthFormFooter />
    </div>
  );
}
