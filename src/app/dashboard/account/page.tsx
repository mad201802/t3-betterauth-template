import PageHeader from "@/components/page-header";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import React from "react";
import Account from "@/components/account/account";
import ChangePassword from "@/components/account/change-password";
import ViewSessions from "@/components/account/view-sessions";
import TwoFactorAuth from "@/components/account/two-factor/two-factor-auth";
import ManagePasskeys from "@/components/account/manage-passkeys";

export default async function DashboardSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userAccounts = await auth.api.listUserAccounts({
    headers: await headers(),
  });

  // Get configured providers from better-auth config
  const configuredProviders = Object.keys(auth.options.socialProviders) || [];

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title={`Account Settings`}
        subtitle="Here you can manage your account settings."
      />
      <div className="flex flex-col gap-3 pb-6">
        <Account
          userAccounts={userAccounts}
          configuredProviders={configuredProviders}
        />
        <ChangePassword
          hasCredentialsAccount={userAccounts.some(
            (a) => a.providerId == "credential",
          )}
          email={session?.user.email}
        />
        <TwoFactorAuth
          twoFactorEnabled={session?.user.twoFactorEnabled ?? false}
          hasCredentialsAccount={userAccounts.some(
            (a) => a.providerId == "credential",
          )}
        />
        <ManagePasskeys />
        <ViewSessions />
      </div>
    </div>
  );
}
