"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebounce } from "@/hooks/use-debounce";
import { readApiJson } from "@/lib/api-client";
import { formatShortDate } from "@/utils/dates";
import type { SearchHit, Session } from "@/types/reservation";

const SESSION_LABELS: Record<Session, string> = {
  LUNCH: "Lunch",
  DINNER: "Dinner",
  WAITING: "Waiting",
};

interface SearchBarProps {
  onSelectHit: (hit: SearchHit) => void;
}

function modKeyLabel(): string {
  if (typeof navigator === "undefined") return "Ctrl";
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform) ? "⌘" : "Ctrl";
}

export function SearchBar({ onSelectHit }: Readonly<SearchBarProps>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modKey = modKeyLabel();

  const trimmed = debouncedQuery.trim();
  const canSearch = open && trimmed.length >= 2;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!canSearch) return;

    const controller = new AbortController();

    void (async () => {
      setIsSearching(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/reservations/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal, cache: "no-store" }
        );
        const body = await readApiJson<SearchHit[]>(response);
        if (controller.signal.aborted) return;

        if (!body.ok) {
          setHits([]);
          setError(body.error);
        } else {
          setHits(body.data);
          setError(null);
        }
      } catch {
        if (!controller.signal.aborted) {
          setHits([]);
          setError("Search is unavailable right now.");
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    })();

    return () => controller.abort();
  }, [canSearch, trimmed]);

  const pick = useCallback(
    (hit: SearchHit) => {
      onSelectHit(hit);
      setOpen(false);
      setQuery("");
      setHits([]);
      setError(null);
    },
    [onSelectHit]
  );

  const showHits = canSearch && !isSearching && !error && hits.length > 0;
  const showNoResults =
    canSearch && !isSearching && !error && hits.length === 0;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="relative h-8 w-full justify-start gap-2 border-dashed px-2.5 font-normal text-muted-foreground pr-12"
        onClick={() => setOpen(true)}
      >
        <Search className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
        <span className="truncate text-xs sm:text-sm">Search…</span>
        <kbd className="pointer-events-none absolute top-1/2 right-1.5 inline-flex h-5 -translate-y-1/2 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          {modKey}+K
        </kbd>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setQuery("");
            setHits([]);
            setError(null);
            setIsSearching(false);
          }
        }}
        title="Search reservations"
        description="Find a booking by customer name, phone, or hall."
        className="sm:max-w-lg"
      >
        <Command shouldFilter={false} className="rounded-xl">
          <CommandInput
            placeholder="Type at least 2 characters…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isSearching && canSearch && (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Searching…
              </div>
            )}

            {!canSearch && (
              <CommandEmpty>Type at least 2 characters to search.</CommandEmpty>
            )}

            {canSearch && !isSearching && error && (
              <CommandEmpty>{error}</CommandEmpty>
            )}

            {showNoResults && (
              <CommandEmpty>No matching reservations.</CommandEmpty>
            )}

            {showHits && (
              <CommandGroup heading="Reservations">
                {hits.map((hit) => (
                  <CommandItem
                    key={`${hit.id}-${hit.date}`}
                    value={`${hit.id} ${hit.customerName} ${hit.phone} ${hit.hall}`}
                    onSelect={() => pick(hit)}
                    className="items-start gap-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {hit.customerName || hit.hall}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {hit.phone || "No phone"}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {SESSION_LABELS[hit.session]}
                    </Badge>
                    <span className="ml-auto shrink-0 text-right text-xs text-muted-foreground">
                      <span className="block">{formatShortDate(hit.date)}</span>
                      <span className="block">{hit.time || hit.hall}</span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
