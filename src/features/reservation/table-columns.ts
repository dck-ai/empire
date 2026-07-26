import type { Session } from "@/types/reservation";
import { SESSION_THEME } from "@/lib/session-theme";
import { cn } from "@/lib/utils";

export type Align = "left" | "center" | "right";
export type ColKey =
  | "hall"
  | "time"
  | "customer"
  | "capacity"
  | "pax"
  | "phone"
  | "arrival"
  | "finished"
  | "food"
  | "remarks";

export interface ColumnDef {
  key: ColKey;
  label: string;
  width: string;
  align: Align;
}

export const COLUMNS: ColumnDef[] = [
  { key: "hall", label: "", width: "12%", align: "left" },
  { key: "time", label: "时间 Time", width: "7%", align: "left" },
  { key: "customer", label: "名字 Name", width: "12%", align: "left" },
  { key: "capacity", label: "容量 Capacity", width: "7%", align: "right" },
  { key: "pax", label: "人数 Pax", width: "5%", align: "right" },
  { key: "phone", label: "电话号码 Phone No", width: "11%", align: "left" },
  { key: "arrival", label: "抵达 Arrival", width: "6%", align: "center" },
  { key: "finished", label: "离席 Finished", width: "6%", align: "center" },
  {
    key: "food",
    label: "订餐 Food Reservation",
    width: "16%",
    align: "left",
  },
  { key: "remarks", label: "备注 Remarks", width: "18%", align: "left" },
];

const ALIGN_CLASS: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const COLUMN_BY_KEY = Object.fromEntries(
  COLUMNS.map((col) => [col.key, col])
) as Record<ColKey, ColumnDef>;

export const stickyHallCell =
  "sticky left-0 z-20 border-r border-border bg-background";

export const stickyColHeader = "sticky top-14 z-30 border-b";

export const stickyHallHeader = "sticky left-0 top-14 z-40 border-r border-b";

export const stickyGroupHeader =
  "sticky top-24 z-25 border-b border-border bg-secondary";

export function colClass(key: ColKey, extra?: string) {
  return cn(ALIGN_CLASS[COLUMN_BY_KEY[key].align], extra);
}

export function cellPadFor(key: ColKey) {
  if (key === "hall") return "pl-4 pr-2.5 py-2.5 sm:pl-5";
  if (key === "remarks") return "pl-2.5 pr-4 py-2.5 sm:pr-5";
  return "px-2.5 py-2.5";
}

export function headPadFor(key: ColKey) {
  if (key === "hall") return "pl-4 pr-2.5 sm:pl-5";
  if (key === "remarks") return "pl-2.5 pr-4 sm:pr-5";
  return "px-2.5";
}

export function columnHeadClass(session: Session) {
  return SESSION_THEME[session].columnHead;
}
