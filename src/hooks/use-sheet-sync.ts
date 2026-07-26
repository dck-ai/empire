"use client";

import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import {
  ApiClientError,
  fetchLastSync,
  postSheetSync,
} from "@/lib/api-client";
import { handleClientAuthError } from "@/lib/auth-client-session";
import {
  formatAbsoluteSyncTime,
  formatLastSyncLabel,
} from "@/lib/last-sync";
import {
  buildSyncToastContent,
  shouldRefreshBoardAfterSync,
} from "@/lib/sync-toast";
import { lastSyncFromResult, type LastSyncInfo } from "@/types/sync";

const LAST_SYNC_KEY = "last-sync" as const;

interface UseSheetSyncOptions {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onRefreshBoard: () => void;
}

export interface UseSheetSyncResult {
  isSyncing: boolean;
  lastSync: LastSyncInfo | null;
  lastSyncLabel: string | null;
  lastSyncAbsolute: string | null;
  runSync: () => Promise<void>;
}

export function useSheetSync({
  selectedDate,
  onSelectDate,
  onRefreshBoard,
}: UseSheetSyncOptions): UseSheetSyncResult {
  const [isSyncing, setIsSyncing] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());

  const { data: lastSync = null, mutate: mutateLastSync } = useSWR(
    LAST_SYNC_KEY,
    () => fetchLastSync(),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshWhenHidden: false,
      onError: (error) => {
        handleClientAuthError(error);
      },
    }
  );

  useEffect(() => {
    if (!lastSync) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, [lastSync]);

  const runSync = useCallback(async () => {
    setIsSyncing(true);
    const toastId = toast.loading("Syncing…");
    try {
      const result = await postSheetSync();
      const info = lastSyncFromResult(result);
      await mutateLastSync(info, { revalidate: false });
      setNowTick(Date.now());

      const content = buildSyncToastContent(result, selectedDate);
      const openDate = content.action?.date;
      const options = {
        id: toastId,
        description: content.description,
        duration: content.duration,
        ...(content.action && openDate
          ? {
              action: {
                label: content.action.label,
                onClick: () => onSelectDate(openDate),
              },
            }
          : {}),
      };

      if (content.tone === "success") {
        toast.success(content.title, options);
      } else {
        toast.message(content.title, options);
      }

      if (shouldRefreshBoardAfterSync(result, selectedDate)) {
        onRefreshBoard();
      }
    } catch (error) {
      if (handleClientAuthError(error)) {
        toast.dismiss(toastId);
        return;
      }
      const message =
        error instanceof ApiClientError ? error.message : "Sync failed";
      toast.error(message, { id: toastId, duration: 5000 });
    } finally {
      setIsSyncing(false);
    }
  }, [mutateLastSync, onRefreshBoard, onSelectDate, selectedDate]);

  return {
    isSyncing,
    lastSync,
    lastSyncLabel: lastSync
      ? formatLastSyncLabel(lastSync.at, new Date(nowTick))
      : null,
    lastSyncAbsolute: lastSync
      ? formatAbsoluteSyncTime(new Date(lastSync.at))
      : null,
    runSync,
  };
}
