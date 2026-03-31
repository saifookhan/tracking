"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Initial = {
  currency: string;
  loanPrincipalCts: number | null;
  loanAprBps: number | null;
  loanTermMonths: number | null;
  loanStartDate: string | null;
};

function centsToNumber(cents: number | null): string {
  if (cents == null) return "";
  return String((cents / 100).toFixed(2));
}

function bpsToPercent(bps: number | null): string {
  if (bps == null) return "";
  return String((bps / 100).toFixed(2));
}

export function SettingsForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const defaults = useMemo(
    () => ({
      currency: initial.currency,
      loanPrincipal: centsToNumber(initial.loanPrincipalCts),
      loanApr: bpsToPercent(initial.loanAprBps),
      loanTermMonths: initial.loanTermMonths?.toString() ?? "",
      loanStartDate: initial.loanStartDate ?? "",
    }),
    [initial],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const fd = new FormData(e.currentTarget);
    const currency = String(fd.get("currency") ?? "").trim();
    const loanPrincipal = String(fd.get("loanPrincipal") ?? "").trim();
    const loanApr = String(fd.get("loanApr") ?? "").trim();
    const loanTermMonthsRaw = String(fd.get("loanTermMonths") ?? "").trim();
    const loanStartDate = String(fd.get("loanStartDate") ?? "").trim();

    const payload = {
      currency: currency || undefined,
      loanPrincipal: loanPrincipal || undefined,
      loanApr: loanApr || undefined,
      loanTermMonths: loanTermMonthsRaw ? Number(loanTermMonthsRaw) : undefined,
      loanStartDate: loanStartDate || undefined,
    };

    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : "Request failed");
      return null;
    });

    if (!res) return;
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "Could not save settings");
      setSaving(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 16, display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <div>Currency (ISO code)</div>
        <input name="currency" defaultValue={defaults.currency} placeholder="EUR" />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <div>Loan principal</div>
        <input
          name="loanPrincipal"
          defaultValue={defaults.loanPrincipal}
          type="number"
          min="0"
          step="0.01"
          placeholder="200000.00"
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <div>APR %</div>
        <input
          name="loanApr"
          defaultValue={defaults.loanApr}
          type="number"
          min="0"
          step="0.01"
          placeholder="3.50"
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <div>Term (months)</div>
        <input
          name="loanTermMonths"
          defaultValue={defaults.loanTermMonths}
          type="number"
          min="1"
          step="1"
          placeholder="360"
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <div>Loan start date</div>
        <input name="loanStartDate" defaultValue={defaults.loanStartDate} type="date" />
      </label>

      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save settings"}
      </button>

      {error ? <p style={{ color: "crimson", marginTop: 0 }}>{error}</p> : null}
    </form>
  );
}

