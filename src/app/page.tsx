import { Suspense } from "react";
import { DashboardShell } from "@/features/dashboard/dashboard-shell";
import { BoardSkeleton } from "@/features/reservation/board-skeleton";
import { getDailyBoard } from "@/services/reservation-repository";
import { requireSession } from "@/lib/session";
import { todayIso } from "@/utils/dates";
import { isoDateSchema } from "@/types/api";
import type { DailyBoard } from "@/types/reservation";

interface HomePageProps {
  searchParams: Promise<{ date?: string }>;
}

async function loadInitialBoard(date: string): Promise<DailyBoard | null> {
  try {
    await requireSession();
    return await getDailyBoard(date);
  } catch {
    return null;
  }
}

export default async function HomePage({
  searchParams,
}: Readonly<HomePageProps>) {
  const params = await searchParams;
  const parsed = isoDateSchema.safeParse(params.date);
  const date = parsed.success ? parsed.data : todayIso();
  const initialBoard = await loadInitialBoard(date);

  return (
    <Suspense
      fallback={
        <div className="w-full px-3 py-3 sm:px-4 lg:px-5">
          <BoardSkeleton />
        </div>
      }
    >
      <DashboardShell initialDate={date} initialBoard={initialBoard} />
    </Suspense>
  );
}
