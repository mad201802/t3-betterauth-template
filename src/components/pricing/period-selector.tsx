"use client";

import { useState, useMemo } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import type { ProductConfig } from "@/config";

type PricingPeriod = "month" | "year";

interface PeriodSelectorProps {
  onPeriodChange: (period: PricingPeriod) => void;
  products: ProductConfig[];
}

export function PeriodSelector({ onPeriodChange, products }: PeriodSelectorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PricingPeriod>("month");

  const handleChange = (value: string) => {
    if (value) {
      const period = value as PricingPeriod;
      setSelectedPeriod(period);
      onPeriodChange(period);
    }
  };

  // Calculate savings percentage dynamically
  const savingsPercent = useMemo(() => {
    const savingsPercentages: number[] = [];

    products.forEach((product) => {
      const monthlyPrice = product.periods.find((p) => p.period === "month")?.price;
      const yearlyPrice = product.periods.find((p) => p.period === "year")?.price;

      if (monthlyPrice && yearlyPrice) {
        // Calculate what the yearly price would be if paying monthly
        const yearlyPriceIfMonthly = monthlyPrice * 12;
        // Calculate percentage saved
        const percentSaved = ((yearlyPriceIfMonthly - yearlyPrice) / yearlyPriceIfMonthly) * 100;
        savingsPercentages.push(percentSaved);
      }
    });

    if (savingsPercentages.length === 0) return null;

    const minSavings = Math.min(...savingsPercentages);
    const maxSavings = Math.max(...savingsPercentages);

    // If all savings are the same (within 0.1% tolerance), show single value
    if (Math.abs(maxSavings - minSavings) < 0.1) {
      return `${maxSavings.toFixed(1)}%`;
    }

    // Otherwise show range
    return `${minSavings.toFixed(1)}-${maxSavings.toFixed(1)}%`;
  }, [products]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 pt-6">
      <ToggleGroup
        type="single"
        value={selectedPeriod}
        onValueChange={handleChange}
        className="bg-muted p-1 rounded-lg shadow-sm"
      >
        <ToggleGroupItem
          value="month"
          aria-label="Monthly billing"
          className="data-[state=on]:bg-background data-[state=on]:shadow-sm min-w-[100px]"
        >
          Monthly
        </ToggleGroupItem>
        <ToggleGroupItem
          value="year"
          aria-label="Yearly billing"
          className="data-[state=on]:bg-background data-[state=on]:shadow-sm min-w-[100px]"
        >
          Yearly
        </ToggleGroupItem>
      </ToggleGroup>
      {/* Always render badge container to prevent layout shift */}
      <div className="h-6 flex items-center">
        {selectedPeriod === "year" && savingsPercent && (
          <Badge variant="secondary" className="animate-in fade-in slide-in-from-top-2">
            Save up to {savingsPercent}
          </Badge>
        )}
      </div>
    </div>
  );
}
