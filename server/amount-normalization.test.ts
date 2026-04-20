import { describe, expect, it } from "vitest";
import { normalizeAmountInput } from "../shared/amount";

describe("normalizeAmountInput", () => {
  it("accepts integer amounts", () => {
    expect(normalizeAmountInput("12")).toEqual({
      normalized: "12",
      numeric: 12,
    });
  });

  it("accepts dot decimal amounts", () => {
    expect(normalizeAmountInput("12.5")).toEqual({
      normalized: "12.5",
      numeric: 12.5,
    });
  });

  it("accepts comma decimal amounts", () => {
    expect(normalizeAmountInput("12,5")).toEqual({
      normalized: "12.5",
      numeric: 12.5,
    });
  });

  it("rejects malformed ambiguous amounts", () => {
    expect(() => normalizeAmountInput("1,234.56")).toThrow();
    expect(() => normalizeAmountInput("1.234,56")).toThrow();
    expect(() => normalizeAmountInput("12..5")).toThrow();
    expect(() => normalizeAmountInput("12,,5")).toThrow();
  });
});
