import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var __prisma: PrismaClient | undefined;
}

const connectionString =
  process.env.DATABASE_URL ??
  // Fallback to a clearly-invalid local URL so builds can succeed even before
  // DATABASE_URL is configured (queries will fail and be handled by pages).
  "postgresql://invalid:invalid@127.0.0.1:5432/invalid?connect_timeout=1";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = globalThis.__prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalThis.__prisma = prisma;

