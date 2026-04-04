"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PeriodSelector } from "./period-selector";
import type { ProductConfig } from "@/config";

type PricingPeriod = "month" | "year";

interface PricingPlansClientProps {
  products: ProductConfig[];
  buttonText?: string;
  redirectPattern?: string;
}

export function PricingPlansClient({
  products,
  buttonText = "Get Started",
  redirectPattern
}: PricingPlansClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PricingPeriod>("month");

  const getRedirectUrl = (product: ProductConfig) => {
    if (redirectPattern) {
      return redirectPattern.replace(/{slug}/g, product.slug);
    }
    return product.actionButtonLink.replace(/{slug}/g, product.slug);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="text-center mb-15 space-y-4 relative z-20">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent">
          Choose Your Perfect Plan
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Scale your business with the right plan. All plans include a 14-day free trial.
        </p>

        {/* Period Toggle */}
        <PeriodSelector onPeriodChange={setSelectedPeriod} products={products} />
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6 xl:gap-8 relative z-10">
        {products.map((product) => {
          const selectedPrice = product.periods.find((p) => p.period === selectedPeriod);
          const isFeatured = product.featured;

          return (
            <Card
              key={product.productId}
              className={cn(
                "relative flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1",
                isFeatured && "border-primary border-2 shadow-xl md:scale-105"
              )}
            >
              {/* Featured Badge */}
              {isFeatured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-primary to-pink-600 text-primary-foreground px-4 py-1 shadow-lg border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className={cn("space-y-4", isFeatured && "pt-8")}>
                <div>
                  <CardTitle className="text-2xl font-bold">{product.name}</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-relaxed">
                    {product.description}
                  </CardDescription>
                </div>

                {/* Pricing Display */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tight">
                      {product.currency}
                      {selectedPrice?.price.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">
                      /{selectedPeriod}
                    </span>
                  </div>
                  {/* Always render container to prevent layout shift */}
                  <div className="h-5 flex items-center">
                    {selectedPeriod === "year" && (
                      <p className="text-sm text-muted-foreground">
                        {product.currency}
                        {(selectedPrice!.price / 12).toFixed(2)}/month billed annually
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-6">
                {/* What You Get */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    Features Included
                  </h4>
                  <ul className="space-y-3">
                    {product.whatYouGet.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-primary/10 p-1">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm flex-1">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What You Don't Get (if any) */}
                {product.whatYouDontGet.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                        Not Included
                      </h4>
                      <ul className="space-y-3">
                        {product.whatYouDontGet.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-full bg-destructive/10 p-1">
                              <X className="w-3 h-3 text-destructive" />
                            </div>
                            <span className="text-sm flex-1 text-muted-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  asChild
                  className={cn(
                    "w-full h-12 font-semibold transition-all duration-300",
                    isFeatured
                      ? "bg-gradient-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-700 text-primary-foreground shadow-lg hover:shadow-xl"
                      : "hover:scale-105"
                  )}
                  variant={isFeatured ? "default" : "outline"}
                >
                  <Link href={getRedirectUrl(product)}>
                    {buttonText}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="text-center mt-12 text-sm text-muted-foreground">
        <p>All plans include a 14-day free trial. No credit card required.</p>
        <p className="mt-1">Need a custom solution? <Link href="/contact" className="text-primary hover:underline font-medium">Contact us</Link></p>
      </div>
    </div>
  );
}
