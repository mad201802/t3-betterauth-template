import { APP_CONFIG } from "@/config";
import { PricingPlansClient } from "./pricing-plans-client";

interface PricingPlansProps {
  buttonText?: string;
  redirectPattern?: string;
}

export function PricingPlans({ 
  buttonText = "Get Started",
  redirectPattern 
}: PricingPlansProps) {
  return (
    <PricingPlansClient 
      products={APP_CONFIG.payments.products}
      buttonText={buttonText}
      redirectPattern={redirectPattern}
    />
  );
}
