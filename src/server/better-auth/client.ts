import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/auth/verify-2fa";
      },
    }),
  ],
});

export type Session = typeof authClient.$Infer.Session;
