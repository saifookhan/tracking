import { prisma } from "@/lib/db";
import { toCents } from "@/lib/money";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const type = body.type;
  const date = body.date;
  const amount = body.amount;
  const category = body.category;
  const notes = body.notes;
  const idempotencyKey = body.idempotencyKey;

  if (type !== "RENT" && type !== "EXPENSE") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (typeof date !== "string" || Number.isNaN(Date.parse(date))) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  if (typeof amount !== "string" && typeof amount !== "number") {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }
  if (category != null && typeof category !== "string") {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (notes != null && typeof notes !== "string") {
    return NextResponse.json({ error: "Invalid notes" }, { status: 400 });
  }
  if (idempotencyKey != null && typeof idempotencyKey !== "string") {
    return NextResponse.json({ error: "Invalid idempotencyKey" }, { status: 400 });
  }

  const amountCts = toCents(amount);
  if (amountCts < 0) {
    return NextResponse.json({ error: "Amount must be >= 0" }, { status: 400 });
  }

  if (typeof idempotencyKey === "string" && idempotencyKey.trim().length > 0) {
    const existing = await prisma.transaction.findUnique({
      where: { idempotencyKey: idempotencyKey.trim() },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ id: existing.id, duplicate: true }, { status: 200 });
    }
  }

  const tx = await prisma.transaction.create({
    data: {
      idempotencyKey: idempotencyKey?.trim() || null,
      type,
      date: new Date(date),
      amountCts,
      category: category?.trim() || null,
      notes: notes?.trim() || null,
    },
  });

  return NextResponse.json({ id: tx.id }, { status: 201 });
}

