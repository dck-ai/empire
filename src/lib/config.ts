import { getEnv } from "@/lib/env";

export interface SheetsConfig {
  sheetId: string;
  serviceAccountEmail: string;
  privateKey: string;
}

const serviceAccountSchema = {
  parse(json: string): { client_email: string; private_key: string } {
    let raw = json.trim();
    if (!raw.startsWith("{")) {
      try {
        raw = Buffer.from(raw, "base64").toString("utf8");
      } catch {
        throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON or base64 JSON");
      }
    }
    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON must be valid JSON");
    }
    if (
      !data ||
      typeof data !== "object" ||
      typeof (data as { client_email?: unknown }).client_email !== "string" ||
      typeof (data as { private_key?: unknown }).private_key !== "string"
    ) {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_JSON must include client_email and private_key"
      );
    }
    const { client_email, private_key } = data as {
      client_email: string;
      private_key: string;
    };
    return {
      client_email,
      private_key: private_key.replaceAll(String.raw`\n`, "\n"),
    };
  },
};

export function getSheetsConfig(): SheetsConfig | null {
  const env = getEnv();
  if (!env.GOOGLE_SHEET_ID || !env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return null;
  }

  const sa = serviceAccountSchema.parse(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  return {
    sheetId: env.GOOGLE_SHEET_ID,
    serviceAccountEmail: sa.client_email,
    privateKey: sa.private_key,
  };
}

export function getCronSecret(): string | null {
  return getEnv().CRON_SECRET?.trim() || null;
}
