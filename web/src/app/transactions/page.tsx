import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoneyCents } from "@/lib/money";

export default function TransactionsPage() {
  // Server Component: runs on the server, can query DB directly.
  // (Route Handlers are used for writes from client forms.)
  //
  // Note: keep this page dynamic since it depends on DB.
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/">← Home</Link>
        <h1 style={{ fontSize: 24, margin: 0 }}>Transactions</h1>
      </div>

      <TransactionsTable />
    </main>
  );
}

async function TransactionsTable() {
  const settings = await prisma.appSettings.findUnique({ where: { id: 1 } });
  const currency = settings?.currency ?? "EUR";

  const txs = await prisma.transaction.findMany({
    orderBy: { date: "desc" },
    take: 100,
  });

  if (txs.length === 0) {
    return <p style={{ marginTop: 16, opacity: 0.75 }}>No entries yet.</p>;
  }

  return (
    <div style={{ marginTop: 16, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th style={{ padding: "8px 6px", borderBottom: "1px solid #ccc" }}>
              Date
            </th>
            <th style={{ padding: "8px 6px", borderBottom: "1px solid #ccc" }}>
              Type
            </th>
            <th style={{ padding: "8px 6px", borderBottom: "1px solid #ccc" }}>
              Category
            </th>
            <th style={{ padding: "8px 6px", borderBottom: "1px solid #ccc" }}>
              Notes
            </th>
            <th style={{ padding: "8px 6px", borderBottom: "1px solid #ccc" }}>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {txs.map((t) => (
            <tr key={t.id}>
              <td style={{ padding: "8px 6px", borderBottom: "1px solid #eee" }}>
                {t.date.toISOString().slice(0, 10)}
              </td>
              <td style={{ padding: "8px 6px", borderBottom: "1px solid #eee" }}>
                {t.type}
              </td>
              <td style={{ padding: "8px 6px", borderBottom: "1px solid #eee" }}>
                {t.category ?? "—"}
              </td>
              <td style={{ padding: "8px 6px", borderBottom: "1px solid #eee" }}>
                {t.notes ?? "—"}
              </td>
              <td
                style={{
                  padding: "8px 6px",
                  borderBottom: "1px solid #eee",
                  whiteSpace: "nowrap",
                }}
              >
                {formatMoneyCents(t.amountCts, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

