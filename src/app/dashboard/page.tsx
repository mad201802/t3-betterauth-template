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

  const userAccounts = await auth.api.listUserAccounts({
    headers: await headers(),
  });

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title={`Welcome to your dashboard, ${session?.user.name}!`}
        subtitle="Here is an overview of your account and recent activity."
      />
      <div className="flex flex-col pb-6 gap-y-4">
        <ChangePassword hasCredentialsAccount={userAccounts.some(a => a.providerId == "credential")} email={session?.user.email}/>
        <ViewSessions/>
      </div>
    </div>
  );
}
