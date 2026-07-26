"use client";

import { useCallback, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import {
  allBoardReservations,
  type DailyBoard,
  type Reservation,
} from "@/types/reservation";
import { buildDailyBoard } from "@/lib/board";
import { boardKey, fetchDailyBoard } from "@/lib/api-client";
import { handleClientAuthError } from "@/lib/auth-client-session";

const POLL_INTERVAL_MS = 60_000;

export interface UseReservationsResult {
  board: DailyBoard | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isSwitchingDate: boolean;
  error: string | null;
  refetch: (options?: { manual?: boolean }) => void;
  mutateReservation: (
    id: string,
    patch: Partial<Reservation>
  ) => Reservation | null;
}

export function useReservations(
  date: string,
  fallbackData?: DailyBoard | null
): UseReservationsResult {
  const [manualRefresh, setManualRefresh] = useState(false);
  const ssrBoard =
    fallbackData?.date === date ? fallbackData : undefined;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    boardKey(date),
    ([, d]: readonly ["reservations", string]) => fetchDailyBoard(d),
    {
      fallbackData: ssrBoard,
      revalidateOnMount: ssrBoard ? false : undefined,
      refreshInterval: POLL_INTERVAL_MS,
      refreshWhenHidden: false,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      keepPreviousData: true,
      dedupingInterval: 2_000,
      onError: (err) => {
        if (handleClientAuthError(err)) return;
        const message =
          err instanceof Error ? err.message : "Couldn't load board";
        if (data) toast.error(message);
      },
    }
  );

  const refetch = useCallback(
    (options?: { manual?: boolean }) => {
      const manual = options?.manual === true;
      if (manual) setManualRefresh(true);
      void mutate().finally(() => {
        if (manual) setManualRefresh(false);
      });
    },
    [mutate]
  );

  const mutateReservation = useCallback(
    (id: string, patch: Partial<Reservation>): Reservation | null => {
      let previous: Reservation | null = null;

      void mutate(
        (current) => {
          if (!current) return current;
          const all = allBoardReservations(current);
          const found = all.find((r) => r.id === id) ?? null;
          if (!found) return current;
          previous = found;
          const next = all.map((r) =>
            r.id === id ? { ...r, ...patch } : r
          );
          return buildDailyBoard(current.date, next);
        },
        { revalidate: false }
      );

      return previous;
    },
    [mutate]
  );

  let errorMessage: string | null = null;
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (error) {
    errorMessage =
      "Couldn't reach the reservation service. Check your connection and retry.";
  }

  const board = data ?? null;
  const isSwitchingDate = board != null && board.date !== date;

  return {
    board,
    isLoading: isLoading && board == null,
    isRefreshing: manualRefresh && isValidating,
    isSwitchingDate,
    error: board != null ? null : errorMessage,
    refetch,
    mutateReservation,
  };
}
