"use client";

import {
  ChevronsUpDown,
  ClipboardList,
  CloudDownload,
  Loader2,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BrandLogo } from "@/components/brand-logo";
import { MiniCalendar } from "@/features/calendar/mini-calendar";
import { SearchBar } from "@/features/reservation/search-bar";
import { signOut, useSession } from "@/lib/auth-client";
import { BOARD_SECTIONS } from "@/lib/board-layout";
import { useSheetSync } from "@/hooks/use-sheet-sync";
import { formatLongDate, todayIso } from "@/utils/dates";
import type { DailySummary, SearchHit } from "@/types/reservation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  summary: DailySummary | null;
  summaryLoading?: boolean;
  onSelectHit: (hit: SearchHit) => void;
  onRefresh: () => void;
  onRefreshBoard: () => void;
  isRefreshing: boolean;
}

function initials(name: string, email: string): string {
  const source = name.trim() || email.trim();
  if (!source) return "?";
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function AccountFooter() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const handleSignOut = () => {
    void signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
        },
      },
    });
  };

  if (isPending) {
    return (
      <div className="flex h-11 items-center gap-2.5 rounded-lg px-2">
        <Skeleton className="size-8 rounded-full" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <p className="px-2 py-2 text-xs text-muted-foreground">Not signed in</p>
    );
  }

  const displayName = user.name || "Staff";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto w-full justify-start gap-2.5 px-2 py-2 font-normal"
          aria-label="Account menu"
        >
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground"
            aria-hidden="true"
          >
            {initials(user.name ?? "", user.email ?? "")}
          </span>
          <span className="min-w-0 flex-1 text-left leading-tight">
            <span className="block truncate text-sm font-medium">
              {displayName}
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </span>
          <ChevronsUpDown
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="start"
        className="w-(--radix-dropdown-menu-trigger-width) min-w-52"
      >
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-medium">{displayName}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Sidebar({
  selectedDate,
  onSelectDate,
  summary,
  summaryLoading = false,
  onSelectHit,
  onRefresh,
  onRefreshBoard,
  isRefreshing,
}: Readonly<SidebarProps>) {
  const { isSyncing, lastSyncLabel, lastSyncAbsolute, runSync } = useSheetSync({
    selectedDate,
    onSelectDate,
    onRefreshBoard,
  });
  const busy = isSyncing || isRefreshing;
  const isSelectedToday = selectedDate === todayIso();

  const scrollTo = (anchor: string) =>
    document
      .getElementById(anchor)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <aside className="flex flex-col md:sticky md:top-3 md:h-[calc(100dvh-1.5rem)] md:max-h-[calc(100dvh-1.5rem)] md:self-start">
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain pb-3">
        <BrandLogo className="px-1" showWordmark subtitle="Reservations" />

        <div className="space-y-2">
          <SearchBar onSelectHit={onSelectHit} />
          <div className="flex gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 flex-1"
                  disabled={busy}
                  onClick={onRefresh}
                  aria-label="Refresh board"
                >
                  <RefreshCw
                    className={cn("size-3.5", isRefreshing && "animate-spin")}
                  />
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reload board data</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 flex-1"
                  disabled={busy}
                  onClick={() => void runSync()}
                  aria-label="Sync from sheet"
                >
                  {isSyncing ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <CloudDownload className="size-3.5" />
                  )}
                  Sync
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Pull latest rows from Master Sheet
              </TooltipContent>
            </Tooltip>
          </div>
          <p
            className="px-0.5 text-[11px] leading-snug text-muted-foreground tabular-nums"
            title={
              lastSyncAbsolute
                ? `Last successful pull from Master Sheet: ${lastSyncAbsolute}`
                : "No successful Master Sheet pull yet (Sync or cron)"
            }
          >
            {lastSyncLabel
              ? `Latest sync · ${lastSyncLabel}`
              : "Latest sync · never"}
          </p>
        </div>

        <div className="space-y-2">
          <MiniCalendar selectedDate={selectedDate} onSelect={onSelectDate} />
        </div>

        <Separator />

        <div className="space-y-2.5">
          <div className="space-y-1 px-1">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Summary
            </p>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <p className="text-sm font-semibold tracking-tight text-foreground">
                {formatLongDate(selectedDate)}
              </p>
              {isSelectedToday ? (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  Today
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-0.5">
            {summaryLoading && !summary
              ? BOARD_SECTIONS.map((section) => (
                  <div
                    key={section.anchor}
                    className="flex h-9 items-center gap-2.5 px-2"
                  >
                    <Skeleton className="size-4 rounded" />
                    <Skeleton className="h-3.5 flex-1" />
                    <Skeleton className="h-3.5 w-10" />
                  </div>
                ))
              : BOARD_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  const value = summary
                    ? section.summaryCount(summary)
                    : null;
                  const meta = summary
                    ? section.summaryDetail(summary)
                    : "—";
                  return (
                    <button
                      key={section.anchor}
                      type="button"
                      onClick={() => scrollTo(section.anchor)}
                      className={cn(
                        "flex h-9 w-full items-center gap-2.5 rounded-md px-2 text-left text-sm transition-colors",
                        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                      )}
                    >
                      <Icon
                        className="size-4 shrink-0 text-muted-foreground"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {section.subtitle}
                      </span>
                      <span className="shrink-0 text-right leading-none">
                        <span className="block text-sm font-semibold tabular-nums">
                          {value ?? "—"}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground tabular-nums">
                          {meta}
                        </span>
                      </span>
                    </button>
                  );
                })}

            <div className="mt-1 flex h-9 items-center gap-2.5 border-t px-2 pt-2">
              <ClipboardList
                className="size-4 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 text-sm font-medium">Total</span>
              <span className="shrink-0 text-right leading-none">
                {summaryLoading && !summary ? (
                  <Skeleton className="ml-auto h-3.5 w-10" />
                ) : (
                  <>
                    <span className="block text-sm font-semibold tabular-nums">
                      {summary ? summary.totalCount : "—"}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-muted-foreground tabular-nums">
                      {summary ? `${summary.totalPax} pax` : "—"}
                    </span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t bg-background pt-3">
        <AccountFooter />
      </div>
    </aside>
  );
}
