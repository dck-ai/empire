"use client";

import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Reservation, StatusField } from "@/types/reservation";

interface StatusCheckboxProps {
  reservation: Reservation | null;
  field: StatusField;
  isPending: boolean;
  onToggle: (id: string, field: StatusField, value: boolean) => void;
}

const FIELD_LABELS: Record<StatusField, string> = {
  arrival: "arrived",
  finished: "finished",
};

function statusTooltip(
  field: StatusField,
  isPending: boolean,
  isChecked: boolean
): string {
  if (isPending) return "Saving…";
  if (isChecked) return `Clear ${FIELD_LABELS[field]}`;
  return `Mark ${FIELD_LABELS[field]}`;
}

export function StatusCheckbox({
  reservation,
  field,
  isPending,
  onToggle,
}: Readonly<StatusCheckboxProps>) {
  if (!reservation) {
    return (
      <span className="relative inline-flex size-5 items-center justify-center">
        <Checkbox
          disabled
          aria-label={`No booking — ${FIELD_LABELS[field]}`}
        />
      </span>
    );
  }

  const isChecked = reservation[field];
  const label = `Mark ${reservation.customerName || reservation.hall} as ${FIELD_LABELS[field]}`;

  return (
    <span className="relative inline-flex size-5 items-center justify-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <Checkbox
              checked={isChecked}
              aria-label={label}
              aria-busy={isPending}
              disabled={isPending}
              className={cn(isPending && "cursor-wait opacity-60")}
              onCheckedChange={(checked) =>
                onToggle(reservation.id, field, checked === true)
              }
            />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {statusTooltip(field, isPending, isChecked)}
        </TooltipContent>
      </Tooltip>
      {isPending && (
        <Loader2
          className="pointer-events-none absolute -right-3.5 size-3 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
      )}
    </span>
  );
}
