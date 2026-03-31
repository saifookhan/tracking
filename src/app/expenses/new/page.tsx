import Link from "next/link";
import { TransactionForm } from "@/components/TransactionForm";

const CATEGORIES = [
  "Loan / mortgage",
  "Repairs & maintenance",
  "Insurance",
  "Property tax",
  "HOA",
  "Utilities",
  "Property management",
  "Other",
] as const;

export default function NewExpensePage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/">← Home</Link>
        <h1 style={{ fontSize: 24, margin: 0 }}>Add bill / expense</h1>
      </div>

      <TransactionForm
        type="EXPENSE"
        categories={CATEGORIES}
        defaultCategory="Loan / mortgage"
      />
    </main>
  );
}

