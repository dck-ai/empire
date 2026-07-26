import { MealPeriod, ReservationSession } from "@prisma/client";
import { isDinnerServiceTime } from "@/utils/dates";

const TRUE_VALUES = new Set([
  "true", "yes", "y", "1", "✓", "checked", "是", "有",
]);

export function parseSheetBoolean(raw: string): boolean {
  return TRUE_VALUES.has(raw.trim().toLowerCase());
}

const LUNCH_VALUES = new Set(["lunch", "午餐", "午宴", "l"]);
const DINNER_VALUES = new Set(["dinner", "晚餐", "晚宴", "d"]);
const WAITING_VALUES = new Set([
  "waiting", "waiting list", "waitlist", "wait", "等待", "等待列表", "候补",
]);

export function resolveSession(
  type: string,
  waitingList: string
): ReservationSession {
  const waiting = waitingList.trim().toLowerCase();
  if (TRUE_VALUES.has(waiting) || WAITING_VALUES.has(waiting)) {
    return ReservationSession.WAITING;
  }

  const value = type.trim().toLowerCase();
  if (WAITING_VALUES.has(value)) return ReservationSession.WAITING;
  if (DINNER_VALUES.has(value)) return ReservationSession.DINNER;
  if (LUNCH_VALUES.has(value)) return ReservationSession.LUNCH;
  return ReservationSession.LUNCH;
}

export function resolveWaitingMealPeriod(
  type: string,
  serviceTime: string
): MealPeriod {
  const value = type.trim().toLowerCase();
  if (DINNER_VALUES.has(value)) return MealPeriod.DINNER;
  if (LUNCH_VALUES.has(value)) return MealPeriod.LUNCH;
  if (isDinnerServiceTime(serviceTime)) return MealPeriod.DINNER;
  return MealPeriod.LUNCH;
}

export function parseSheetNumber(raw: string): number | null {
  const cleaned = raw.replace(/[^\d.-]/g, "").trim();
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export function cleanText(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}
