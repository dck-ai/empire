import { NextRequest } from "next/server";
import { getCronSecret } from "@/lib/config";
import { secureCompare } from "@/lib/secure-compare";
import { jsonFail, jsonFromError, jsonOk } from "@/lib/http";
import { syncSheetsToDatabase } from "@/services/sheets-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorizeCron(request: NextRequest): true | string {
  const cronSecret = getCronSecret();
  if (!cronSecret) {
    return "CRON_SECRET is not configured.";
  }

  const authHeader = request.headers.get("authorization");
  const bearer =
    authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;

  if (!bearer || !secureCompare(bearer, cronSecret)) {
    return "Invalid cron credentials.";
  }

  return true;
}

export async function GET(request: NextRequest) {
  const auth = authorizeCron(request);
  if (auth !== true) {
    return jsonFail(401, auth);
  }

  try {
    const result = await syncSheetsToDatabase();
    return jsonOk(result);
  } catch (error) {
    return jsonFromError(error, "Sheet sync failed.", 502);
  }
}
