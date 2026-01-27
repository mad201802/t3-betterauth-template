import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { passkey } from "@better-auth/passkey";
import { magicLink } from "better-auth/plugins";

import { env } from "@/env";
import { db } from "@/server/db";
import { sendMail } from "@/server/better-auth/config/email";
import { APP_CONFIG } from "@/config";

export const auth = betterAuth({
  appName: APP_CONFIG.naming.applicationShortName,
  plugins: [
    passkey({
      origin: env.BETTER_AUTH_URL,
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMail(
          APP_CONFIG.email.fromAddress,
          email,
          "Sign in to your account",
          APP_CONFIG.email.getMagicLinkEmailBody({
            user: email,
            url,
          }),
        );
      },
    }),
  ],
  database: prismaAdapter(db, {
    provider: "sqlite", // or "sqlite" or "mysql"
  }),
  rateLimit: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
    },
    google: {
      clientId: env.BETTER_AUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
