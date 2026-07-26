"use client";

import { memo, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Hall } from "@/lib/halls";
import type { Reservation, StatusField } from "@/types/reservation";
import { StatusCheckbox } from "@/features/reservation/status-checkbox";
import { EditableCell } from "@/features/reservation/editable-cell";
import {
  isFieldPending,
  type PendingKey,
} from "@/hooks/use-update-ops";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  cellPadFor,
  colClass,
  stickyHallCell,
} from "@/features/reservation/table-columns";

export type RowStatus = "available" | "reserved" | "waiting" | "empty";

const STATUS_DOT: Record<RowStatus, string> = {
  available: "bg-status-available",
  reserved: "bg-status-reserved",
  waiting: "bg-status-waiting",
  empty: "bg-status-empty",
};

const STATUS_LABEL: Record<RowStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  waiting: "Waiting",
  empty: "Empty",
};

const PENDING_FIELDS = [
  "arrival",
  "finished",
  "foodReservation",
  "remarks",
] as const;

export interface BookingRowProps {
  label: string;
  hall: Hall | null;
  reservation: Reservation | null;
  status: RowStatus;
  pendingKeys: ReadonlySet<PendingKey>;
  onToggleStatus: (id: string, field: StatusField, value: boolean) => void;
  onUpdateText: (
    id: string,
    field: "foodReservation" | "remarks",
    value: string
  ) => void;
  highlightId?: string | null;
}

function rowBackground(status: RowStatus): string {
  if (status === "reserved") return "bg-destructive/5";
  if (status === "waiting") return "bg-amber-50/70 dark:bg-amber-950/20";
  return "bg-background";
}

function isHighlighted(
  reservation: Reservation | null,
  highlightId?: string | null
): boolean {
  return Boolean(reservation?.id && highlightId === reservation.id);
}

function pendingEqualsForRow(
  id: string | undefined,
  prev: ReadonlySet<PendingKey>,
  next: ReadonlySet<PendingKey>
): boolean {
  if (!id) return true;
  return PENDING_FIELDS.every(
    (field) => isFieldPending(prev, id, field) === isFieldPending(next, id, field)
  );
}

function bookingRowPropsEqual(
  prev: Readonly<BookingRowProps>,
  next: Readonly<BookingRowProps>
): boolean {
  if (
    prev.label !== next.label ||
    prev.hall !== next.hall ||
    prev.status !== next.status ||
    prev.reservation !== next.reservation ||
    prev.onToggleStatus !== next.onToggleStatus ||
    prev.onUpdateText !== next.onUpdateText
  ) {
    return false;
  }

  if (
    isHighlighted(prev.reservation, prev.highlightId) !==
    isHighlighted(next.reservation, next.highlightId)
  ) {
    return false;
  }

  return pendingEqualsForRow(
    next.reservation?.id,
    prev.pendingKeys,
    next.pendingKeys
  );
}

