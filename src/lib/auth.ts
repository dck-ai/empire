import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { getEnv } from "@/lib/env";

const env = getEnv();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.appUrl,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  trustedOrigins: [env.appUrl],
});

export type Session = typeof auth.$Infer.Session;
