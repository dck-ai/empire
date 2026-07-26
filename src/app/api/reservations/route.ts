import { NextRequest } from "next/server";
import { getDailyBoard } from "@/services/reservation-repository";
import { requireSession } from "@/lib/session";
import { jsonFail, jsonFromError, jsonOk } from "@/lib/http";
import { isAppError } from "@/lib/errors";
import { isoDateSchema } from "@/types/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireSession();
  } catch (error) {
    if (isAppError(error)) return jsonFail(error.status, error.message);
    return jsonFail(401, "Sign in required.");
  }

  const date = request.nextUrl.searchParams.get("date") ?? "";
  const parsed = isoDateSchema.safeParse(date);
  if (!parsed.success) {
    return jsonFail(400, "Query param date must be YYYY-MM-DD.");
  }

  try {
    const board = await getDailyBoard(parsed.data);
    return jsonOk(board);
  } catch (error) {
    return jsonFromError(error, "Could not load reservations.");
  }
}
