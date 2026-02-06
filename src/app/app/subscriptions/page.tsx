import { PricingPlans } from "@/components/pricing/pricing-plans";

interface SubscriptionsPageProps {
  searchParams: Promise<{ plan?: string }>;
}

export default async function SubscriptionsPage({ searchParams }: SubscriptionsPageProps) {
  const { plan } = await searchParams;

  return (
    <div className="container py-8 mx-auto max-w-7xl">
      <div className="mb-8">
        {plan && (
          <p className="text-muted-foreground mt-2">
            You selected the <span className="font-semibold">{plan}</span> plan
          </p>
        )}
      </div>
      
      <PricingPlans 
        buttonText="Subscribe Now"
        redirectPattern="/dashboard/checkout?plan={slug}"
      />
    </div>
  );
}
