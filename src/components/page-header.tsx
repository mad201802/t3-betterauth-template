import React from "react";

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {title && <h1 className="text-3xl font-bold tracking-tight">{title}</h1>}
      {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );
}
