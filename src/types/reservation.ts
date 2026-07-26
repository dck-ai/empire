import type { MealPeriod, ReservationSession } from "@prisma/client";

export type Session = ReservationSession;
export type { ReservationSession, MealPeriod };

export type OpsField = "arrival" | "finished" | "foodReservation" | "remarks";

export type StatusField = "arrival" | "finished";

export interface Reservation {
  id: string;
  sheetRowId: number;
  date: string;
  time: string;
  session: Session;
  mealPeriod: MealPeriod | null;
  hall: string;
  customerName: string;
  capacity: number | null;
  pax: number | null;
  phone: string;
  arrival: boolean;
  finished: boolean;
  foodReservation: string;
  remarks: string;
  managerReview: string;
}

export interface DailySummary {
  lunchCount: number;
  lunchPax: number;
  dinnerCount: number;
  dinnerPax: number;
  waitingLunchCount: number;
  waitingLunchPax: number;
  waitingDinnerCount: number;
  waitingDinnerPax: number;
  totalCount: number;
  totalPax: number;
}

export interface DailyBoard {
  date: string;
  lunch: Reservation[];
  dinner: Reservation[];
  waitingLunch: Reservation[];
  waitingDinner: Reservation[];
  summary: DailySummary;
}

export interface SearchHit {
  id: string;
  date: string;
  time: string;
  session: Session;
  hall: string;
  customerName: string;
  phone: string;
  pax: number | null;
}

export function opsSlice(
  reservation: Pick<
    Reservation,
    "arrival" | "finished" | "foodReservation" | "remarks"
  >
): Pick<Reservation, "arrival" | "finished" | "foodReservation" | "remarks"> {
  return {
    arrival: reservation.arrival,
    finished: reservation.finished,
    foodReservation: reservation.foodReservation,
    remarks: reservation.remarks,
  };
}

export function allBoardReservations(board: DailyBoard): Reservation[] {
  return [
    ...board.lunch,
    ...board.waitingLunch,
    ...board.dinner,
    ...board.waitingDinner,
  ];
}
