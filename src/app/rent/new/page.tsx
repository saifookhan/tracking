import Link from "next/link";
import { TransactionForm } from "@/components/TransactionForm";

export default function NewRentPage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/">← Home</Link>
        <h1 style={{ fontSize: 24, margin: 0 }}>Add rent</h1>
      </div>

      <TransactionForm type="RENT" />
    </main>
  );
}

