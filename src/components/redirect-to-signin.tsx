"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { APP_CONFIG } from "@/config";

export default function RedirectToSignIn() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const signInRoute = APP_CONFIG?.routes?.signIn ?? "/auth/sign-in";
    router.push(`${signInRoute}?redirect=` + encodeURIComponent(pathname));
  }, [pathname, router]);

  return null;
}
