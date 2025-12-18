import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { APP_CONFIG } from "@/config";

export const metadata: Metadata = {
  // Core metadata
  title: {
    default: APP_CONFIG.seo.title,
    template: APP_CONFIG.seo.titleTemplate,
  },
  description: APP_CONFIG.seo.description,
  keywords: [...APP_CONFIG.seo.keywords],
  authors: [...APP_CONFIG.seo.authors],
  creator: APP_CONFIG.seo.creator,
  publisher: APP_CONFIG.seo.publisher,
  category: APP_CONFIG.seo.category,

  // Icons
  icons: [{ rel: "icon", url: "/favicon.ico" }],

  // Base URL for relative paths
  metadataBase: new URL(APP_CONFIG.seo.siteUrl),

  // Robots configuration
  robots: APP_CONFIG.seo.robots,

  // Open Graph
  openGraph: {
    type: APP_CONFIG.seo.openGraph.type,
    locale: APP_CONFIG.seo.openGraph.locale,
    url: APP_CONFIG.seo.siteUrl,
    title: APP_CONFIG.seo.title,
    description: APP_CONFIG.seo.description,
    siteName: APP_CONFIG.seo.openGraph.siteName,
    images: [...APP_CONFIG.seo.openGraph.images],
  },

  // Twitter/X
  twitter: {
    card: APP_CONFIG.seo.twitter.card,
    title: APP_CONFIG.seo.title,
    description: APP_CONFIG.seo.description,
    site: APP_CONFIG.seo.twitter.site,
    creator: APP_CONFIG.seo.twitter.creator,
    images: [...APP_CONFIG.seo.openGraph.images],
  },

  // Search console verification
  verification: {
    google: APP_CONFIG.seo.verification.google,
    yandex: APP_CONFIG.seo.verification.yandex,
    yahoo: APP_CONFIG.seo.verification.yahoo,
    other: APP_CONFIG.seo.verification.bing
      ? { "msvalidate.01": APP_CONFIG.seo.verification.bing }
      : undefined,
  },

  // Canonical URL & alternates
  alternates: {
    canonical: APP_CONFIG.seo.alternates.canonical,
    languages: APP_CONFIG.seo.alternates.languages,
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster/>
            {children}
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
