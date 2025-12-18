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
  FieldSeparator,
} from "@/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PasswordInputField from "@/components/ui/password-input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { authClient } from "@/server/better-auth/client";
import { useRedirectParam } from "@/hooks/use-redirect-param";
import { emailSchema, passwordSchema } from "@/lib/validation-schemas";
import { EmailField } from "@/components/ui/text-field";
import { AuthFormFooter } from "@/components/auth-form-footer";
import { APP_CONFIG } from "@/config";
import { IconKey } from "@tabler/icons-react";

const signInFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export default function SignInPage() {
  const router = useRouter();
  const redirectTo = useRedirectParam();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof signInFormSchema>>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      console.log("Password reset successful");
      toast.success("Password reset successfully!");
    }
  }, [searchParams]);

  // Initialize passkey conditional UI
  useEffect(() => {
    const initConditionalUI = async () => {
      // Check if browser supports conditional UI
      if (
        typeof window !== "undefined" &&
        window.PublicKeyCredential &&
        typeof window.PublicKeyCredential.isConditionalMediationAvailable ===
          "function"
      ) {
        const available =
          await window.PublicKeyCredential.isConditionalMediationAvailable();
        if (available) {
          // Preload passkeys for autofill
          void authClient.signIn.passkey({
            autoFill: true,
            fetchOptions: {
              onSuccess: redirectToDashboard,
              onError: (ctx) => {
                // Silently fail for conditional UI
                console.log("Conditional UI error:", ctx.error);
              },
            },
          });
        }
      }
    };

    void initConditionalUI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAuthAction = async (
    action: () => Promise<void>,
    errorMessage = "An unexpected error occurred",
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await action();
    } catch (err) {
      console.error("Auth error:", err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToDashboard = () => {
    router.push(redirectTo ?? APP_CONFIG.routes.dashboard);
  };

  const onEmailLoginSubmit = async (data: z.infer<typeof signInFormSchema>) => {
    await handleAuthAction(async () => {
      await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
        },
        {
          onError: (ctx) => {
            if (ctx.error.status === 403) {
              setError("Please verify your email address");
            } else {
              setError(ctx.error.message ?? "Failed to sign in");
            }
          },
          onSuccess: redirectToDashboard,
        },
      );
    });
  };

  const onSocialSubmit = async (provider: "google" | "github") => {
    await handleAuthAction(async () => {
      await authClient.signIn.social({
        provider,
        callbackURL: redirectTo ?? APP_CONFIG.routes.dashboard,
      });
      redirectToDashboard();
    });
  };

  const onPasskeySubmit = async () => {
    await handleAuthAction(async () => {
      const { error } = await authClient.signIn.passkey({
        fetchOptions: {
          onSuccess: redirectToDashboard,
          onError: (ctx) => {
            setError(ctx.error.message ?? "Failed to sign in with passkey");
          },
        },
      });

      if (error) {
        setError(error.message ?? "Failed to sign in with passkey");
      }
    }, "Failed to sign in with passkey");
  };

  return (
    <div className={cn("flex flex-col gap-4")}>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Login with a social account or email below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="gap-3">
            <Field>
              <Button
                variant="outline"
                type="button"
                onClick={onPasskeySubmit}
                disabled={isLoading}
              >
                <IconKey size={18} />
                Login with Passkey
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => onSocialSubmit("github")}
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                  <path
                    d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z"
                    fill="currentColor"
                  ></path>
                </svg>
                Login with Github
              </Button>
              <Button
                onClick={() => onSocialSubmit("google")}
                variant="outline"
                type="button"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
                Login with Google
              </Button>
            </Field>
            <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
              Or continue with
            </FieldSeparator>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <EmailField
                  id="form-sign-in-email"
                  field={field}
                  fieldState={fieldState}
                  autoComplete="username webauthn"
                />
              )}
            />
          </FieldGroup>
          <form onSubmit={form.handleSubmit(onEmailLoginSubmit)}>
            <FieldGroup className="gap-3">
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <PasswordInputField
                    label="Password"
                    id="form-sign-in-password"
                    field={field}
                    fieldState={fieldState}
                    autoComplete="current-password webauthn"
                    labelAddon={
                      <Link
                        href={APP_CONFIG.routes.recovery}
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    }
                  />
                )}
              />
              {error && (
                <Field className="text-center">
                  <FieldError errors={[{ message: error }]} />
                </Field>
              )}
              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Login"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link
                    href={
                      redirectTo
                        ? `${APP_CONFIG.routes.signUp}?redirect=${encodeURIComponent(redirectTo)}`
                        : APP_CONFIG.routes.signUp
                    }
                  >
                    Sign up
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
