"use client";

import { toast } from "sonner";
import { ApiClientError } from "@/lib/api-client";

export function redirectToLogin(message = "Session expired"): void {
  toast.error(message, { duration: 5000 });
  window.location.href = "/login";
}

export function handleClientAuthError(error: unknown): boolean {
  if (error instanceof ApiClientError && error.status === 401) {
    redirectToLogin();
    return true;
  }
  return false;
}
