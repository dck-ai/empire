import "server-only";

import type {
  MealPeriod,
  ReservationSession,
} from "@prisma/client";
import { getSheetsConfig } from "@/lib/config";
import { ConfigError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import {
  parseSheetRows,
  rowsNeedingOpsSeed,
  type ParsedSheetRow,
} from "@/lib/sheet-mapping";
import { isoToServiceDate, serviceDateToIso } from "@/utils/dates";
import { SheetsClient } from "@/services/sheets-client";
import {
  sumSyncDeltas,
  type LastSyncInfo,
  type SyncDateDelta,
  type SyncResult,
} from "@/types/sync";

const DATA_RANGE = "A1:Z";
const UPSERT_CHUNK = 50;
const SYNC_META_ID = "default";

type MirrorRow = {
  sheetRowId: number;
  serviceDate: Date;
  serviceTime: string;
  session: ReservationSession;
  mealPeriod: MealPeriod | null;
  hall: string;
  customerName: string;
  pax: number | null;
  phone: string;
  managerReview: string;
};

type DeltaBucket = {
  created: number;
  updated: number;
  seededOps: number;
};

function emptyResult(scanned: number, skipped: number, syncedAt: string): SyncResult {
  return { scanned, skipped, syncedAt, deltas: [] };
}

function reservationWriteData(row: ParsedSheetRow, syncedAt: Date) {
  return {
    sheetRowId: row.sheetRowId,
    serviceDate: isoToServiceDate(row.serviceDateIso),
    serviceTime: row.serviceTime,
    session: row.session,
    mealPeriod: row.mealPeriod,
    hall: row.hall,
    customerName: row.customerName,
    pax: row.pax,
    phone: row.phone,
    managerReview: row.managerReview,
    syncedAt,
  };
}

function mirrorChanged(existing: MirrorRow, row: ParsedSheetRow): boolean {
  return (
    serviceDateToIso(existing.serviceDate) !== row.serviceDateIso ||
    existing.serviceTime !== row.serviceTime ||
    existing.session !== row.session ||
    (existing.mealPeriod ?? null) !== (row.mealPeriod ?? null) ||
    existing.hall !== row.hall ||
    existing.customerName !== row.customerName ||
    existing.pax !== row.pax ||
    existing.phone !== row.phone ||
    existing.managerReview !== row.managerReview
  );
}

function bump(
  counts: Map<string, DeltaBucket>,
  date: string,
  field: keyof DeltaBucket,
  by = 1
) {
  const current = counts.get(date) ?? { created: 0, updated: 0, seededOps: 0 };
  current[field] += by;
  counts.set(date, current);
}

function toDeltas(counts: Map<string, DeltaBucket>): SyncDateDelta[] {
  return [...counts.entries()]
    .map(([date, bucket]) => ({ date, ...bucket }))
    .filter((d) => d.created + d.updated + d.seededOps > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function persistSyncMeta(result: SyncResult): Promise<void> {
  const totals = sumSyncDeltas(result.deltas);
  await prisma.syncMeta.upsert({
    where: { id: SYNC_META_ID },
    create: {
      id: SYNC_META_ID,
      syncedAt: new Date(result.syncedAt),
      scanned: result.scanned,
      skipped: result.skipped,
      created: totals.created,
      updated: totals.updated,
      seededOps: totals.seededOps,
    },
    update: {
      syncedAt: new Date(result.syncedAt),
      scanned: result.scanned,
      skipped: result.skipped,
      created: totals.created,
      updated: totals.updated,
      seededOps: totals.seededOps,
    },
  });
}

export async function getLastSyncInfo(): Promise<LastSyncInfo | null> {
  const row = await prisma.syncMeta.findUnique({ where: { id: SYNC_META_ID } });
  if (!row) return null;
  return {
    at: row.syncedAt.toISOString(),
    scanned: row.scanned,
    created: row.created,
    updated: row.updated,
    seededOps: row.seededOps,
  };
}

export async function applyParsedRows(
  parsed: ParsedSheetRow[],
  now = new Date()
): Promise<Pick<SyncResult, "deltas">> {
  if (parsed.length === 0) {
    return { deltas: [] };
  }

  return prisma.$transaction(async (tx) => {
    const sheetIds = parsed.map((r) => r.sheetRowId);
    const existingRows = await tx.reservation.findMany({
      where: { sheetRowId: { in: sheetIds } },
      select: {
        sheetRowId: true,
        serviceDate: true,
        serviceTime: true,
        session: true,
        mealPeriod: true,
        hall: true,
        customerName: true,
        pax: true,
        phone: true,
        managerReview: true,
      },
    });
    const existingBySheet = new Map(
      existingRows.map((r) => [r.sheetRowId, r] as const)
    );

    const dateCounts = new Map<string, DeltaBucket>();
    const dirty: ParsedSheetRow[] = [];

    for (const row of parsed) {
      const existing = existingBySheet.get(row.sheetRowId);
      if (!existing) {
        bump(dateCounts, row.serviceDateIso, "created");
        dirty.push(row);
      } else if (mirrorChanged(existing, row)) {
        bump(dateCounts, row.serviceDateIso, "updated");
        dirty.push(row);
      }
    }

    for (let i = 0; i < dirty.length; i += UPSERT_CHUNK) {
      const chunk = dirty.slice(i, i + UPSERT_CHUNK);
      await Promise.all(
        chunk.map((row) => {
          const { sheetRowId, ...mirror } = reservationWriteData(row, now);
          return tx.reservation.upsert({
            where: { sheetRowId },
            create: { sheetRowId, ...mirror },
            update: mirror,
          });
        })
      );
    }

    const reservations = await tx.reservation.findMany({
      where: { sheetRowId: { in: sheetIds } },
      select: { id: true, sheetRowId: true, ops: { select: { id: true } } },
    });

    const needingSeed = rowsNeedingOpsSeed(
      parsed,
      reservations.map((r) => ({
        sheetRowId: r.sheetRowId,
        hasOps: Boolean(r.ops),
      }))
    );

    const bySheetId = new Map(
      reservations.map((r) => [r.sheetRowId, r.id] as const)
    );

    const opsToCreate = needingSeed.flatMap((row) => {
      const reservationId = bySheetId.get(row.sheetRowId);
      if (!reservationId) return [];
      bump(dateCounts, row.serviceDateIso, "seededOps");
      return [
        {
          reservationId,
          arrival: row.arrival,
          finished: row.finished,
          foodReservation: row.foodReservation,
          remarks: row.remarks,
          seededFoodReservation: row.foodReservation || null,
          seededRemarks: row.remarks || null,
        },
      ];
    });

    if (opsToCreate.length > 0) {
      await tx.reservationOps.createMany({
        data: opsToCreate,
        skipDuplicates: true,
      });
    }

    return { deltas: toDeltas(dateCounts) };
  });
}

export async function syncSheetsToDatabase(): Promise<SyncResult> {
  const syncedAt = new Date().toISOString();
  const sheetsConfig = getSheetsConfig();
  if (!sheetsConfig) {
    throw new ConfigError(
      "Google Sheets credentials are not configured. Set GOOGLE_SHEET_ID and GOOGLE_SERVICE_ACCOUNT_JSON."
    );
  }

  const client = new SheetsClient(sheetsConfig);
  const rows = await client.readRange(DATA_RANGE);
  const { parsed, skipped } = parseSheetRows(rows);
  const scanned = Math.max(0, rows.length - 1);

  const result: SyncResult =
    parsed.length === 0
      ? emptyResult(scanned, skipped, syncedAt)
      : {
          scanned,
          skipped,
          syncedAt,
          ...(await applyParsedRows(parsed, new Date(syncedAt))),
        };

  await persistSyncMeta(result);
  return result;
}
