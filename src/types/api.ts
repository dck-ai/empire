import { z } from "zod";

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected an ISO date (YYYY-MM-DD)");

export const reservationIdSchema = z.uuid("Expected a reservation uuid");

export const updateOpsSchema = z
  .object({
    arrival: z.boolean().optional(),
    finished: z.boolean().optional(),
    foodReservation: z.string().optional(),
    remarks: z.string().optional(),
  })
  .refine(
    (value) =>
      value.arrival !== undefined ||
      value.finished !== undefined ||
      value.foodReservation !== undefined ||
      value.remarks !== undefined,
    { message: "Provide at least one of arrival, finished, foodReservation, remarks." }
  );

export type UpdateOpsInput = z.infer<typeof updateOpsSchema>;

export const searchQuerySchema = z.object({
  q: z.string().trim().min(2, "Type at least 2 characters"),
});

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiFailure {
  ok: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
