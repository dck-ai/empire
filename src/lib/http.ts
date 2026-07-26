import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types/api";
import { isAppError } from "@/lib/errors";

export function jsonOk<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ ok: true, data }, { status });
}

export function jsonFail(
  status: number,
  error: string
): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ ok: false, error }, { status });
}

export function jsonFromError(
  error: unknown,
  fallbackMessage: string,
  fallbackStatus = 500
): NextResponse<ApiResponse<never>> {
  if (isAppError(error)) {
    return jsonFail(error.status, error.message);
  }
  console.error(fallbackMessage, error);
  return jsonFail(fallbackStatus, fallbackMessage);
}
