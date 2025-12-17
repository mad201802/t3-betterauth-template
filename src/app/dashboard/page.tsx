import PageHeader from "@/components/page-header";
import React from "react";

export default async function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader title={`Dashboard`} />
    </div>
  );
}
