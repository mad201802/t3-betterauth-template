import React from "react";
import { Separator } from "@/components/ui/separator";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="space-y-1.5">
        {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
        {subtitle && <p className="text-muted-foreground text-base">{subtitle}</p>}
      </div>
      <Separator />
    </div>
  );
}
