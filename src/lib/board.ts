import type {
  DailyBoard,
  DailySummary,
  MealPeriod,
  Reservation,
} from "@/types/reservation";
import { isDinnerServiceTime } from "@/utils/dates";

export function buildDailyBoard(
  date: string,
  reservations: Reservation[]
): DailyBoard {
  const lunch = reservations.filter((r) => r.session === "LUNCH");
  const dinner = reservations.filter((r) => r.session === "DINNER");
  const waiting = reservations.filter((r) => r.session === "WAITING");

  const waitingLunch = sortByTime(
    waiting.filter((r) => resolveWaitingMeal(r.mealPeriod, r.time) === "LUNCH")
  );
  const waitingDinner = sortByTime(
    waiting.filter((r) => resolveWaitingMeal(r.mealPeriod, r.time) === "DINNER")
  );

  return {
    date,
    lunch: sortByTime(lunch),
    dinner: sortByTime(dinner),
    waitingLunch,
    waitingDinner,
    summary: buildSummary(lunch, dinner, waitingLunch, waitingDinner),
  };
}

export function resolveWaitingMeal(
  mealPeriod: MealPeriod | null | undefined,
  serviceTime: string
): MealPeriod {
  if (mealPeriod === "LUNCH" || mealPeriod === "DINNER") return mealPeriod;
  return isDinnerServiceTime(serviceTime) ? "DINNER" : "LUNCH";
}

function sortByTime(reservations: Reservation[]): Reservation[] {
  return [...reservations].sort((a, b) => a.time.localeCompare(b.time));
}

function buildSummary(
  lunch: Reservation[],
  dinner: Reservation[],
  waitingLunch: Reservation[],
  waitingDinner: Reservation[]
): DailySummary {
  const lunchPax = sumPax(lunch);
  const dinnerPax = sumPax(dinner);
  const waitingLunchPax = sumPax(waitingLunch);
  const waitingDinnerPax = sumPax(waitingDinner);
  return {
    lunchCount: lunch.length,
    lunchPax,
    dinnerCount: dinner.length,
    dinnerPax,
    waitingLunchCount: waitingLunch.length,
    waitingLunchPax,
    waitingDinnerCount: waitingDinner.length,
    waitingDinnerPax,
    totalCount:
      lunch.length +
      dinner.length +
      waitingLunch.length +
      waitingDinner.length,
    totalPax: lunchPax + dinnerPax + waitingLunchPax + waitingDinnerPax,
  };
}

function sumPax(reservations: Reservation[]): number {
  return reservations.reduce((sum, r) => sum + (r.pax ?? 0), 0);
}
