const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export interface MarketConfigDto {
  name: string;
  quote: string;
  step_size: string;
  step_price: string;
  maintenance_margin_factor: string;
  max_leverage: string;
  min_order_size: string;
  unlocked: boolean;
  open_interest_limit: string;
}

export interface MarketItemDto {
  market_id: string;
  config: MarketConfigDto;
}

export const isMarketConfigDto = (value: unknown): value is MarketConfigDto => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.name === "string" &&
    typeof value.quote === "string" &&
    typeof value.step_size === "string" &&
    typeof value.step_price === "string" &&
    typeof value.maintenance_margin_factor === "string" &&
    typeof value.max_leverage === "string" &&
    typeof value.min_order_size === "string" &&
    typeof value.unlocked === "boolean" &&
    typeof value.open_interest_limit === "string"
  );
};

export const isMarketItemDto = (value: unknown): value is MarketItemDto => {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.market_id === "string" && isMarketConfigDto(value.config);
};

export const isRecordPayload = isRecord;
