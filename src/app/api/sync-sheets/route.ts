import { requireSession } from "@/lib/session";
import { isAppError } from "@/lib/errors";
import { jsonFail, jsonFromError, jsonOk } from "@/lib/http";
import {
  getLastSyncInfo,
  syncSheetsToDatabase,
} from "@/services/sheets-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function requireStaff() {
  try {
    await requireSession();
    return null;
  } catch (error) {
    if (isAppError(error)) return jsonFail(error.status, error.message);
    return jsonFail(401, "Sign in required.");
  }
}

export async function GET() {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const info = await getLastSyncInfo();
    return jsonOk(info);
  } catch (error) {
    return jsonFromError(error, "Could not load last sync.", 500);
  }
}

export async function POST() {
  const denied = await requireStaff();
  if (denied) return denied;

  try {
    const result = await syncSheetsToDatabase();
    return jsonOk(result);
  } catch (error) {
    return jsonFromError(error, "Sheet sync failed.", 502);
  }
}
