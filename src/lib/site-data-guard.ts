import { prisma } from "@/lib/prisma";

async function ensureSiteDataTable(): Promise<void> {
  console.warn("[SiteData Guard] Table missing - recreating...");
  await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "SiteData" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SiteData_pkey" PRIMARY KEY ("id")
  )`;
  await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "SiteData_key_key" ON "SiteData"("key")`;
  console.warn("[SiteData Guard] Table recreated successfully");
}

export async function withSiteDataGuard<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e: unknown) {
    const error = e as { code?: string };
    if (error.code === "P2021") {
      await ensureSiteDataTable();
      return await fn();
    }
    throw e;
  }
}
