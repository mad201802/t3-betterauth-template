/**
 * Application configuration
 *
 * @module config
 * @description Central configuration for the application.
 * Customize these values to match your SaaS branding and requirements.
 */

import {
  getResetPasswordEmailTemplate,
  getEmailVerificationTemplate,
} from "@/lib/email-templates";

/**
 * Application configuration type
 */
type AppConfig = {
  readonly naming: {
    /** Full application name */
    readonly applicationName: string;
    /** Short name for the app (used in sidebar, etc.) */
    readonly applicationShortName: string;
  };
  readonly routes: {
    /** Public home page */
    readonly home: string;
    /** Sign in page */
    readonly signIn: string;
    /** Sign up page */
    readonly signUp: string;
    /** Password recovery page */
    readonly recovery: string;
    /** Reset password page (from email link) */
    readonly resetPassword: string;
    /** 2FA verification page */
    readonly verify2FA: string;
    /** Main dashboard */
    readonly dashboard: string;
    /** Account settings page */
    readonly accountSettings: string;
  };
  readonly auth: {
    /** Where to redirect after successful authentication */
    readonly defaultRedirectAfterAuth: string;
    /** Minimum password length */
    readonly passwordMinLength: number;
    /** Minimum email length */
    readonly emailMinLength: number;
    /** Maximum email length (RFC 5321) */
    readonly emailMaxLength: number;
  };
  readonly ui: {
    /** QR code size in pixels for 2FA setup */
    readonly qrCodeSize: number;
  };
  readonly links: {
    /** Terms of service URL */
    readonly termsOfService: string;
    /** Privacy policy URL */
    readonly privacyPolicy: string;
  };
  readonly email: {
    /** Email sender address */
    readonly fromAddress: string;
    /** Generate password reset email body */
    readonly getResetPasswordEmailBody: (params: {
      user: string;
      url: string;
    }) => string;
    /** Generate email verification email body */
    readonly getVerificationEmailBody: (params: {
      user: string;
      url: string;
    }) => string;
  };
};

/**
 * Main application configuration
 *
 * @example
 * ```ts
 * import { APP_CONFIG } from "@/config";
 *
 * // Use app name
 * console.log(APP_CONFIG.naming.applicationName);
 *
 * // Navigate to dashboard
 * router.push(APP_CONFIG.routes.dashboard);
 * ```
 */
export const APP_CONFIG = {
  naming: {
    applicationName: "BetterAuth Template",
    applicationShortName: "BetterAuth",
  },

  routes: {
    // Public routes
    home: "/",

    // Auth routes
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    recovery: "/auth/recovery",
    resetPassword: "/auth/reset-password",
    verify2FA: "/auth/verify-2fa",

    // Protected routes
    dashboard: "/dashboard",
    accountSettings: "/dashboard/account",
  },

  auth: {
    defaultRedirectAfterAuth: "/dashboard",
    passwordMinLength: 8,
    emailMinLength: 5,
    emailMaxLength: 254,
  },

  ui: {
    qrCodeSize: 200,
  },

  links: {
    termsOfService: "#",
    privacyPolicy: "#",
  },

  email: {
    fromAddress: "Acme <onboarding@resend.dev>",
    getResetPasswordEmailBody: getResetPasswordEmailTemplate,
    getVerificationEmailBody: getEmailVerificationTemplate,
  },
} as const satisfies AppConfig;
