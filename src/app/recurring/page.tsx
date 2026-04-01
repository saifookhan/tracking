import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoneyCents } from "@/lib/money";
import { RecurringForm } from "@/components/RecurringForm";

export const dynamic = "force-dynamic";

export default async function RecurringPage() {
  let rules: Awaited<ReturnType<typeof prisma.recurringRule.findMany>> = [];
  let currency = "EUR";

  try {
    const settings = await prisma.appSettings.findUnique({ where: { id: 1 } });
    currency = settings?.currency ?? "EUR";
    rules = await prisma.recurringRule.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    rules = [];
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/">← Home</Link>
        <h1 style={{ fontSize: 24, margin: 0 }}>Recurring</h1>
      </div>

      <p style={{ marginTop: 12, opacity: 0.75 }}>
        Add monthly recurring items (rent, mortgage, utilities). The app will create due
        transactions automatically.
      </p>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 16, margin: 0 }}>Add recurring rule</h2>
        <RecurringForm />
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 16, margin: 0 }}>Your rules</h2>
        {rules.length === 0 ? (
          <p style={{ marginTop: 12, opacity: 0.75 }}>No recurring rules yet.</p>
        ) : (
          <div style={{ marginTop: 12, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left" }}>
                  <th style={{ padding: "8px 6px", borderBottom: "1px solid #ccc" }}>
                    Enabled
                  </th>
                  <th style={{ padding: "8px 6px", borderBottom: "1px solid #ccc" }}>
                    Name
                  </th>
                  <th style={{ padding: "8px 6px", borderBottom: "1px solid #ccc" }}>
                    Type
                  </th>
                  <th style={{ padding: "8px 6px", borderBottom: "1px solid #ccc" }}>
                    Day
                  </th>
                  <th style={{ padding: "8px 6px", borderBottom: "1px solid #ccc" }}>
                    Amount
                  </th>
                  <th style={{ padding: "8px 6px", borderBottom: "1px solid #ccc" }}>
                    Category
                  </th>
                  <th style={{ padding: "8px 6px", borderBottom: "1px solid #ccc" }}>
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id}>
                    <td style={{ padding: "8px 6px", borderBottom: "1px solid #eee" }}>
                      {r.enabled ? "Yes" : "No"}
                    </td>
                    <td style={{ padding: "8px 6px", borderBottom: "1px solid #eee" }}>
                      {r.name}
                    </td>
                    <td style={{ padding: "8px 6px", borderBottom: "1px solid #eee" }}>
                      {r.type}
                    </td>
                    <td style={{ padding: "8px 6px", borderBottom: "1px solid #eee" }}>
                      {r.dayOfMonth}
                    </td>
                    <td style={{ padding: "8px 6px", borderBottom: "1px solid #eee" }}>
                      {formatMoneyCents(r.amountCts, currency)}
                    </td>
                    <td style={{ padding: "8px 6px", borderBottom: "1px solid #eee" }}>
                      {r.category ?? "—"}
                    </td>
                    <td style={{ padding: "8px 6px", borderBottom: "1px solid #eee" }}>
                      {r.notes ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

