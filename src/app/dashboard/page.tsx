import PageHeader from "@/components/page-header";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import React from "react";
import ChangePassword from "./_components/change-password";
import ViewSessions from "./_components/view-sessions";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title={`Welcome to your dashboard, ${session?.user.name}!`}
        subtitle="Here is an overview of your account and recent activity."
      />
      <div className="pb-6">
        <ChangePassword/>
        <ViewSessions/>
      </div>
      <div className="flex flex-col gap-2 pb-6">
        <h3 className="text-xl">Session information:</h3>
        <pre className="bg-muted rounded-md p-4">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}
