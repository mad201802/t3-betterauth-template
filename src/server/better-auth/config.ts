import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { env } from "@/env";
import { db } from "@/server/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "sqlite", // or "sqlite" or "mysql"
  }),
  emailAndPassword: {
    enabled: true,
    sendOnSignUp: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log(
        `Send verification email to ${user.email}: ${url} (token: ${token})`,
      );
    },
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    github: {
      clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
      redirectURI: "http://localhost:3000/api/auth/callback/github",
    },
  },
});

export type Session = typeof auth.$Infer.Session;
