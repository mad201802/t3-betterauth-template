import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { twoFactor } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";

import { env } from "@/env";
import { db } from "@/server/db";
import { sendMail } from "@/server/better-auth/config/email";
import { APP_CONFIG } from "@/config";

export const auth = betterAuth({
  appName: APP_CONFIG.naming.applicationShortName,
  plugins: [twoFactor(), passkey()],
  database: prismaAdapter(db, {
    provider: "sqlite", // or "sqlite" or "mysql"
  }),
  rateLimit: {
    enabled: true,
  },
  emailAndPassword: {
    enabled: true,
    sendOnSignUp: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail(
        APP_CONFIG.email.fromAddress,
        user.email,
        "Reset Your Password",
        APP_CONFIG.email.resetPasswordMailBody({
          user: user.name || user.email,
          url,
        }),
      );
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      void sendMail(
        APP_CONFIG.email.fromAddress,
        user.email,
        "Verify Your Email Address",
        APP_CONFIG.email.emailVerifyMailBody({
          user: user.name || user.email,
          url,
        }),
      );
    },
    autoSignInAfterVerification: true,
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
