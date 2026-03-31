import { prisma } from "@/lib/db";
import { toCents } from "@/lib/money";
import { NextResponse } from "next/server";

export async function GET() {
  const settings = await prisma.appSettings.findUnique({ where: { id: 1 } });
  return NextResponse.json({ settings: settings ?? null });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const currency = body.currency;
  const loanPrincipal = body.loanPrincipal;
  const loanApr = body.loanApr;
  const loanTermMonths = body.loanTermMonths;
  const loanStartDate = body.loanStartDate;

  if (currency != null && typeof currency !== "string") {
    return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
  }
  if (loanPrincipal != null && typeof loanPrincipal !== "string" && typeof loanPrincipal !== "number") {
    return NextResponse.json({ error: "Invalid loanPrincipal" }, { status: 400 });
  }
  if (loanApr != null && typeof loanApr !== "string" && typeof loanApr !== "number") {
    return NextResponse.json({ error: "Invalid loanApr" }, { status: 400 });
  }
  if (loanTermMonths != null && typeof loanTermMonths !== "number") {
    return NextResponse.json({ error: "Invalid loanTermMonths" }, { status: 400 });
  }
  if (loanStartDate != null && (typeof loanStartDate !== "string" || Number.isNaN(Date.parse(loanStartDate)))) {
    return NextResponse.json({ error: "Invalid loanStartDate" }, { status: 400 });
  }

  const data = {
    currency: currency?.trim() || undefined,
    loanPrincipalCts: loanPrincipal == null ? undefined : toCents(loanPrincipal),
    loanAprBps: loanApr == null ? undefined : Math.round(Number(loanApr) * 100),
    loanTermMonths: loanTermMonths == null ? undefined : loanTermMonths,
    loanStartDate: loanStartDate == null ? undefined : new Date(loanStartDate),
  } as const;

  if (data.loanAprBps != null && (!Number.isFinite(data.loanAprBps) || data.loanAprBps < 0)) {
    return NextResponse.json({ error: "Invalid loanApr" }, { status: 400 });
  }
  if (data.loanTermMonths != null && (!Number.isFinite(data.loanTermMonths) || data.loanTermMonths <= 0)) {
    return NextResponse.json({ error: "Invalid loanTermMonths" }, { status: 400 });
  }
  if (data.loanPrincipalCts != null && data.loanPrincipalCts < 0) {
    return NextResponse.json({ error: "Invalid loanPrincipal" }, { status: 400 });
  }

  const settings = await prisma.appSettings.upsert({
    where: { id: 1 },
    create: { id: 1, ...data },
    update: data,
  });

  return NextResponse.json({ settings });
}

