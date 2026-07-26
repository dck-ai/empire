import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(16, "BETTER_AUTH_SECRET is required (min 16 chars)"),
  BETTER_AUTH_URL: z.url().optional(),
  VERCEL_URL: z.string().optional(),
  GOOGLE_SHEET_ID: z.string().optional(),
  GOOGLE_SERVICE_ACCOUNT_JSON: z.string().optional(),
  CRON_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema> & {
  appUrl: string;
  isProduction: boolean;
};

function resolveAppUrl(data: z.infer<typeof envSchema>): string {
  if (data.BETTER_AUTH_URL) {
    return data.BETTER_AUTH_URL.replace(/\/$/, "");
  }
  if (data.VERCEL_URL) {
    const host = data.VERCEL_URL.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }
  return "http://localhost:3000";
}

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;

  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || undefined,
    VERCEL_URL: process.env.VERCEL_URL || undefined,
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID || undefined,
    GOOGLE_SERVICE_ACCOUNT_JSON: process.env.GOOGLE_SERVICE_ACCOUNT_JSON || undefined,
    CRON_SECRET: process.env.CRON_SECRET || undefined,
  });

  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment: ${detail}`);
  }

  cached = {
    ...parsed.data,
    appUrl: resolveAppUrl(parsed.data),
    isProduction: parsed.data.NODE_ENV === "production",
  };
  return cached;
}

export function resetEnvCache(): void {
  cached = null;
}
