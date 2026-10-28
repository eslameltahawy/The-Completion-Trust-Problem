import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

// Vercel’s deployment filesystem is read-only. The build seeds prisma/dev.db,
// and each server instance copies that file into writable /tmp on first use.
function prepareVercelDatabase() {
  if (process.env.VERCEL !== "1" || process.env.NEXT_RUNTIME !== "nodejs") return;
  const dest = "/tmp/career180.db";
  if (!existsSync(dest)) {
    const source = path.join(process.cwd(), "prisma", "dev.db");
    if (!existsSync(source)) {
      throw new Error("The seeded database was not included in this deployment.");
    }
    copyFileSync(source, dest);
  }
  process.env.DATABASE_URL = "file:/tmp/career180.db";
}

prepareVercelDatabase();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
