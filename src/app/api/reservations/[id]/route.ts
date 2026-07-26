import { NextRequest } from "next/server";
import { updateReservationOps } from "@/services/reservation-repository";
import { requireSession } from "@/lib/session";
import { jsonFail, jsonFromError, jsonOk } from "@/lib/http";
import { isAppError } from "@/lib/errors";
import { reservationIdSchema, updateOpsSchema } from "@/types/api";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  let userId: string | undefined;
  try {
    const session = await requireSession();
    userId = session.user.id;
  } catch (error) {
    if (isAppError(error)) return jsonFail(error.status, error.message);
    return jsonFail(401, "Sign in required.");
  }

  const { id } = await context.params;
  const parsedId = reservationIdSchema.safeParse(id);
  if (!parsedId.success) {
    return jsonFail(400, "Invalid reservation id.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonFail(400, "Request body must be JSON.");
  }

  const parsedBody = updateOpsSchema.safeParse(body);
  if (!parsedBody.success) {
    return jsonFail(
      400,
      parsedBody.error.issues[0]?.message ?? "Invalid update payload."
    );
  }

  try {
    const updated = await updateReservationOps(
      parsedId.data,
      parsedBody.data,
      userId
    );
    return jsonOk(updated);
  } catch (error) {
    return jsonFromError(error, "Could not update reservation.");
  }
}
