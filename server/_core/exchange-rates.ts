import { isSupportedFiatCurrency } from "../../shared/currencies";

const FRANKFURTER_API_BASE = "https://api.frankfurter.dev/v2";

export type ExchangeRateResult = {
  canonicalAmount: string;
  canonicalCurrency: string;
  originalAmount: string;
  originalCurrency: string;
  exchangeRate: string;
  exchangeRateDate: number;
};

type FrankfurterRateResponse = {
  rate?: number;
};

function roundCurrencyAmount(amount: number): string {
  return amount.toFixed(2);
}

function roundExchangeRate(rate: number): string {
  return rate.toFixed(8);
}

export async function convertToCanonicalCurrency(input: {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
}): Promise<ExchangeRateResult> {
  const originalCurrency = input.fromCurrency.toUpperCase();
  const canonicalCurrency = input.toCurrency.toUpperCase();

  if (!isSupportedFiatCurrency(originalCurrency)) {
    throw new Error(`Unsupported fiat currency: ${originalCurrency}`);
  }

  if (!isSupportedFiatCurrency(canonicalCurrency)) {
    throw new Error(`Unsupported fiat currency: ${canonicalCurrency}`);
  }

  const originalAmount = roundCurrencyAmount(input.amount);
  const exchangeRateDate = Date.now();

  if (originalCurrency === canonicalCurrency) {
    return {
      canonicalAmount: originalAmount,
      canonicalCurrency,
      originalAmount,
      originalCurrency,
      exchangeRate: "1.00000000",
      exchangeRateDate,
    };
  }

  let response: Response;
  try {
    response = await fetch(
      `${FRANKFURTER_API_BASE}/rate/${encodeURIComponent(originalCurrency)}/${encodeURIComponent(canonicalCurrency)}`
    );
  } catch {
    throw new Error(
      `Failed to fetch exchange rate for ${originalCurrency} to ${canonicalCurrency}. Please try again.`
    );
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch exchange rate for ${originalCurrency} to ${canonicalCurrency}. Please try again.`
    );
  }

  const data = (await response.json()) as FrankfurterRateResponse;
  if (typeof data.rate !== "number" || !Number.isFinite(data.rate) || data.rate <= 0) {
    throw new Error(
      `Failed to fetch exchange rate for ${originalCurrency} to ${canonicalCurrency}. Please try again.`
    );
  }

  return {
    canonicalAmount: roundCurrencyAmount(input.amount * data.rate),
    canonicalCurrency,
    originalAmount,
    originalCurrency,
    exchangeRate: roundExchangeRate(data.rate),
    exchangeRateDate,
  };
}
