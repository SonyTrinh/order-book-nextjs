import { apiClient } from "@/shared/api/api-client";

import type { ApiErrorPayload, ApiResult } from "@/shared/api/api-types";
import type {
  FetchMarketsResult,
  Market,
  MarketFetchError,
  MarketFetchErrorCode,
  MarketsResponse,
} from "@/features/market/types/market.types";

const MARKETS_ENDPOINT = "/markets";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

interface MarketConfigDto {
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

interface MarketItemDto {
  market_id: string;
  config: MarketConfigDto;
}

const isMarketConfigDto = (value: unknown): value is MarketConfigDto => {
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

const isMarketItemDto = (value: unknown): value is MarketItemDto => {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.market_id === "string" && isMarketConfigDto(value.config);
};

const toDomainMarket = (market: MarketItemDto): Market => ({
  market_id: market.market_id,
  config: {
    name: market.config.name,
    quote: market.config.quote,
    step_size: market.config.step_size,
    step_price: market.config.step_price,
    maintenance_margin_factor: market.config.maintenance_margin_factor,
    max_leverage: market.config.max_leverage,
    min_order_size: market.config.min_order_size,
    unlocked: market.config.unlocked,
    open_interest_limit: market.config.open_interest_limit,
  },
});

const readMarketsArray = (payload: unknown): MarketItemDto[] | null => {
  if (!isRecord(payload)) {
    return null;
  }

  if (Array.isArray(payload.markets) && payload.markets.every(isMarketItemDto)) {
    return payload.markets;
  }

  if (
    isRecord(payload.data) &&
    Array.isArray(payload.data.markets) &&
    payload.data.markets.every(isMarketItemDto)
  ) {
    return payload.data.markets;
  }

  return null;
};

const parseMarketsResponse = (payload: unknown): MarketsResponse | null => {
  const markets = readMarketsArray(payload);
  if (!markets) {
    return null;
  }

  return {
    markets: markets.map(toDomainMarket),
  };
};

const createError = (
  code: MarketFetchErrorCode,
  message: string,
  status?: number,
): MarketFetchError =>
  typeof status === "number"
    ? {
        code,
        message,
        status,
      }
    : {
        code,
        message,
      };

const mapProblemToError = (result: ApiResult<unknown>): MarketFetchError => {
  const status = result.status ?? undefined;

  if (result.problem === "NETWORK_ERROR") {
    return createError("network_error", "Network error while fetching markets.");
  }

  if (result.problem === "TIMEOUT_ERROR") {
    return createError("timeout_error", "Request timed out while fetching markets.");
  }

  if (status === 401) {
    return createError("unauthorized", "Unauthorized request.", status);
  }

  if (status === 403) {
    return createError("forbidden", "Forbidden request.", status);
  }

  if (status === 404) {
    return createError("not_found", "Markets endpoint not found.", status);
  }

  if (typeof status === "number" && status >= 500) {
    return createError("server_error", "Server error while fetching markets.", status);
  }

  const apiMessage = result.originalError?.message;

  return createError("unknown_error", apiMessage ?? "Unknown API error.", status);
};

export const fetchMarkets = async (): Promise<FetchMarketsResult> => {
  const result = await apiClient.get<unknown, ApiErrorPayload>(MARKETS_ENDPOINT);

  if (!result.ok) {
    return {
      ok: false,
      error: mapProblemToError(result),
    };
  }

  const parsed = parseMarketsResponse(result.data);
  if (!parsed) {
    return {
      ok: false,
      error: createError("invalid_response", "Invalid markets response shape.", result.status),
    };
  }

  return {
    ok: true,
    data: parsed,
  };
};
