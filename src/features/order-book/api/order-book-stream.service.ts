import {
  createOrderBookSubscribeRequest,
  orderBookWebSocketService,
} from "@/features/order-book/api/order-book-ws.service";
import type { OrderBookStoreApi } from "@/features/order-book/model/order-book.store";
import type {
  OrderBookDeltaMessage,
  OrderBookSnapshotMessage,
  OrderBookWsMessage,
} from "@/features/order-book/types/order-book.types";

interface StartOrderBookStreamParams {
  marketIds: number[];
  store: OrderBookStoreApi;
}

const isSnapshotMessage = (message: OrderBookWsMessage): message is OrderBookSnapshotMessage =>
  message.type === "snapshot" &&
  message.method === "snapshot" &&
  message.channel === "orderbook" &&
  typeof message.market_id === "string";

const isDeltaMessage = (message: OrderBookWsMessage): message is OrderBookDeltaMessage =>
  (message.type === "delta" || message.type === "update") &&
  (message.method === "delta" || message.method === "update") &&
  message.channel === "orderbook" &&
  typeof message.market_id === "string";

const handleOrderBookMessage = (store: OrderBookStoreApi, message: OrderBookWsMessage): void => {
  const state = store.getState();

  if (!isSnapshotMessage(message) && !isDeltaMessage(message)) {
    return;
  }

  if (message.market_id !== state.selectedMarketId) {
    return;
  }

  if (isSnapshotMessage(message)) {
    state.applySnapshotMessage(message);
    return;
  }

  if (isDeltaMessage(message)) {
    state.applyDeltaMessage(message);
  }
};

export const startOrderBookStream = ({ marketIds, store }: StartOrderBookStreamParams): (() => void) => {
  const unsubscribeMessage = orderBookWebSocketService.subscribe((message) => {
    handleOrderBookMessage(store, message);
  });

  const unsubscribeOpen = orderBookWebSocketService.subscribeOpen(() => {
    const state = store.getState();
    const subscribeRequest = createOrderBookSubscribeRequest(marketIds);

    state.setConnectionStatus(true);
    orderBookWebSocketService.send(subscribeRequest);
  });

  const unsubscribeClose = orderBookWebSocketService.subscribeClose(() => {
    const state = store.getState();
    state.setConnectionStatus(false);
  });

  const unsubscribeError = orderBookWebSocketService.subscribeError(() => {
    const state = store.getState();
    state.setConnectionStatus(false);
  });

  orderBookWebSocketService.connect();

  return () => {
    unsubscribeMessage();
    unsubscribeOpen();
    unsubscribeClose();
    unsubscribeError();
    orderBookWebSocketService.disconnect(1000, "Order book stream stopped");
  };
};
