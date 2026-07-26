import "server-only";

import { JWT } from "google-auth-library";
import type { SheetsConfig } from "@/lib/config";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";
const API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

export class SheetsClient {
  private readonly jwt: JWT;

  constructor(private readonly config: SheetsConfig) {
    this.jwt = new JWT({
      email: config.serviceAccountEmail,
      key: config.privateKey,
      scopes: [SHEETS_SCOPE],
    });
  }

  async readRange(rangeA1: string): Promise<string[][]> {
    const url =
      `${API_BASE}/${this.config.sheetId}/values/` +
      `${encodeURIComponent(rangeA1)}` +
      `?valueRenderOption=FORMATTED_VALUE&majorDimension=ROWS`;

    const response = await this.request(url);
    const body = (await response.json()) as { values?: string[][] };
    return body.values ?? [];
  }

  private async request(url: string): Promise<Response> {
    const { token } = await this.jwt.getAccessToken();
    if (!token) {
      throw new Error(
        "Could not obtain a Google access token — check the service account credentials."
      );
    }

    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await safeErrorDetail(response);
      throw new Error(
        `Google Sheets API GET failed (${response.status}): ${detail}`
      );
    }

    return response;
  }
}

async function safeErrorDetail(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as {
      error?: { message?: string };
    };
    return body.error?.message ?? response.statusText;
  } catch {
    return response.statusText;
  }
}
