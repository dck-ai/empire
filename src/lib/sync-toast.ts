import {
  deltaActivity,
  sumSyncDeltas,
  type SyncDateDelta,
  type SyncResult,
} from "@/types/sync";
import { formatShortDate } from "@/utils/dates";

export interface SyncToastAction {
  date: string;
  label: string;
}

export type SyncToastTone = "neutral" | "success";

export interface SyncToastContent {
  title: string;
  description?: string;
  action: SyncToastAction | null;
  duration: number;
  tone: SyncToastTone;
}

export function pickSyncActionDate(
  deltas: SyncDateDelta[],
  selectedDate: string
): string | null {
  const active = deltas.filter((d) => deltaActivity(d) > 0);
  if (active.length === 0) return null;

  const withCreated = active.filter((d) => d.created > 0);
  const pool = withCreated.length > 0 ? withCreated : active;
  return pool.find((d) => d.date !== selectedDate)?.date ?? pool[0].date;
}

export function shouldRefreshBoardAfterSync(
  result: SyncResult,
  selectedDate: string
): boolean {
  return result.deltas.some(
    (d) => d.date === selectedDate && deltaActivity(d) > 0
  );
}

function shortTitle(created: number, updated: number, seededOps: number): string {
  const changed = updated + seededOps;
  if (created > 0 && changed === 0) {
    return created === 1 ? "1 new booking" : `${created} new bookings`;
  }
  if (created === 0 && changed > 0) {
    return changed === 1 ? "1 booking updated" : `${changed} bookings updated`;
  }
  if (created > 0 && changed > 0) {
    return `${created} new, ${changed} updated`;
  }
  return "Synced";
}

function otherDatesDescription(
  deltas: SyncDateDelta[],
  selectedDate: string,
  formatDate: (iso: string) => string
): string | undefined {
  const others = deltas.filter(
    (d) => d.date !== selectedDate && deltaActivity(d) > 0
  );
  if (others.length === 0) return undefined;

  const shown = others.slice(0, 2);
  const parts = shown.map((d) => {
    const n = d.created + d.updated + d.seededOps;
    return `${n} on ${formatDate(d.date)}`;
  });
  const more = others.length - shown.length;
  if (more > 0) parts.push(`+${more} more`);
  return parts.join(" · ");
}

export function buildSyncToastContent(
  result: SyncResult,
  selectedDate: string,
  formatDate: (iso: string) => string = formatShortDate
): SyncToastContent {
  const { created, updated, seededOps } = sumSyncDeltas(result.deltas);
  const changed = created + updated + seededOps;

  if (changed === 0) {
    return {
      title: "No changes",
      action: null,
      duration: 2500,
      tone: "neutral",
    };
  }

  const actionDate = pickSyncActionDate(result.deltas, selectedDate);
  const action =
    actionDate != null && actionDate !== selectedDate
      ? { date: actionDate, label: "Open" }
      : null;

  return {
    title: shortTitle(created, updated, seededOps),
    description: otherDatesDescription(result.deltas, selectedDate, formatDate),
    action,
    duration: action ? 6000 : 3500,
    tone: "success",
  };
}
