"use client";

import type { DailyBoard, StatusField } from "@/types/reservation";
import type { PendingKey } from "@/hooks/use-update-ops";
import { BOARD_SECTIONS } from "@/lib/board-layout";
import { SessionSection } from "@/features/reservation/session-section";

interface ReservationBoardProps {
  board: DailyBoard;
  pendingKeys: ReadonlySet<PendingKey>;
  onToggleStatus: (id: string, field: StatusField, value: boolean) => void;
  onUpdateText: (
    id: string,
    field: "foodReservation" | "remarks",
    value: string
  ) => void;
  highlightId?: string | null;
}

export function ReservationBoard({
  board,
  pendingKeys,
  onToggleStatus,
  onUpdateText,
  highlightId,
}: Readonly<ReservationBoardProps>) {
  return (
    <div className="space-y-4">
      {BOARD_SECTIONS.map((section) => (
        <SessionSection
          key={section.anchor}
          section={section}
          reservations={section.reservations(board)}
          pendingKeys={pendingKeys}
          onToggleStatus={onToggleStatus}
          onUpdateText={onUpdateText}
          highlightId={highlightId}
        />
      ))}
    </div>
  );
}
