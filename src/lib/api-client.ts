import type { ApiResponse } from "@/types/api";
import type { DailyBoard } from "@/types/reservation";
import type { LastSyncInfo, SyncResult } from "@/types/sync";

export class ApiClientError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

export function boardKey(date: string) {
  return ["reservations", date] as const;
}

export async function readApiJson<T>(
  response: Response
): Promise<ApiResponse<T>> {
  return (await response.json()) as ApiResponse<T>;
}

async function readOkJson<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    throw new ApiClientError(401, "Sign in required.");
  }
  const body = await readApiJson<T>(response);
  if (!body.ok) {
    throw new ApiClientError(response.status, body.error);
  }
  return body.data;
}

export async function fetchDailyBoard(
  date: string,
  signal?: AbortSignal
): Promise<DailyBoard> {
  const response = await fetch(
    `/api/reservations?date=${encodeURIComponent(date)}`,
    { signal, cache: "no-store" }
  );
  return readOkJson<DailyBoard>(response);
}

export async function fetchLastSync(
  signal?: AbortSignal
): Promise<LastSyncInfo | null> {
  const response = await fetch("/api/sync-sheets", {
    method: "GET",
    signal,
    cache: "no-store",
  });
  return readOkJson<LastSyncInfo | null>(response);
}

export async function postSheetSync(signal?: AbortSignal): Promise<SyncResult> {
  const response = await fetch("/api/sync-sheets", {
    method: "POST",
    signal,
    cache: "no-store",
  });
  return readOkJson<SyncResult>(response);
}
