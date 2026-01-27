import Link from "next/link";

import { getSession } from "@/server/better-auth/server";
import { HydrateClient } from "@/trpc/server";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/config";
import { PricingPlans } from "@/components/pricing/pricing-plans";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";

export default async function Home() {
  const session = await getSession();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center px-4 py-24 md:py-32 bg-linear-to-b from-primary/10 via-pink-500/5 to-background">
          <div className="absolute inset-0 bg-grid-white/5 bg-size-[50px_50px] mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]" />

          <div className="relative z-10 container flex flex-col items-center justify-center gap-8 text-center max-w-5xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary backdrop-blur-sm">
              <Sparkles className="w-4 h-4" />
              Powered by Next.js, tRPC & BetterAuth
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
              Build Your SaaS in{" "}
              <span className="bg-linear-to-r from-primary to-pink-600 bg-clip-text text-transparent">
                Record Time
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed">
              The complete authentication template for modern web applications.
              Ship faster with pre-built auth, payments, and beautiful UI components.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
              {!session ? (
                <>
                  <Button asChild size="lg" className="bg-linear-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-700 text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                    <Link href={APP_CONFIG.routes.auth}>
                      Get Started Free
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href={APP_CONFIG.routes.auth}>
                      Sign In
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-linear-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-700 text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                    <Link href={APP_CONFIG.routes.dashboard}>
                      Go to Dashboard
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  <p className="text-muted-foreground">
                    Welcome back, <span className="font-semibold text-foreground">{session.user?.name}</span>!
                  </p>
                </>
              )}
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                Secure Authentication
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                Lightning Fast
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Beautiful UI
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="bg-linear-to-b from-background via-primary/5 dark:via-primary/10 to-background">
          <PricingPlans />
        </section>
      </main>
    </HydrateClient>
  );
}
