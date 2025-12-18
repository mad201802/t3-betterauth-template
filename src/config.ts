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
  readonly seo: {
    /** Base URL of the site (e.g., https://example.com) */
    readonly siteUrl: string;
    /** Default page title */
    readonly title: string;
    /** Title template for inner pages (use %s as placeholder) */
    readonly titleTemplate: string;
    /** Default meta description (150-160 chars recommended) */
    readonly description: string;
    /** Keywords for search engines */
    readonly keywords: readonly string[];
    /** Author information */
    readonly authors: readonly {
      readonly name: string;
      readonly url?: string;
    }[];
    /** Creator attribution */
    readonly creator: string;
    /** Publisher name */
    readonly publisher: string;
    /** Robots directives */
    readonly robots: {
      readonly index: boolean;
      readonly follow: boolean;
      readonly googleBot: {
        readonly index: boolean;
        readonly follow: boolean;
        readonly maxVideoPreview: number;
        readonly maxImagePreview: "none" | "standard" | "large";
        readonly maxSnippet: number;
      };
    };
    /** Open Graph metadata for social sharing */
    readonly openGraph: {
      readonly type: "website" | "article" | "product";
      readonly locale: string;
      readonly siteName: string;
      readonly images: readonly {
        readonly url: string;
        readonly width: number;
        readonly height: number;
        readonly alt: string;
      }[];
    };
    /** Twitter/X card metadata */
    readonly twitter: {
      readonly card: "summary" | "summary_large_image" | "app" | "player";
      readonly site?: string;
      readonly creator?: string;
    };
    /** Verification tokens for search consoles */
    readonly verification: {
      readonly google?: string;
      readonly yandex?: string;
      readonly yahoo?: string;
      readonly bing?: string;
    };
    /** Canonical URL handling */
    readonly alternates: {
      readonly canonical: string;
      readonly languages?: Record<string, string>;
    };
    /** Category of the application */
    readonly category: string;
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

  seo: {
    // Base site URL - update this to your production domain
    siteUrl: "https://example.com",

    // Title configuration
    title: "BetterAuth Template - Modern SaaS Authentication Starter",
    titleTemplate: "%s | BetterAuth Template",

    // Meta description (keep between 150-160 characters for best results)
    description:
      "Build secure, scalable SaaS applications with BetterAuth Template. Features include 2FA, OAuth, email verification, and a beautiful dashboard.",

    // Keywords for search engines (focus on 5-10 relevant terms)
    keywords: [
      "SaaS template",
      "authentication",
      "Next.js",
      "TypeScript",
      "BetterAuth",
      "2FA",
      "OAuth",
      "dashboard",
      "starter kit",
      "boilerplate",
    ],

    // Author/creator information
    authors: [{ name: "Your Name", url: "https://example.com" }],
    creator: "Your Name",
    publisher: "Your Company",

    // Robots configuration
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        maxVideoPreview: -1,
        maxImagePreview: "large",
        maxSnippet: -1,
      },
    },

    // Open Graph for social sharing (Facebook, LinkedIn, etc.)
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "BetterAuth Template",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "BetterAuth Template - Modern SaaS Authentication Starter",
        },
      ],
    },

    // Twitter/X card configuration
    twitter: {
      card: "summary_large_image",
      site: "@yourusername",
      creator: "@yourusername",
    },

    // Search console verification tokens (add your own)
    verification: {
      google: undefined,
      yandex: undefined,
      yahoo: undefined,
      bing: undefined,
    },

    // Canonical URL configuration
    alternates: {
      canonical: "https://example.com",
      languages: {
        "en-US": "https://example.com",
        // Add more languages as needed
        // "de-DE": "https://example.com/de",
      },
    },

    // Application category
    category: "technology",
  },
} as const satisfies AppConfig;
