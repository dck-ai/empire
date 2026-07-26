import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/errors";

export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  return session;
}
