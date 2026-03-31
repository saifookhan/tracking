import Link from "next/link";
import { prisma } from "@/lib/db";
import { SettingsForm } from "@/components/SettingsForm";

export default async function SettingsPage() {
  const settings = await prisma.appSettings.findUnique({ where: { id: 1 } });

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href="/">← Home</Link>
        <h1 style={{ fontSize: 24, margin: 0 }}>Settings</h1>
      </div>

      <p style={{ marginTop: 12, opacity: 0.75 }}>
        Set loan details so the app can calculate payment and remaining balance.
      </p>

      <SettingsForm
        initial={{
          currency: settings?.currency ?? "EUR",
          loanPrincipalCts: settings?.loanPrincipalCts ?? null,
          loanAprBps: settings?.loanAprBps ?? null,
          loanTermMonths: settings?.loanTermMonths ?? null,
          loanStartDate: settings?.loanStartDate
            ? settings.loanStartDate.toISOString().slice(0, 10)
            : null,
        }}
      />
    </main>
  );
}

