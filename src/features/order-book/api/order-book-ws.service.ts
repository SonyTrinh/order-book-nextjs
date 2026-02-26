import { env } from "@/shared/config/env";
import { WebSocketService } from "@/shared/services/websocket/websocket-service";

import type { OrderBookDelta } from "@/features/order-book/types/order-book.types";

export interface OrderBookSubscribeMessage {
  event: "subscribe";
  symbol: string;
}

export const orderBookWebSocketService = new WebSocketService<
  OrderBookDelta,
  OrderBookSubscribeMessage
>({
  url: env.wsBaseUrl,
});
