import { describe, expect, it } from "vitest";

import {
  formatCoinAmount,
  formatIntegerString,
  formatTimestamp,
  getDisplayDecimalsFromStepSize,
  toBigIntSafe,
  toRows,
} from "./order-book-view.utils";

describe("order-book-view.utils", () => {
  describe("formatIntegerString", () => {
    it("adds thousands separators", () => {
      expect(formatIntegerString("1000")).toBe("1,000");
      expect(formatIntegerString("1234567")).toBe("1,234,567");
    });

    it("leaves small numbers unchanged", () => {
      expect(formatIntegerString("0")).toBe("0");
      expect(formatIntegerString("999")).toBe("999");
    });
  });

  describe("toBigIntSafe", () => {
    it("parses valid integer strings", () => {
      expect(toBigIntSafe("0")).toBe(BigInt(0));
      expect(toBigIntSafe("123")).toBe(BigInt(123));
      expect(toBigIntSafe("1000000000000000000")).toBe(BigInt("1000000000000000000"));
    });

    it("returns 0n for invalid strings", () => {
      expect(toBigIntSafe("")).toBe(BigInt(0));
      expect(toBigIntSafe("abc")).toBe(BigInt(0));
      expect(toBigIntSafe("12.34")).toBe(BigInt(0));
    });
  });

  describe("formatTimestamp", () => {
    it("returns a string for valid microsecond timestamp", () => {
      const result = formatTimestamp("1000000000000000");
      expect(typeof result).toBe("string");
      expect(result).not.toBe("-");
    });

    it("returns '-' when timestamp overflows to Invalid Date", () => {
      expect(formatTimestamp("1000000000000000000000000000000")).toBe("-");
    });
  });

  describe("toRows", () => {
    it("adds cumulativeQuantity to each level", () => {
      const levels = [
        { price: "100", quantity: "10", orderCount: 1, blockNumber: 0, logIndex: 0 },
        { price: "99", quantity: "5", orderCount: 1, blockNumber: 0, logIndex: 1 },
      ];
      const rows = toRows(levels);
      expect(rows).toHaveLength(2);
      expect(rows[0].cumulativeQuantity).toBe(BigInt(10));
      expect(rows[1].cumulativeQuantity).toBe(BigInt(15));
    });

    it("returns empty array for empty input", () => {
      expect(toRows([])).toEqual([]);
    });
  });

  describe("formatCoinAmount", () => {
    it("formats integer when displayDecimals is 0", () => {
      expect(formatCoinAmount("1000000000000000000", 0, 18)).toBe("1");
      expect(formatCoinAmount("1000000000000000000", 0, 18)).toBe("1");
    });

    it("formats with fractional part when displayDecimals > 0", () => {
      expect(formatCoinAmount("1500000000000000000", 2, 18)).toBe("1.5");
      expect(formatCoinAmount("1234567890123456789", 4, 18)).toBe("1.2345");
    });

    it("uses BASE_UNDERLYING_DECIMALS (18) when underlyingDecimals omitted", () => {
      expect(formatCoinAmount("1000000000000000000", 0)).toBe("1");
    });

    it("uses formatIntegerString when underlyingDecimals is 0", () => {
      expect(formatCoinAmount("1000", 0, 0)).toBe("1,000");
    });
  });

  describe("getDisplayDecimalsFromStepSize", () => {
    it("returns 4 for non-10* step sizes", () => {
      expect(getDisplayDecimalsFromStepSize("0.5")).toBe(4);
      expect(getDisplayDecimalsFromStepSize("0.1")).toBe(4);
      expect(getDisplayDecimalsFromStepSize("0.01")).toBe(4);
    });

    it("returns correct decimals for 1, 10, 100, ... pattern", () => {
      expect(getDisplayDecimalsFromStepSize("1")).toBe(18);
      expect(getDisplayDecimalsFromStepSize("10")).toBe(17);
      expect(getDisplayDecimalsFromStepSize("100")).toBe(16);
    });

    it("trims whitespace", () => {
      expect(getDisplayDecimalsFromStepSize("  1  ")).toBe(18);
    });

    it("clamps to 0 when decimals would be negative", () => {
      expect(getDisplayDecimalsFromStepSize("1000000000000000000")).toBe(0);
    });
  });
});
