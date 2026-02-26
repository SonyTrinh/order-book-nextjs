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

const toDomainMarket = (market: Market): Market => ({
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

const parseMarketsResponse = (payload: MarketsResponse): MarketsResponse | null => {
  if (!Array.isArray(payload)) {
    return null;
  }

  return {
    markets: payload.markets.map(toDomainMarket),
    available: payload.available,
    base_asset_symbol: payload.base_asset_symbol,
    quote_asset_symbol: payload.quote_asset_symbol,
    underlying: payload.underlying,
    display_name: payload.display_name,
    quote_volume_24h: payload.quote_volume_24h,
    change_24h: payload.change_24h,
    high_24h: payload.high_24h,
    low_24h: payload.low_24h,
    last_price: payload.last_price,
    mark_price: payload.mark_price,
    index_price: payload.index_price,
    max_position_size: payload.max_position_size,
    open_interest: payload.open_interest,
    funding_interval: payload.funding_interval,
    next_funding_time: payload.next_funding_time,
    post_only: payload.post_only,
    last_cumulative_funding: payload.last_cumulative_funding,
    predicted_funding_rate: payload.predicted_funding_rate,
    visible: payload.visible,
    display_base_asset_symbol: payload.display_base_asset_symbol,
    accumulated_funding: payload.accumulated_funding,
    current_funding_rate: payload.current_funding_rate,
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

const mapProblemToError = (result: ApiResult<MarketsResponse>): MarketFetchError => {
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
  const result = await apiClient.get<MarketsResponse, ApiErrorPayload>(MARKETS_ENDPOINT);

  if (!result.ok) {
    return {
      ok: false,
      error: mapProblemToError(result),
    };
  }

  const parsed = parseMarketsResponse(result.data as MarketsResponse);
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
