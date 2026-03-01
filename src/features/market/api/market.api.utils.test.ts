import { describe, expect, it } from "vitest";

import {
  isMarketConfigDto,
  isMarketItemDto,
  isRecordPayload,
} from "./market.api.utils";

describe("market.api.utils", () => {
  describe("isRecordPayload", () => {
    it("returns true for plain objects", () => {
      expect(isRecordPayload({})).toBe(true);
      expect(isRecordPayload({ a: 1 })).toBe(true);
    });

    it("returns false for null", () => {
      expect(isRecordPayload(null)).toBe(false);
    });

    it("returns false for non-objects", () => {
      expect(isRecordPayload(undefined)).toBe(false);
      expect(isRecordPayload(0)).toBe(false);
      expect(isRecordPayload("")).toBe(false);
      expect(isRecordPayload(true)).toBe(false);
    });

    it("returns true for arrays (typeof array is 'object')", () => {
      expect(isRecordPayload([])).toBe(true);
    });
  });

  describe("isMarketConfigDto", () => {
    const validConfig = {
      name: "BTC/USDC",
      quote: "USDC",
      step_size: "0.001",
      step_price: "0.01",
      maintenance_margin_factor: "0.05",
      max_leverage: "50",
      min_order_size: "0.001",
      unlocked: true,
      open_interest_limit: "1000000",
    };

    it("returns true for a valid config object", () => {
      expect(isMarketConfigDto(validConfig)).toBe(true);
    });

    it("returns false for null or non-objects", () => {
      expect(isMarketConfigDto(null)).toBe(false);
      expect(isMarketConfigDto(undefined)).toBe(false);
      expect(isMarketConfigDto(1)).toBe(false);
    });

    it("returns false when a required string field is missing or wrong type", () => {
      expect(isMarketConfigDto({ ...validConfig, name: 1 })).toBe(false);
      expect(isMarketConfigDto({ ...validConfig, name: undefined })).toBe(false);
      expect(isMarketConfigDto({ ...validConfig, quote: 0 })).toBe(false);
    });

    it("returns false when unlocked is not boolean", () => {
      expect(isMarketConfigDto({ ...validConfig, unlocked: "true" })).toBe(false);
      expect(isMarketConfigDto({ ...validConfig, unlocked: 1 })).toBe(false);
    });
  });

  describe("isMarketItemDto", () => {
    const validConfig = {
      name: "BTC/USDC",
      quote: "USDC",
      step_size: "0.001",
      step_price: "0.01",
      maintenance_margin_factor: "0.05",
      max_leverage: "50",
      min_order_size: "0.001",
      unlocked: true,
      open_interest_limit: "1000000",
    };

    it("returns true for a valid market item", () => {
      expect(isMarketItemDto({ market_id: "1", config: validConfig })).toBe(true);
    });

    it("returns false for null or non-objects", () => {
      expect(isMarketItemDto(null)).toBe(false);
      expect(isMarketItemDto(undefined)).toBe(false);
    });

    it("returns false when market_id is missing or not a string", () => {
      expect(isMarketItemDto({ config: validConfig })).toBe(false);
      expect(isMarketItemDto({ market_id: 1, config: validConfig })).toBe(false);
    });

    it("returns false when config is invalid", () => {
      expect(isMarketItemDto({ market_id: "1", config: {} })).toBe(false);
      expect(isMarketItemDto({ market_id: "1", config: { ...validConfig, name: 1 } })).toBe(
        false,
      );
    });
  });
});
