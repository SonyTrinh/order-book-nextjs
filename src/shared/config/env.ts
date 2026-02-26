import { toNumber, toNumberArray } from "@/shared/utils/env-parsers";

export interface AppEnv {
  apiBaseUrl: string;
  wsBaseUrl: string;
  apiTimeoutMs: number;
  orderBookMarketIds: number[];
}

export const env: AppEnv = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001",
  wsBaseUrl: process.env.NEXT_PUBLIC_WS_BASE_URL ?? "ws://localhost:3001/ws",
  apiTimeoutMs: toNumber(process.env.NEXT_PUBLIC_API_TIMEOUT_MS, 10_000),
  orderBookMarketIds: toNumberArray(process.env.NEXT_PUBLIC_ORDERBOOK_MARKET_IDS, [1, 2]),
};
