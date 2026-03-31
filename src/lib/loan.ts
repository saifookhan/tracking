type LoanInput = {
  principalCts: number;
  aprBps: number; // e.g. 350 = 3.50%
  termMonths: number;
};

export function monthlyPaymentCents({ principalCts, aprBps, termMonths }: LoanInput): number {
  if (termMonths <= 0) throw new Error("termMonths must be > 0");
  if (principalCts < 0) throw new Error("principal must be >= 0");

  const principal = principalCts / 100;
  const r = (aprBps / 100) / 100 / 12; // APR% -> monthly rate

  if (r === 0) {
    return Math.round((principal / termMonths) * 100);
  }

  // Payment = P * r * (1+r)^n / ((1+r)^n - 1)
  const pow = Math.pow(1 + r, termMonths);
  const payment = (principal * r * pow) / (pow - 1);
  return Math.round(payment * 100);
}

export function balanceAfterMonthsCents(
  { principalCts, aprBps, termMonths }: LoanInput,
  monthsPaid: number,
): number {
  if (monthsPaid <= 0) return principalCts;
  if (monthsPaid >= termMonths) return 0;

  const principal = principalCts / 100;
  const r = (aprBps / 100) / 100 / 12;

  if (r === 0) {
    const remaining = principal * (1 - monthsPaid / termMonths);
    return Math.max(0, Math.round(remaining * 100));
  }

  const payment = monthlyPaymentCents({ principalCts, aprBps, termMonths }) / 100;
  // Balance after k payments:
  // B_k = P(1+r)^k - Payment * ((1+r)^k - 1)/r
  const pow = Math.pow(1 + r, monthsPaid);
  const balance = principal * pow - (payment * (pow - 1)) / r;
  return Math.max(0, Math.round(balance * 100));
}

