export type NormalizedAmount = {
  normalized: string;
  numeric: number;
};

const AMOUNT_PATTERN = /^\d+(?:[.,]\d+)?$/;

export function normalizeAmountInput(raw: string): NormalizedAmount {
  const value = raw.trim();

  if (!value) {
    throw new Error("Amount is required");
  }

  if (!AMOUNT_PATTERN.test(value)) {
    throw new Error(
      "Enter a valid amount using digits and a single decimal separator"
    );
  }

  const normalized = value.replace(",", ".");
  const numeric = Number.parseFloat(normalized);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  return { normalized, numeric };
}
