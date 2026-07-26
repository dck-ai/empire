"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BoardErrorProps {
  message: string;
  onRetry: () => void;
}

export function BoardError({
  message,
  onRetry,
}: Readonly<BoardErrorProps>) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-medium">Couldn&apos;t load reservations</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {message}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw aria-hidden="true" /> Retry
        </Button>
      </CardContent>
    </Card>
  );
}
