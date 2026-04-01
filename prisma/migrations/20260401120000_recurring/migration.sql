-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "RecurringFrequency" AS ENUM ('MONTHLY');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "RecurringRule" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amountCts" INTEGER NOT NULL,
    "category" TEXT,
    "notes" TEXT,
    "frequency" "RecurringFrequency" NOT NULL DEFAULT 'MONTHLY',
    "dayOfMonth" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "lastRunAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RecurringRule_pkey" PRIMARY KEY ("id")
);

