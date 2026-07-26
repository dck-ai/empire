import "dotenv/config";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.env.SEED_USER_EMAIL?.trim();
  const password = process.env.SEED_USER_PASSWORD?.trim();
  const name = process.env.SEED_USER_NAME?.trim() || "Staff";

  if (!email || !password) {
    throw new Error("Set SEED_USER_EMAIL and SEED_USER_PASSWORD in .env");
  }

  if (password.length < 8) {
    throw new Error("SEED_USER_PASSWORD must be at least 8 characters.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`[seed] User already exists: ${email}`);
    return;
  }

  const userId = randomUUID();
  const now = new Date();
  const hashed = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.create({
      data: {
        id: userId,
        name,
        email,
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      },
    }),
    prisma.account.create({
      data: {
        id: randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: hashed,
        createdAt: now,
        updatedAt: now,
      },
    }),
  ]);

  console.log(`[seed] Created staff user: ${email}`);
}

main()
  .catch((error) => {
    console.error("[seed] failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
