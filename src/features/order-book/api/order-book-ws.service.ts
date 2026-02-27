import { env } from "@/shared/config/env";
import { createWebSocketService } from "@/shared/services/websocket/websocket-service";

import type {
  OrderBookSubscribeRequest,
  OrderBookWsMessage,
} from "@/features/order-book/types/order-book.types";

export const createOrderBookSubscribeRequest = (): OrderBookSubscribeRequest => ({
  method: "subscribe",
  params: {
    channel: "orderbook",
  },
});

export const orderBookWebSocketService = createWebSocketService<
  OrderBookWsMessage,
  OrderBookSubscribeRequest
>({
  url: env.wsBaseUrl,
  debugName: "order-book",
});
