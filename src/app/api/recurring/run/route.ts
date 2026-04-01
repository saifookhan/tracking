import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function ym(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function clampDayOfMonth(year: number, monthIndex0: number, day: number) {
  // We intentionally cap at 28 to avoid month-length edge cases.
  return new Date(year, monthIndex0, Math.min(Math.max(day, 1), 28));
}

export async function POST() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const rules = await prisma.recurringRule.findMany({ where: { enabled: true } });
  let created = 0;

  for (const r of rules) {
    // Only run once the rule has started.
    const start = r.startDate;
    if (start > now) continue;

    // Only generate when the due day has passed/arrived this month.
    if (today < r.dayOfMonth) continue;

    const dueDate = clampDayOfMonth(year, month, r.dayOfMonth);
    const key = `recurring:${r.id}:${ym(dueDate)}`;

    // Use transaction idempotencyKey to avoid duplicates.
    const existing = await prisma.transaction.findUnique({
      where: { idempotencyKey: key },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.transaction.create({
      data: {
        idempotencyKey: key,
        type: r.type,
        date: dueDate,
        amountCts: r.amountCts,
        category: r.category,
        notes: r.notes ?? r.name,
      },
    });

    await prisma.recurringRule.update({
      where: { id: r.id },
      data: { lastRunAt: now },
    });

    created += 1;
  }

  return NextResponse.json({ created });
}

