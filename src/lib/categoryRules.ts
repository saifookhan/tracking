export type CategoryRule = {
  contains: string[];
  category: string;
};

// Simple, editable keyword-based rules (case-insensitive).
export const DEFAULT_CATEGORY_RULES: CategoryRule[] = [
  { contains: ["mutuo", "mortgage", "loan"], category: "Loan / mortgage" },
  { contains: ["enel", "eni", "a2a", "utility", "gas", "luce", "energia"], category: "Utilities" },
  { contains: ["assicur", "insurance"], category: "Insurance" },
  { contains: ["tari", "imu", "tax"], category: "Property tax" },
  { contains: ["condominio", "hoa"], category: "HOA" },
  { contains: ["idraul", "plumber", "elettric", "electric", "repair", "ripar"], category: "Repairs & maintenance" },
  { contains: ["agenzia", "property management", "management"], category: "Property management" },
];

export function suggestCategory(notes: string, rules = DEFAULT_CATEGORY_RULES): string | null {
  const hay = notes.trim().toLowerCase();
  if (!hay) return null;
  for (const r of rules) {
    if (r.contains.some((k) => hay.includes(k))) return r.category;
  }
  return null;
}

