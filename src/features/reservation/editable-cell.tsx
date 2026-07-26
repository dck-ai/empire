"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: string;
  disabled?: boolean;
  isPending?: boolean;
  ariaLabel: string;
  onCommit: (next: string) => void;
}

export function EditableCell({
  value,
  disabled,
  isPending,
  ariaLabel,
  onCommit,
}: Readonly<EditableCellProps>) {
  const [draft, setDraft] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [focused, setFocused] = useState(false);

  if (value !== prevValue && !focused) {
    setPrevValue(value);
    setDraft(value);
  }

  if (disabled) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="relative w-full min-w-0">
      <Input
        type="text"
        value={draft}
        aria-label={ariaLabel}
        aria-busy={isPending}
        disabled={isPending}
        onChange={(event) => setDraft(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setPrevValue(draft);
          if (draft !== value) onCommit(draft);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
          if (event.key === "Escape") {
            setDraft(value);
            setPrevValue(value);
            event.currentTarget.blur();
          }
        }}
        className={cn(
          "h-8 w-full min-w-0 border-transparent bg-transparent px-0 shadow-none transition-colors",
          "hover:bg-background/80 hover:border-border",
          "focus-visible:border-ring focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring/40 focus-visible:ring-offset-0",
          focused && "border-ring bg-background px-1 ring-1 ring-ring/40",
          isPending && "cursor-wait pr-7"
        )}
      />
      {isPending && (
        <Loader2
          className="pointer-events-none absolute top-1/2 right-1.5 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
