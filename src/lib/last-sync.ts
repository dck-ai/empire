export type { LastSyncInfo } from "@/types/sync";

export function formatLastSyncLabel(iso: string, now = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "unknown";

  const diffMs = now.getTime() - then.getTime();
  if (diffMs < 0) {
    return formatAbsoluteSyncTime(then);
  }

  const sec = Math.floor(diffMs / 1000);
  if (sec < 45) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr${hr === 1 ? "" : "s"} ago`;

  return formatAbsoluteSyncTime(then);
}

export function formatAbsoluteSyncTime(date: Date): string {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
