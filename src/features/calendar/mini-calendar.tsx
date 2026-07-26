"use client";

import { useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { fromIsoDate, toIsoDate, todayIso } from "@/utils/dates";

interface MiniCalendarProps {
  selectedDate: string;
  onSelect: (date: string) => void;
}

function yearBounds(year: number) {
  return {
    startMonth: new Date(year - 1, 0),
    endMonth: new Date(year + 2, 11),
  };
}

export function MiniCalendar({
  selectedDate,
  onSelect,
}: Readonly<MiniCalendarProps>) {
  const selected = fromIsoDate(selectedDate);
  const [month, setMonth] = useState<Date>(() => fromIsoDate(selectedDate));
  const [prevSelectedDate, setPrevSelectedDate] = useState(selectedDate);
  const isToday = selectedDate === todayIso();
  const year = selectedDate.slice(0, 4);
  const bounds = useMemo(() => yearBounds(Number(year)), [year]);

  if (selectedDate !== prevSelectedDate) {
    setPrevSelectedDate(selectedDate);
    const next = fromIsoDate(selectedDate);
    if (
      month.getFullYear() !== next.getFullYear() ||
      month.getMonth() !== next.getMonth()
    ) {
      setMonth(next);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <Calendar
        mode="single"
        selected={selected}
        month={month}
        onMonthChange={setMonth}
        captionLayout="dropdown"
        startMonth={bounds.startMonth}
        endMonth={bounds.endMonth}
        onSelect={(date) => {
          if (!date) return;
          onSelect(toIsoDate(date));
        }}
        className="mx-auto w-fit bg-transparent p-0 [--cell-size:2rem]"
      />
      {!isToday && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-full max-w-[14.5rem] text-xs text-muted-foreground"
          onClick={() => {
            const today = todayIso();
            onSelect(today);
            setMonth(fromIsoDate(today));
          }}
        >
          Jump to today
        </Button>
      )}
    </div>
  );
}
