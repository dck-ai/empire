import { Hourglass, Moon, Sun, type LucideIcon } from "lucide-react";
import type { DailyBoard, DailySummary, Session } from "@/types/reservation";

export interface BoardSectionDef {
  session: Session;
  anchor: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  reservations: (board: DailyBoard) => ReservationList;
  summaryCount: (s: DailySummary) => number;
  summaryDetail: (s: DailySummary) => string;
}

type ReservationList = DailyBoard["lunch"];

export const BOARD_SECTIONS: readonly BoardSectionDef[] = [
  {
    session: "LUNCH",
    anchor: "lunch",
    title: "午餐 LUNCH",
    subtitle: "Lunch",
    icon: Sun,
    reservations: (board) => board.lunch,
    summaryCount: (s) => s.lunchCount,
    summaryDetail: (s) => `${s.lunchPax} pax`,
  },
  {
    session: "WAITING",
    anchor: "waiting-list-lunch",
    title: "等待列表 Waiting List",
    subtitle: "午餐 · Lunch",
    icon: Hourglass,
    reservations: (board) => board.waitingLunch,
    summaryCount: (s) => s.waitingLunchCount,
    summaryDetail: (s) =>
      s.waitingLunchCount === 1 ? "party" : "parties",
  },
  {
    session: "DINNER",
    anchor: "dinner",
    title: "晚餐 DINNER",
    subtitle: "Dinner",
    icon: Moon,
    reservations: (board) => board.dinner,
    summaryCount: (s) => s.dinnerCount,
    summaryDetail: (s) => `${s.dinnerPax} pax`,
  },
  {
    session: "WAITING",
    anchor: "waiting-list-dinner",
    title: "等待列表 Waiting List",
    subtitle: "晚餐 · Dinner",
    icon: Hourglass,
    reservations: (board) => board.waitingDinner,
    summaryCount: (s) => s.waitingDinnerCount,
    summaryDetail: (s) =>
      s.waitingDinnerCount === 1 ? "party" : "parties",
  },
];
