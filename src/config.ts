/**
 * Application configuration
 *
 * @module config
 * @description Central configuration for the application.
 * Customize these values to match your SaaS branding and requirements.
 */

import {
  getMagicLinkEmailTemplate,
} from "@/lib/email-templates";

/**
 * Product configuration type for pricing plans
 */
export type ProductConfig = {
  readonly productId: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly whatYouGet: readonly string[];
  readonly whatYouDontGet: readonly string[];
  readonly currency: string;
  readonly periods: {
    readonly period: "month" | "year";
    readonly price: number;
  }[];
  readonly actionButtonLink: string;
  readonly featured?: boolean;
};

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
    /** Auth page */
    readonly auth: string;
    /** Main dashboard */
    readonly dashboard: string;
    /** To Do page */
    readonly todo: string;
    /** Account settings page */
    readonly accountSettings: string;
  };
  readonly auth: {
    /** Where to redirect after successful authentication */
    readonly defaultRedirectAfterAuth: string;
    /** Minimum email length */
    readonly emailMinLength: number;
    /** Maximum email length (RFC 5321) */
    readonly emailMaxLength: number;
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
    /** Generate magic link email body */
    readonly getMagicLinkEmailBody: (params: {
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
  readonly payments: {
    readonly products: ProductConfig[];
  }
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
    auth: "/auth",

    // Protected routes
    dashboard: "/app/dashboard",
    todo: "/app/todo",
    accountSettings: "/app/account",
  },

  auth: {
    defaultRedirectAfterAuth: "/app/dashboard",
    emailMinLength: 5,
    emailMaxLength: 254,
  },

  links: {
    termsOfService: "#",
    privacyPolicy: "#",
  },

  email: {
    fromAddress: "Acme <onboarding@resend.dev>",
    getMagicLinkEmailBody: getMagicLinkEmailTemplate,
  },

  seo: {
    // Base site URL - update this to your production domain
    siteUrl: "https://example.com",

    // Title configuration
    title: "BetterAuth Template - Modern SaaS Authentication Starter",
    titleTemplate: "%s | BetterAuth Template",

    // Meta description (keep between 150-160 characters for best results)
    description:
      "Build secure, scalable SaaS applications with BetterAuth Template. Features include OAuth, email verification, and a beautiful dashboard.",

    // Keywords for search engines (focus on 5-10 relevant terms)
    keywords: [
      "SaaS template",
      "authentication",
      "Next.js",
      "TypeScript",
      "BetterAuth",
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
  payments: {
    products: [
      {
        productId: "BASIC_PLAN",
        slug: "basic-plan",
        name: "Starter",
        description: "Perfect for individuals and small teams getting started with AI-powered automation.",
        whatYouGet: [
          "Up to 3 team members",
          "100 AI tokens per month",
          "5,000 API calls per month",
          "Email support",
          "Basic analytics dashboard",
          "Community access"
        ],
        whatYouDontGet: [
          "No priority support",
          "No advanced integrations",
          "No custom branding"
        ],
        currency: "€",
        periods: [
          {
            period: "month",
            price: 9.99,
          },
          {
            period: "year",
            price: 99.99,
          },
        ],
        actionButtonLink: "/dashboard/subscriptions?plan={slug}",
        featured: false,
      },
      {
        productId: "PRO_PLAN",
        slug: "pro-plan",
        name: "Professional",
        description: "Advanced features for growing businesses and teams that need more power.",
        whatYouGet: [
          "Up to 10 team members",
          "500 AI tokens per month",
          "25,000 API calls per month",
          "Priority email support",
          "Advanced analytics & reporting",
          "Custom integrations",
          "API access",
          "99.9% uptime SLA"
        ],
        whatYouDontGet: [
          "No dedicated account manager",
          "No custom SLA",
          "No white-label options"
        ],
        currency: "€",
        periods: [
          {
            period: "month",
            price: 29.99,
          },
          {
            period: "year",
            price: 249.99,
          },
        ],
        actionButtonLink: "/dashboard/subscriptions?plan={slug}",
        featured: true,
      },
      {
        productId: "ENTERPRISE_PLAN",
        slug: "enterprise-plan",
        name: "Enterprise",
        description: "Custom solutions for large organizations with enterprise-grade requirements.",
        whatYouGet: [
          "Unlimited team members",
          "Unlimited AI tokens",
          "Unlimited API calls",
          "24/7 dedicated support",
          "Custom analytics & reporting",
          "All integrations included",
          "White-label options",
          "Custom SLA & contracts",
          "Dedicated account manager",
          "On-premise deployment option",
          "Advanced security & compliance",
          "Custom feature development"
        ],
        whatYouDontGet: [],
        currency: "€",
        periods: [
          {
            period: "month",
            price: 99.99,
          },
          {
            period: "year",
            price: 999.99,
          },
        ],
        actionButtonLink: "/dashboard/subscriptions?plan={slug}",
        featured: false,
      },
    ],
  },
} as const satisfies AppConfig;
