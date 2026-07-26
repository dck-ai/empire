"use client";

import { Fragment } from "react";
import { cn } from "@/lib/utils";
import {
  HALL_GROUPS,
  MIN_WAITING_SLOTS,
  hallKey,
} from "@/lib/halls";
import type { Reservation, Session, StatusField } from "@/types/reservation";
import type { PendingKey } from "@/hooks/use-update-ops";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookingRow } from "@/features/reservation/booking-row";
import {
  COLUMNS,
  colClass,
  columnHeadClass,
  headPadFor,
  stickyColHeader,
  stickyGroupHeader,
  stickyHallHeader,
} from "@/features/reservation/table-columns";

interface ReservationTableProps {
  session: Session;
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

type RowHandlers = Pick<
  ReservationTableProps,
  "pendingKeys" | "onToggleStatus" | "onUpdateText" | "highlightId"
>;

export function ReservationTable({
  session,
  reservations,
  pendingKeys,
  onToggleStatus,
  onUpdateText,
  highlightId,
}: Readonly<ReservationTableProps>) {
  const rowProps: RowHandlers = {
    pendingKeys,
    onToggleStatus,
    onUpdateText,
    highlightId,
  };
  const headClass = columnHeadClass(session);

  return (
    <Table
      className="w-full min-w-[820px] table-fixed border-separate border-spacing-0"
      containerClassName="max-md:overflow-x-auto md:overflow-visible"
    >
      <colgroup>
        {COLUMNS.map((col) => (
          <col key={col.key} style={{ width: col.width }} />
        ))}
      </colgroup>
      <TableHeader>
        <TableRow className="border-b hover:bg-transparent">
          {COLUMNS.map((header) => (
            <TableHead
              key={header.key}
              title={header.label || undefined}
              className={cn(
                "h-10 text-[11px] font-semibold leading-tight sm:text-xs",
                headPadFor(header.key),
                colClass(header.key),
                stickyColHeader,
                headClass,
                header.key === "hall" && stickyHallHeader
              )}
            >
              {header.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody className="[&_tr:last-child]:border-b">
        {session === "WAITING" ? (
          <WaitingRows reservations={reservations} {...rowProps} />
        ) : (
          <HallRows reservations={reservations} {...rowProps} />
        )}
      </TableBody>
    </Table>
  );
}

function GroupHeaderRow({ label }: Readonly<{ label: string }>) {
  return (
    <TableRow className="border-b bg-secondary hover:bg-secondary">
      <TableCell
        colSpan={COLUMNS.length}
        className={cn(
          "py-2 pl-4 pr-4 text-xs font-medium tracking-wide text-muted-foreground sm:pl-5 sm:pr-5",
          stickyGroupHeader
        )}
      >
        {label}
      </TableCell>
    </TableRow>
  );
}

function HallRows({
  reservations,
  ...rowProps
}: { reservations: Reservation[] } & RowHandlers) {
  const byHall = new Map<string, Reservation>();
  const overflow: Reservation[] = [];

  for (const reservation of reservations) {
    const key = hallKey(reservation.hall);
    if (byHall.has(key)) overflow.push(reservation);
    else byHall.set(key, reservation);
  }

  // Precompute outside the JSX map so render stays pure (no Set mutations mid-render).
  const matchedKeys = new Set<string>();
  for (const group of HALL_GROUPS) {
    for (const hall of group.halls) {
      const key = hallKey(hall.name);
      if (byHall.has(key)) matchedKeys.add(key);
    }
  }

  const unmatched = [...byHall.entries()]
    .filter(([key]) => !matchedKeys.has(key))
    .map(([, reservation]) => reservation)
    .concat(overflow);
  const showOther = unmatched.length > 0;

  return (
    <>
      {HALL_GROUPS.map((group) => (
        <Fragment key={group.id}>
          <GroupHeaderRow label={group.label} />
          {group.halls.map((hall) => {
            const booking = byHall.get(hallKey(hall.name)) ?? null;
            return (
              <BookingRow
                key={hall.name}
                label={hall.name}
                hall={hall}
                reservation={booking}
                status={booking ? "reserved" : "available"}
                {...rowProps}
              />
            );
          })}
        </Fragment>
      ))}

      {showOther && (
        <>
          <GroupHeaderRow label="Other bookings (hall not on the template)" />
          {unmatched.map((reservation) => (
            <BookingRow
              key={reservation.id}
              label={reservation.hall}
              hall={null}
              reservation={reservation}
              status="reserved"
              {...rowProps}
            />
          ))}
        </>
      )}
    </>
  );
}

function WaitingRows({
  reservations,
  ...rowProps
}: { reservations: Reservation[] } & RowHandlers) {
  const slotCount = Math.max(MIN_WAITING_SLOTS, reservations.length);

  return (
    <>
      {Array.from({ length: slotCount }, (_, index) => {
        const reservation = reservations[index] ?? null;
        return (
          <BookingRow
            key={reservation?.id ?? `slot-${index}`}
            label={String(index + 1)}
            hall={null}
            reservation={reservation}
            status={reservation ? "waiting" : "empty"}
            {...rowProps}
          />
        );
      })}
    </>
  );
}
