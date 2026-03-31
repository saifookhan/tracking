import Link from "next/link";
import styles from "./page.module.css";
import { prisma } from "@/lib/db";
import { formatMoneyCents } from "@/lib/money";
import { balanceAfterMonthsCents, monthlyPaymentCents } from "@/lib/loan";

export const dynamic = "force-dynamic";

export default function Home() {
  return <HomeInner />;
}

async function HomeInner() {
  const { settings, txs, dbReady } = await loadDashboardData();
  const currency = settings?.currency ?? "EUR";

  const loanConfigured =
    dbReady &&
    settings?.loanPrincipalCts != null &&
    settings.loanAprBps != null &&
    settings.loanTermMonths != null &&
    settings.loanStartDate != null;

  const incomeCts = txs
    .filter((t) => t.type === "RENT")
    .reduce((sum, t) => sum + t.amountCts, 0);
  const expenseCts = txs
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amountCts, 0);
  const cashflowCts = incomeCts - expenseCts;

  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: "long",
    year: "numeric",
  }).format(new Date());

  const monthsSinceStart = loanConfigured
    ? diffMonths(settings.loanStartDate!, new Date())
    : null;

  const monthlyPayment = loanConfigured
    ? monthlyPaymentCents({
        principalCts: settings.loanPrincipalCts!,
        aprBps: settings.loanAprBps!,
        termMonths: settings.loanTermMonths!,
      })
    : null;

  const remainingBalance = loanConfigured
    ? balanceAfterMonthsCents(
        {
          principalCts: settings.loanPrincipalCts!,
          aprBps: settings.loanAprBps!,
          termMonths: settings.loanTermMonths!,
        },
        Math.min(Math.max(monthsSinceStart ?? 0, 0), settings.loanTermMonths!),
      )
    : null;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Property tracker</h1>
          <p className={styles.subtitle}>
            Track rent, loan payments, and expenses—see monthly cashflow.
          </p>
        </header>

        <section className={styles.kpis}>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Income ({monthLabel})</div>
            <div className={styles.kpiValue}>{formatMoneyCents(incomeCts, currency)}</div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Expenses ({monthLabel})</div>
            <div className={styles.kpiValue}>{formatMoneyCents(expenseCts, currency)}</div>
          </div>
          <div className={styles.kpi}>
            <div className={styles.kpiLabel}>Cashflow ({monthLabel})</div>
            <div className={styles.kpiValue}>{formatMoneyCents(cashflowCts, currency)}</div>
          </div>
        </section>

        <section className={styles.loanBox}>
          <div className={styles.loanTitle}>Loan</div>
          {!dbReady ? (
            <div className={styles.loanHint}>
              Database is not initialized in this environment yet.
            </div>
          ) : loanConfigured ? (
            <div className={styles.loanGrid}>
              <div className={styles.loanItem}>
                <div className={styles.loanLabel}>Monthly payment (est.)</div>
                <div className={styles.loanValue}>
                  {formatMoneyCents(monthlyPayment!, currency)}
                </div>
              </div>
              <div className={styles.loanItem}>
                <div className={styles.loanLabel}>Remaining balance (est.)</div>
                <div className={styles.loanValue}>
                  {formatMoneyCents(remainingBalance!, currency)}
                </div>
              </div>
              <div className={styles.loanItem}>
                <div className={styles.loanLabel}>Months since start</div>
                <div className={styles.loanValue}>{monthsSinceStart}</div>
              </div>
            </div>
          ) : (
            <div className={styles.loanHint}>
              Not set up yet. Add loan details in <Link href="/settings">Settings</Link>.
            </div>
          )}
        </section>

        <section className={styles.grid}>
          <Link className={styles.cardPrimary} href="/rent/new">
            <div className={styles.cardTitle}>Add rent</div>
            <div className={styles.cardDesc}>Record a rent payment you received.</div>
          </Link>

          <Link className={styles.card} href="/expenses/new">
            <div className={styles.cardTitle}>Add bill / expense</div>
            <div className={styles.cardDesc}>
              Mortgage/loan, repairs, insurance, tax, HOA, utilities, etc.
            </div>
          </Link>

          <Link className={styles.card} href="/transactions">
            <div className={styles.cardTitle}>View transactions</div>
            <div className={styles.cardDesc}>See what you’ve entered so far.</div>
          </Link>

          <Link className={styles.card} href="/settings">
            <div className={styles.cardTitle}>Settings</div>
            <div className={styles.cardDesc}>Loan details, currency.</div>
          </Link>
        </section>

        <footer className={styles.footer}>
          <span className={styles.hint}>
            Next step: we’ll store entries in a database (SQLite) and show totals.
          </span>
        </footer>
      </main>
    </div>
  );
}

function diffMonths(from: Date, to: Date): number {
  return to.getFullYear() * 12 + to.getMonth() - (from.getFullYear() * 12 + from.getMonth());
}

async function loadDashboardData(): Promise<{
  settings: Awaited<ReturnType<typeof prisma.appSettings.findUnique>> | null;
  txs: Awaited<ReturnType<typeof prisma.transaction.findMany>>;
  dbReady: boolean;
}> {
  try {
    const settings = await prisma.appSettings.findUnique({ where: { id: 1 } });
    const txs = await prisma.transaction.findMany({
      where: {
        date: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      },
    });
    return { settings, txs, dbReady: true };
  } catch {
    // On some deployments (e.g. fresh/ephemeral DB), tables may not exist yet.
    return { settings: null, txs: [], dbReady: false };
  }
}