function BookingRowComponent({
  label,
  hall,
  reservation,
  status,
  pendingKeys,
  onToggleStatus,
  onUpdateText,
  highlightId,
}: Readonly<BookingRowProps>) {
  const capacity = reservation?.capacity ?? hall?.capacity ?? null;
  const id = reservation?.id;
  const highlighted = isHighlighted(reservation, highlightId);
  const rowBg = rowBackground(status);

  const commitFood = useCallback(
    (next: string) => {
      if (reservation) onUpdateText(reservation.id, "foodReservation", next);
    },
    [onUpdateText, reservation]
  );

  const commitRemarks = useCallback(
    (next: string) => {
      if (reservation) onUpdateText(reservation.id, "remarks", next);
    },
    [onUpdateText, reservation]
  );

  return (
    <TableRow
      id={id ? `reservation-${id}` : undefined}
      data-reservation-id={id}
      className={cn(
        "group/row border-b",
        status === "reserved" && "bg-destructive/5",
        status === "waiting" && "bg-amber-50/70 dark:bg-amber-950/20",
        !reservation && "text-muted-foreground",
        "focus-within:bg-background",
        highlighted && "bg-primary/8 ring-1 ring-inset ring-primary/35"
      )}
    >
      <TableCell
        className={cn(
          "font-medium text-foreground",
          cellPadFor("hall"),
          colClass("hall"),
          stickyHallCell,
          rowBg,
          "group-focus-within/row:bg-background",
          highlighted && "bg-primary/8"
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  STATUS_DOT[status]
                )}
                aria-label={STATUS_LABEL[status]}
              />
            </TooltipTrigger>
            <TooltipContent side="right">{STATUS_LABEL[status]}</TooltipContent>
          </Tooltip>
          <span className="truncate">{label}</span>
        </span>
      </TableCell>

      <TableCell
        className={cn("tabular-nums", cellPadFor("time"), colClass("time"))}
      >
        {reservation?.time || "—"}
      </TableCell>

      <TableCell
        className={cn(
          "font-medium text-foreground",
          cellPadFor("customer"),
          colClass("customer")
        )}
      >
        {reservation?.customerName ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block truncate">{reservation.customerName}</span>
            </TooltipTrigger>
            <TooltipContent>{reservation.customerName}</TooltipContent>
          </Tooltip>
        ) : (
          "—"
        )}
      </TableCell>

      <TableCell
        className={cn(
          "tabular-nums text-muted-foreground",
          cellPadFor("capacity"),
          colClass("capacity")
        )}
      >
        {capacity ?? "—"}
      </TableCell>

      <TableCell
        className={cn("tabular-nums", cellPadFor("pax"), colClass("pax"))}
      >
        {reservation?.pax ?? "—"}
      </TableCell>

      <TableCell className={cn(cellPadFor("phone"), colClass("phone"))}>
        {reservation?.phone ? (
          <a
            href={`tel:${reservation.phone.replace(/\s+/g, "")}`}
            className="block truncate text-primary underline-offset-2 hover:underline"
          >
            {reservation.phone}
          </a>
        ) : (
          "—"
        )}
      </TableCell>

      <TableCell className={cn(cellPadFor("arrival"), colClass("arrival"))}>
        <div className="flex justify-center">
          <StatusCheckbox
            reservation={reservation}
            field="arrival"
            isPending={id ? isFieldPending(pendingKeys, id, "arrival") : false}
            onToggle={onToggleStatus}
          />
        </div>
      </TableCell>

      <TableCell className={cn(cellPadFor("finished"), colClass("finished"))}>
        <div className="flex justify-center">
          <StatusCheckbox
            reservation={reservation}
            field="finished"
            isPending={
              id ? isFieldPending(pendingKeys, id, "finished") : false
            }
            onToggle={onToggleStatus}
          />
        </div>
      </TableCell>

      <TableCell
        className={cn("whitespace-normal", cellPadFor("food"), colClass("food"))}
      >
        <EditableCell
          value={reservation?.foodReservation ?? ""}
          disabled={!reservation}
          isPending={
            id ? isFieldPending(pendingKeys, id, "foodReservation") : false
          }
          ariaLabel={`Food reservation for ${reservation?.customerName ?? "empty"}`}
          onCommit={commitFood}
        />
      </TableCell>

      <TableCell
        className={cn(
          "whitespace-normal",
          cellPadFor("remarks"),
          colClass("remarks")
        )}
      >
        <EditableCell
          value={reservation?.remarks ?? ""}
          disabled={!reservation}
          isPending={id ? isFieldPending(pendingKeys, id, "remarks") : false}
          ariaLabel={`Remarks for ${reservation?.customerName ?? "empty"}`}
          onCommit={commitRemarks}
        />
      </TableCell>
    </TableRow>
  );
}

export const BookingRow = memo(BookingRowComponent, bookingRowPropsEqual);
