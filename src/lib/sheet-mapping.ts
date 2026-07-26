import type { MealPeriod, ReservationSession } from "@prisma/client";
import { parseSheetDate } from "@/utils/dates";
import {
  cleanText,
  parseSheetBoolean,
  parseSheetNumber,
  resolveSession,
  resolveWaitingMealPeriod,
} from "@/utils/normalize";

export type FieldKey =
  | "date"
  | "time"
  | "type"
  | "hall"
  | "customerName"
  | "pax"
  | "phone"
  | "arrival"
  | "finished"
  | "foodReservation"
  | "remarks"
  | "waitingList"
  | "managerReview";

const HEADER_ALIASES: Record<FieldKey, string[]> = {
  date: ["reservation date", "date", "预约日期", "日期"],
  time: ["reservation time", "time", "时间"],
  type: ["type", "session", "类型"],
  hall: ["hall", "hall/table", "hall / table", "table", "厅", "桌"],
  customerName: ["customer name", "name", "customer", "名字", "姓名"],
  pax: ["pax", "guests", "人数"],
  phone: ["phone", "phone number", "phone no", "电话", "电话号码"],
  arrival: ["arrival", "arrived", "抵达"],
  finished: ["finished", "finish", "离席"],
  foodReservation: ["food reservation", "food", "订餐"],
  remarks: ["remarks", "remark", "notes", "备注"],
  waitingList: ["waiting list", "waiting", "waitlist", "等待列表", "等待"],
  managerReview: ["manager review", "review", "审核"],
};

export type ColumnMap = Partial<Record<FieldKey, number>>;

const REQUIRED_FIELDS: FieldKey[] = ["date", "hall", "customerName"];

export function buildColumnMap(headerRow: string[]): ColumnMap {
  const normalized = headerRow.map((cell) => cleanText(cell).toLowerCase());
  const map: ColumnMap = {};

  (Object.keys(HEADER_ALIASES) as FieldKey[]).forEach((field) => {
    const aliases = HEADER_ALIASES[field];
    const index = normalized.findIndex((header) => aliases.includes(header));
    if (index >= 0) map[field] = index;
  });

  const missing = REQUIRED_FIELDS.filter((field) => map[field] === undefined);
  if (missing.length > 0) {
    throw new Error(
      `Master sheet is missing required column(s): ${missing.join(", ")}. ` +
        `Found headers: ${headerRow.filter(Boolean).join(" | ")}`
    );
  }

  return map;
}

function cell(row: string[], index: number | undefined): string {
  if (index === undefined) return "";
  return String(row[index] ?? "");
}

export interface ParsedSheetRow {
  sheetRowId: number;
  serviceDateIso: string;
  serviceTime: string;
  session: ReservationSession;
  mealPeriod: MealPeriod | null;
  hall: string;
  customerName: string;
  pax: number | null;
  phone: string;
  managerReview: string;
  arrival: boolean;
  finished: boolean;
  foodReservation: string;
  remarks: string;
}

export function parseSheetRow(
  row: string[],
  rowNumber: number,
  columns: ColumnMap
): ParsedSheetRow | null {
  const serviceDateIso = parseSheetDate(cell(row, columns.date));
  const hall = cleanText(cell(row, columns.hall));
  if (!serviceDateIso || !hall) return null;

  const serviceTime = cleanText(cell(row, columns.time));
  const typeCell = cell(row, columns.type);
  const session = resolveSession(typeCell, cell(row, columns.waitingList));
  const mealPeriod =
    session === "WAITING"
      ? resolveWaitingMealPeriod(typeCell, serviceTime)
      : null;

  return {
    sheetRowId: rowNumber,
    serviceDateIso,
    serviceTime,
    session,
    mealPeriod,
    hall,
    customerName: cleanText(cell(row, columns.customerName)),
    pax: parseSheetNumber(cell(row, columns.pax)),
    phone: cleanText(cell(row, columns.phone)),
    managerReview: cleanText(cell(row, columns.managerReview)),
    arrival: parseSheetBoolean(cell(row, columns.arrival)),
    finished: parseSheetBoolean(cell(row, columns.finished)),
    foodReservation: cleanText(cell(row, columns.foodReservation)),
    remarks: cleanText(cell(row, columns.remarks)),
  };
}

export function parseSheetRows(rows: string[][]): {
  parsed: ParsedSheetRow[];
  skipped: number;
} {
  if (rows.length === 0) return { parsed: [], skipped: 0 };

  const columns = buildColumnMap(rows[0]);
  const parsed: ParsedSheetRow[] = [];
  let skipped = 0;

  for (let i = 1; i < rows.length; i += 1) {
    const row = parseSheetRow(rows[i], i + 1, columns);
    if (!row) {
      skipped += 1;
      continue;
    }
    parsed.push(row);
  }

  return { parsed, skipped };
}

export function rowsNeedingOpsSeed(
  parsed: ParsedSheetRow[],
  existing: ReadonlyArray<{ sheetRowId: number; hasOps: boolean }>
): ParsedSheetRow[] {
  const bySheet = new Map(existing.map((r) => [r.sheetRowId, r.hasOps]));
  return parsed.filter((row) => bySheet.get(row.sheetRowId) !== true);
}
