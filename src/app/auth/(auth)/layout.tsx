import { auth } from "@/server/better-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APP_CONFIG } from "@/config";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout(props: AuthLayoutProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    redirect(APP_CONFIG.routes.dashboard);
  }
  return props.children;
}
