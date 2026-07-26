import "server-only";

import type {
  MealPeriod as DbMealPeriod,
  Reservation as DbReservation,
  ReservationOps,
  ReservationSession,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildDailyBoard, resolveWaitingMeal } from "@/lib/board";
import { capacityForHall } from "@/lib/halls";
import { NotFoundError } from "@/lib/errors";
import { serviceDateToIso, isoToServiceDate } from "@/utils/dates";
import type {
  DailyBoard,
  MealPeriod,
  Reservation,
  SearchHit,
  Session,
} from "@/types/reservation";
import type { UpdateOpsInput } from "@/types/api";

type RowWithOps = DbReservation & { ops: ReservationOps | null };

const SESSION_VALUES = new Set<string>(["LUNCH", "DINNER", "WAITING"]);
const MEAL_VALUES = new Set<string>(["LUNCH", "DINNER"]);

function toSession(value: ReservationSession): Session {
  if (SESSION_VALUES.has(value)) return value as Session;
  return "LUNCH";
}

function toMealPeriod(value: DbMealPeriod | null): MealPeriod | null {
  if (value && MEAL_VALUES.has(value)) return value as MealPeriod;
  return null;
}

function toReservation(row: RowWithOps): Reservation {
  const ops = row.ops;
  const session = toSession(row.session);
  const storedMeal = toMealPeriod(row.mealPeriod);
  return {
    id: row.id,
    sheetRowId: row.sheetRowId,
    date: serviceDateToIso(row.serviceDate),
    time: row.serviceTime,
    session,
    mealPeriod:
      session === "WAITING"
        ? resolveWaitingMeal(storedMeal, row.serviceTime)
        : null,
    hall: row.hall,
    customerName: row.customerName,
    capacity: capacityForHall(row.hall),
    pax: row.pax,
    phone: row.phone,
    arrival: ops?.arrival ?? false,
    finished: ops?.finished ?? false,
    foodReservation: ops?.foodReservation ?? "",
    remarks: ops?.remarks ?? "",
    managerReview: row.managerReview,
  };
}

export async function getDailyBoard(dateIso: string): Promise<DailyBoard> {
  const rows = await prisma.reservation.findMany({
    where: { serviceDate: isoToServiceDate(dateIso) },
    include: { ops: true },
    orderBy: { serviceTime: "asc" },
  });

  return buildDailyBoard(dateIso, rows.map(toReservation));
}

export async function searchReservations(query: string): Promise<SearchHit[]> {
  const needle = query.trim();
  if (needle.length < 2) return [];

  const rows = await prisma.reservation.findMany({
    where: {
      OR: [
        { customerName: { contains: needle, mode: "insensitive" } },
        { phone: { contains: needle, mode: "insensitive" } },
        { hall: { contains: needle, mode: "insensitive" } },
      ],
    },

    take: 20,
    orderBy: { serviceDate: "desc" },
  });

  return rows.map((row) => ({
    id: row.id,
    date: serviceDateToIso(row.serviceDate),
    time: row.serviceTime,
    session: toSession(row.session),
    hall: row.hall,
    customerName: row.customerName,
    phone: row.phone,
    pax: row.pax,
  }));
}

export async function updateReservationOps(
  reservationId: string,
  patch: UpdateOpsInput,
  userId?: string | null
): Promise<Reservation> {
  const existing = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { ops: true },
  });

  if (!existing) {
    throw new NotFoundError(`Reservation ${reservationId} was not found.`);
  }

  if (!existing.ops) {
    throw new NotFoundError(
      `Reservation ${reservationId} has no ops row — run sheet sync first.`
    );
  }

  const ops = await prisma.reservationOps.update({
    where: { reservationId },
    data: {
      ...(patch.arrival !== undefined ? { arrival: patch.arrival } : {}),
      ...(patch.finished !== undefined ? { finished: patch.finished } : {}),
      ...(patch.foodReservation !== undefined
        ? { foodReservation: patch.foodReservation }
        : {}),
      ...(patch.remarks !== undefined ? { remarks: patch.remarks } : {}),
      updatedByUserId: userId ?? null,
    },
  });

  return toReservation({ ...existing, ops });
}
