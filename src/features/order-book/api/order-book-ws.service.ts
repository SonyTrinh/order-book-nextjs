import { env } from "@/shared/config/env";
import { createWebSocketService } from "@/shared/services/websocket/websocket-service";

import type {
  OrderBookSubscribeRequest,
  OrderBookWsMessage,
} from "@/features/order-book/types/order-book.types";

export const createOrderBookSubscribeRequest = (marketIds: number[]): OrderBookSubscribeRequest => ({
  method: "subscribe",
  params: {
    channel: "orderbook",
    market_ids: marketIds,
  },
});

export const orderBookWebSocketService = createWebSocketService<
  OrderBookWsMessage,
  OrderBookSubscribeRequest
>({
  url: env.wsBaseUrl,
  debugName: "order-book",
});
