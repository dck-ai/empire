"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TOTAL_HALLS } from "@/lib/halls";
import { SESSION_THEME } from "@/lib/session-theme";
import { cn } from "@/lib/utils";
import type { BoardSectionDef } from "@/lib/board-layout";
import type { Reservation, StatusField } from "@/types/reservation";
import type { PendingKey } from "@/hooks/use-update-ops";
import { ReservationTable } from "@/features/reservation/reservation-table";

interface SessionSectionProps {
  section: BoardSectionDef;
  reservations: Reservation[];
  pendingKeys: ReadonlySet<PendingKey>;
  onToggleStatus: (id: string, field: StatusField, value: boolean) => void;
  onUpdateText: (
    id: string,
    field: "foodReservation" | "remarks",
    value: string
  ) => void;
  highlightId?: string | null;
}

function sectionCountLabel(
  session: SessionSectionProps["section"]["session"],
  count: number
): string {
  if (session === "WAITING") {
    return `${count} ${count === 1 ? "party" : "parties"}`;
  }
  return `${count} of ${TOTAL_HALLS} reserved`;
}

export function SessionSection({
  section,
  reservations,
  pendingKeys,
  onToggleStatus,
  onUpdateText,
  highlightId,
}: Readonly<SessionSectionProps>) {
  const theme = SESSION_THEME[section.session];
  const Icon = section.icon;
  const count = reservations.length;

  return (
    <Card
      id={section.anchor}
      className="scroll-mt-6 gap-0 overflow-clip rounded-none py-0"
    >
      <div
        className={cn(
          "sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b px-5",
          theme.header
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              theme.iconWrap
            )}
          >
            <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2
              className={cn(
                "truncate text-base font-semibold leading-none tracking-tight",
                theme.titleText
              )}
            >
              {section.title}
            </h2>
            <p
              className={cn(
                "mt-1 truncate text-xs leading-none",
                theme.subtitleText
              )}
            >
              {section.subtitle}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn("shrink-0 font-normal tabular-nums", theme.badge)}
        >
          {sectionCountLabel(section.session, count)}
        </Badge>
      </div>
      <CardContent className="p-0">
        <ReservationTable
          session={section.session}
          reservations={reservations}
          pendingKeys={pendingKeys}
          onToggleStatus={onToggleStatus}
          onUpdateText={onUpdateText}
          highlightId={highlightId}
        />
      </CardContent>
    </Card>
  );
}
