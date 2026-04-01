"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RecurringForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      enabled: fd.get("enabled") === "on",
      name: String(fd.get("name") ?? "").trim(),
      type: String(fd.get("type") ?? ""),
      dayOfMonth: Number(fd.get("dayOfMonth") ?? 1),
      amount: String(fd.get("amount") ?? ""),
      category: String(fd.get("category") ?? "").trim() || null,
      notes: String(fd.get("notes") ?? "").trim() || null,
      startDate: String(fd.get("startDate") ?? ""),
    };

    const res = await fetch("/api/recurring", {
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
      setError(data?.error ?? "Could not save recurring rule");
      setSaving(false);
      return;
    }

    (e.target as HTMLFormElement).reset();
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 12, display: "grid", gap: 12 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" name="enabled" defaultChecked />
        <span>Enabled</span>
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <div>Name</div>
        <input name="name" required placeholder="Rent, Mortgage, HOA..." />
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <div>Type</div>
          <select name="type" defaultValue="EXPENSE">
            <option value="RENT">RENT</option>
            <option value="EXPENSE">EXPENSE</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div>Day of month</div>
          <input name="dayOfMonth" type="number" min="1" max="28" step="1" defaultValue={1} />
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <div>Amount</div>
          <input name="amount" type="number" min="0" step="0.01" required />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div>Start date</div>
          <input name="startDate" type="date" required />
        </label>
      </div>

      <label style={{ display: "grid", gap: 6 }}>
        <div>Category (optional)</div>
        <input name="category" placeholder="Utilities, Loan / mortgage..." />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <div>Notes (optional)</div>
        <input name="notes" placeholder="Vendor keyword helps auto-categorize" />
      </label>

      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Add recurring rule"}
      </button>

      {error ? <p style={{ color: "crimson", marginTop: 0 }}>{error}</p> : null}
    </form>
  );
}

