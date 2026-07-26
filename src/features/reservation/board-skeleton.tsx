import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BOARD_SECTIONS } from "@/lib/board-layout";

function TableSkeleton({ rows }: Readonly<{ rows: number }>) {
  return (
    <div className="space-y-0 divide-y">
      <div className="grid grid-cols-[1.2fr_0.6fr_1.2fr_0.5fr_0.4fr_0.9fr_0.5fr_0.5fr_1fr_1fr] gap-2 bg-muted/40 px-3 py-2">
        {Array.from({ length: 10 }, (_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          className="grid grid-cols-[1.2fr_0.6fr_1.2fr_0.5fr_0.4fr_0.9fr_0.5fr_0.5fr_1fr_1fr] items-center gap-2 px-3 py-2.5"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="size-2 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="ml-auto h-4 w-8" />
          <Skeleton className="ml-auto h-4 w-6" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="mx-auto size-4 rounded" />
          <Skeleton className="mx-auto size-4 rounded" />
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
}

const SECTION_ROWS = [10, 4, 10] as const;

export function BoardSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      {BOARD_SECTIONS.map((section, index) => (
        <Card key={section.anchor} className="gap-0 rounded-none py-0">
          <CardHeader className="flex-row items-center gap-2.5 border-b py-3">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="ml-auto h-5 w-24 rounded-full" />
          </CardHeader>
          <CardContent className="overflow-hidden p-0">
            <TableSkeleton rows={SECTION_ROWS[index] ?? 6} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
