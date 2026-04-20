import { afterEach, describe, expect, it, vi } from "vitest";
import { convertToCanonicalCurrency } from "./exchange-rates";

describe("convertToCanonicalCurrency", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("preserves same-currency amounts with a frozen save-time rate", async () => {
    const result = await convertToCanonicalCurrency({
      amount: 12.5,
      fromCurrency: "EUR",
      toCurrency: "EUR",
    });

    expect(result).toMatchObject({
      canonicalAmount: "12.50",
      canonicalCurrency: "EUR",
      originalAmount: "12.50",
      originalCurrency: "EUR",
      exchangeRate: "1.00000000",
    });
    expect(typeof result.exchangeRateDate).toBe("number");
    expect(result.exchangeRateDate).toBeGreaterThan(0);
  });

  it("converts cross-currency amounts using the fetched save-time rate", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ rate: 1.7 }),
    } as Response);

    const result = await convertToCanonicalCurrency({
      amount: 10,
      fromCurrency: "USD",
      toCurrency: "AZN",
    });

    expect(result).toMatchObject({
      canonicalAmount: "17.00",
      canonicalCurrency: "AZN",
      originalAmount: "10.00",
      originalCurrency: "USD",
      exchangeRate: "1.70000000",
    });
    expect(typeof result.exchangeRateDate).toBe("number");
    expect(result.exchangeRateDate).toBeGreaterThan(0);
  });

  it("blocks cross-currency saves when the rate lookup fails", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response);

    await expect(
      convertToCanonicalCurrency({
        amount: 10,
        fromCurrency: "USD",
        toCurrency: "AZN",
      })
    ).rejects.toThrow("Failed to fetch exchange rate for USD to AZN. Please try again.");
  });
});
