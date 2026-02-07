import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/sidebar/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import React from "react";
import RedirectToSignIn from "@/components/redirect-to-signin";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout(props: DashboardLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return <RedirectToSignIn />;
  }
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {props.children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
