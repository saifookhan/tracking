import { prisma } from "@/lib/db";
import { toCents } from "@/lib/money";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const enabled = body.enabled;
  const name = body.name;
  const type = body.type;
  const dayOfMonth = body.dayOfMonth;
  const amount = body.amount;
  const category = body.category;
  const notes = body.notes;
  const startDate = body.startDate;

  if (enabled != null && typeof enabled !== "boolean") {
    return NextResponse.json({ error: "Invalid enabled" }, { status: 400 });
  }
  if (typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }
  if (type !== "RENT" && type !== "EXPENSE") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (typeof dayOfMonth !== "number" || !Number.isFinite(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 28) {
    return NextResponse.json({ error: "Invalid dayOfMonth (1-28)" }, { status: 400 });
  }
  if (typeof amount !== "string" && typeof amount !== "number") {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (typeof startDate !== "string" || Number.isNaN(Date.parse(startDate))) {
    return NextResponse.json({ error: "Invalid startDate" }, { status: 400 });
  }
  if (category != null && typeof category !== "string") {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (notes != null && typeof notes !== "string") {
    return NextResponse.json({ error: "Invalid notes" }, { status: 400 });
  }

  const rule = await prisma.recurringRule.create({
    data: {
      enabled: enabled ?? true,
      name: name.trim(),
      type,
      amountCts: toCents(amount),
      category: category?.trim() || null,
      notes: notes?.trim() || null,
      frequency: "MONTHLY",
      dayOfMonth,
      startDate: new Date(startDate),
    },
  });

  return NextResponse.json({ id: rule.id }, { status: 201 });
}

