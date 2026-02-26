import { apiClient } from "@/shared/api/api-client";

import type { ApiErrorPayload, ApiResult } from "@/shared/api/api-types";
import type { OrderBookSnapshot } from "@/features/order-book/types/order-book.types";

const ORDER_BOOK_ENDPOINT = "/order-book";

export const fetchOrderBookSnapshot = async (
  symbol: string,
): Promise<ApiResult<OrderBookSnapshot>> =>
  apiClient.get<OrderBookSnapshot, ApiErrorPayload>(ORDER_BOOK_ENDPOINT, { symbol });
