"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { todayIso } from "@/utils/dates";
import { useReservations } from "@/hooks/use-reservations";
import { useUpdateOps } from "@/hooks/use-update-ops";
import { ErrorBoundary } from "@/components/error-boundary";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/features/dashboard/sidebar";
import { ReservationBoard } from "@/features/reservation/reservation-board";
import { BoardSkeleton } from "@/features/reservation/board-skeleton";
import { BoardError } from "@/features/reservation/error-state";
import type { DailyBoard, SearchHit, StatusField } from "@/types/reservation";
import type { PendingKey } from "@/hooks/use-update-ops";
import { cn } from "@/lib/utils";
import { isoDateSchema } from "@/types/api";

interface DashboardShellProps {
  initialDate?: string;
  initialBoard?: DailyBoard | null;
}

function resolveDate(raw: string | null | undefined): string {
  if (!raw) return todayIso();
  const parsed = isoDateSchema.safeParse(raw);
  return parsed.success ? parsed.data : todayIso();
}

interface BoardPanelProps {
  board: DailyBoard | null;
  selectedDate: string;
  error: string | null;
  showSkeleton: boolean;
  showStale: boolean;
  pendingKeys: ReadonlySet<PendingKey>;
  highlightId: string | null;
  onRetry: () => void;
  onToggleStatus: (id: string, field: StatusField, value: boolean) => void;
  onUpdateText: (
    id: string,
    field: "foodReservation" | "remarks",
    value: string
  ) => void;
}

function BoardPanel({
  board,
  selectedDate,
  error,
  showSkeleton,
  showStale,
  pendingKeys,
  highlightId,
  onRetry,
  onToggleStatus,
  onUpdateText,
}: Readonly<BoardPanelProps>) {
  if (showSkeleton) {
    return <BoardSkeleton />;
  }

  if (error && !board) {
    return <BoardError message={error} onRetry={onRetry} />;
  }

  if (!board) {
    return null;
  }

  return (
    <div className="relative space-y-4">
      {showStale && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center pt-8">
          <Badge
            variant="secondary"
            className="pointer-events-none gap-1.5 px-3 py-1.5 shadow-md"
          >
            <Loader2 className="size-3.5 animate-spin" />
            Loading {selectedDate}…
          </Badge>
        </div>
      )}
      <div
        className={cn(
          "space-y-4 transition-opacity",
          showStale && "opacity-60"
        )}
      >
        {board.summary.totalCount === 0 && (
          <Badge variant="outline" className="w-fit">
            No bookings for this day
          </Badge>
        )}
        <ErrorBoundary>
          <ReservationBoard
            board={board}
            pendingKeys={pendingKeys}
            onToggleStatus={onToggleStatus}
            onUpdateText={onUpdateText}
            highlightId={highlightId}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}

export function DashboardShell({
  initialDate,
  initialBoard = null,
}: Readonly<DashboardShellProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedDate = resolveDate(searchParams.get("date") ?? initialDate);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const setDate = useCallback(
    (date: string) => {
      setHighlightId(null);
      const params = new URLSearchParams(searchParams.toString());
      if (date === todayIso()) params.delete("date");
      else params.set("date", date);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams]
  );

  const {
    board,
    isLoading,
    isRefreshing,
    isSwitchingDate,
    error,
    refetch,
    mutateReservation,
  } = useReservations(selectedDate, initialBoard);

  const { updateStatus, updateTextField, pendingKeys } = useUpdateOps({
    mutateReservation,
  });

  const handleSearchHit = useCallback(
    (hit: SearchHit) => {
      setHighlightId(hit.id);
      setDate(hit.date);
    },
    [setDate]
  );

  useEffect(() => {
    if (!highlightId || board?.date !== selectedDate) return;

    const timer = window.setTimeout(() => {
      document
        .getElementById(`reservation-${highlightId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);

    const clear = window.setTimeout(() => setHighlightId(null), 3500);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(clear);
    };
  }, [highlightId, board, selectedDate]);

  const showSkeleton = isLoading && !board;
  const showStale = Boolean(board) && isSwitchingDate;
  const busy = isLoading || isSwitchingDate;
  const summary =
    board?.date === selectedDate ? board.summary : null;

  return (
    <div className="w-full px-3 py-3 sm:px-4 lg:px-5">
      <div className="grid gap-4 md:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
        <Sidebar
          selectedDate={selectedDate}
          onSelectDate={setDate}
          summary={summary}
          summaryLoading={busy}
          onSelectHit={handleSearchHit}
          onRefresh={() => refetch({ manual: true })}
          onRefreshBoard={() => refetch()}
          isRefreshing={isRefreshing}
        />

        <main className="min-w-0 space-y-4" aria-busy={busy}>
          <BoardPanel
            board={board}
            selectedDate={selectedDate}
            error={error}
            showSkeleton={showSkeleton}
            showStale={showStale}
            pendingKeys={pendingKeys}
            highlightId={highlightId}
            onRetry={refetch}
            onToggleStatus={updateStatus}
            onUpdateText={updateTextField}
          />
        </main>
      </div>
    </div>
  );
}
