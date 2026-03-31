"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  type: "RENT" | "EXPENSE";
  defaultCategory?: string;
  categories?: readonly string[];
};

function newKey() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function TransactionForm({ type, defaultCategory, categories }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => newKey());

  const [date, setDate] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(defaultCategory ?? "");
  const [notes, setNotes] = useState("");

  const lastPayload = useRef<string | null>(null);
  const timer = useRef<number | null>(null);

  const canSave = useMemo(() => {
    if (!date) return false;
    if (!amount) return false;
    if (type === "EXPENSE" && !category) return false;
    const n = Number(amount);
    return Number.isFinite(n) && n >= 0;
  }, [amount, category, date, type]);

  useEffect(() => {
    if (!canSave) return;
    if (saving) return;

    const payload = JSON.stringify({
      type,
      date,
      amount,
      category: type === "RENT" ? null : category,
      notes,
      idempotencyKey,
    });

    if (payload === lastPayload.current) return;
    lastPayload.current = payload;

    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      setError(null);
      setSaving(true);

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload,
      }).catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Request failed");
        return null;
      });

      if (!res) {
        setSaving(false);
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Could not save");
        setSaving(false);
        return;
      }

      setSavedAt(Date.now());
      setSaving(false);

      // Reset so another entry can be auto-saved.
      setIdempotencyKey(newKey());
      setDate("");
      setAmount("");
      setNotes("");
      if (type === "EXPENSE") setCategory(defaultCategory ?? "");

      router.refresh();
    }, 800);

    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [amount, canSave, category, date, defaultCategory, idempotencyKey, notes, router, saving, type]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Manual submit not needed: auto-save is on.
  }

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 16, display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <div>{type === "RENT" ? "Date received" : "Date paid"}</div>
        <input type="date" name="date" required value={date} onChange={(e) => setDate(e.target.value)} />
      </label>

      {type === "EXPENSE" ? (
        <label style={{ display: "grid", gap: 6 }}>
          <div>Category</div>
          <select
            name="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {(categories ?? []).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label style={{ display: "grid", gap: 6 }}>
        <div>Amount</div>
        <input
          type="number"
          name="amount"
          min="0"
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>

      <label style={{ display: "grid", gap: 6 }}>
        <div>Notes (optional)</div>
        <input
          type="text"
          name="notes"
          placeholder="Anything helpful to remember"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button type="submit" disabled>
          Auto-save on
        </button>
        <span style={{ fontSize: 13, opacity: 0.8 }}>
          {saving
            ? "Saving..."
            : savedAt
              ? `Saved ${new Date(savedAt).toLocaleTimeString()}`
              : canSave
                ? "Will save automatically"
                : "Fill required fields to save"}
        </span>
      </div>

      {error ? <p style={{ color: "crimson", marginTop: 0 }}>{error}</p> : null}
    </form>
  );
}

