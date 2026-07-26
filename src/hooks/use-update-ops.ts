"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { readApiJson } from "@/lib/api-client";
import { redirectToLogin } from "@/lib/auth-client-session";
import type { Reservation, StatusField } from "@/types/reservation";
import { opsSlice } from "@/types/reservation";
import type { UpdateOpsInput } from "@/types/api";

export type PendingKey = `${string}:${string}`;

interface UseUpdateOpsOptions {
  mutateReservation: (
    id: string,
    patch: Partial<Reservation>
  ) => Reservation | null;
}

export interface UseUpdateOpsResult {
  updateStatus: (id: string, field: StatusField, value: boolean) => void;
  updateTextField: (
    id: string,
    field: "foodReservation" | "remarks",
    value: string
  ) => void;
  pendingKeys: ReadonlySet<PendingKey>;
}

function pendingKey(id: string, field: string): PendingKey {
  return `${id}:${field}`;
}

export function useUpdateOps({
  mutateReservation,
}: UseUpdateOpsOptions): UseUpdateOpsResult {
  const [pendingKeys, setPendingKeys] = useState<ReadonlySet<PendingKey>>(
    new Set()
  );
  const seqById = useRef(new Map<string, number>());

  const setPending = useCallback((key: PendingKey, pending: boolean) => {
    setPendingKeys((current) => {
      const next = new Set(current);
      if (pending) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  const patchOps = useCallback(
    (
      id: string,
      field: string,
      body: UpdateOpsInput,
      localPatch: Partial<Reservation>
    ) => {
      const previous = mutateReservation(id, localPatch);
      if (!previous) return;

      const previousOps = opsSlice(previous);
      const seq = (seqById.current.get(id) ?? 0) + 1;
      seqById.current.set(id, seq);
      const key = pendingKey(id, field);
      setPending(key, true);

      void (async () => {
        try {
          const response = await fetch(`/api/reservations/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (response.status === 401) {
            redirectToLogin();
            return;
          }

          const payload = await readApiJson<Reservation>(response);
          if (seqById.current.get(id) !== seq) return;

          if (!payload.ok) {
            mutateReservation(id, previousOps);
            toast.error(payload.error, { duration: 5000 });
            return;
          }

          mutateReservation(id, opsSlice(payload.data));
        } catch (cause) {
          console.error("[useUpdateOps] PATCH failed:", cause);
          if (seqById.current.get(id) !== seq) return;
          mutateReservation(id, previousOps);
          toast.error("Couldn't save — reverted", { duration: 5000 });
        } finally {
          if (seqById.current.get(id) === seq) {
            setPending(key, false);
          }
        }
      })();
    },
    [mutateReservation, setPending]
  );

  const updateStatus = useCallback(
    (id: string, field: StatusField, value: boolean) => {
      patchOps(id, field, { [field]: value }, { [field]: value });
    },
    [patchOps]
  );

  const updateTextField = useCallback(
    (id: string, field: "foodReservation" | "remarks", value: string) => {
      patchOps(id, field, { [field]: value }, { [field]: value });
    },
    [patchOps]
  );

  return { updateStatus, updateTextField, pendingKeys };
}

export function isFieldPending(
  pendingKeys: ReadonlySet<PendingKey>,
  id: string,
  field: string
): boolean {
  return pendingKeys.has(pendingKey(id, field));
}
