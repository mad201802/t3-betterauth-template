import PageHeader from "@/components/page-header";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import React from "react";
import ChangePassword from "../_components/change-password";
import ViewSessions from "../_components/view-sessions";

export default async function DashboardSettingsPage() {
  const session = await auth.api.getSession({
      headers: await headers(),
    });
  
    const userAccounts = await auth.api.listUserAccounts({
      headers: await headers(),
    });
  
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader
          title={`Account Settings`}
          subtitle="Here you can manage your account settings."
        />
        <div className="flex flex-col pb-6 gap-y-4">
          <ChangePassword hasCredentialsAccount={userAccounts.some(a => a.providerId == "credential")} email={session?.user.email}/>
          <ViewSessions/>
        </div>
      </div>
    );
}
