import { NextRequest } from "next/server";
import { searchReservations } from "@/services/reservation-repository";
import { requireSession } from "@/lib/session";
import { jsonFail, jsonFromError, jsonOk } from "@/lib/http";
import { isAppError } from "@/lib/errors";
import { searchQuerySchema } from "@/types/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireSession();
  } catch (error) {
    if (isAppError(error)) return jsonFail(error.status, error.message);
    return jsonFail(401, "Sign in required.");
  }

  const q = request.nextUrl.searchParams.get("q") ?? "";
  const parsed = searchQuerySchema.safeParse({ q });
  if (!parsed.success) {
    return jsonFail(
      400,
      parsed.error.issues[0]?.message ?? "Invalid search query."
    );
  }

  try {
    const hits = await searchReservations(parsed.data.q);
    return jsonOk(hits);
  } catch (error) {
    return jsonFromError(error, "Search failed.");
  }
}
