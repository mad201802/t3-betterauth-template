"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { APP_CONFIG } from "@/config";

export default function RedirectToSignIn() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    router.push(`${APP_CONFIG.routes.auth}?redirect=` + encodeURIComponent(pathname));
  }, [pathname, router]);

  return null;
}
