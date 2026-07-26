export interface SyncDateDelta {
  date: string;
  created: number;
  updated: number;
  seededOps: number;
}

export interface SyncTotals {
  created: number;
  updated: number;
  seededOps: number;
}

export interface SyncResult {
  scanned: number;
  skipped: number;
  syncedAt: string;
  deltas: SyncDateDelta[];
}

export interface LastSyncInfo {
  at: string;
  scanned: number;
  created: number;
  updated: number;
  seededOps: number;
}

export function emptySyncTotals(): SyncTotals {
  return { created: 0, updated: 0, seededOps: 0 };
}

export function sumSyncDeltas(deltas: SyncDateDelta[]): SyncTotals {
  return deltas.reduce(
    (acc, d) => ({
      created: acc.created + d.created,
      updated: acc.updated + d.updated,
      seededOps: acc.seededOps + d.seededOps,
    }),
    emptySyncTotals()
  );
}

export function lastSyncFromResult(result: SyncResult): LastSyncInfo {
  const totals = sumSyncDeltas(result.deltas);
  return {
    at: result.syncedAt,
    scanned: result.scanned,
    created: totals.created,
    updated: totals.updated,
    seededOps: totals.seededOps,
  };
}

export function deltaActivity(d: SyncDateDelta): number {
  return d.created + d.updated + d.seededOps;
}
