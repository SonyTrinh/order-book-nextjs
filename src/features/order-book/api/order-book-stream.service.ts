import {
  createOrderBookSubscribeRequest,
  orderBookWebSocketService,
} from "@/features/order-book/api/order-book-ws.service";
import {
  CHECKSUM_DEPTH,
  verifyOrderBookChecksum,
} from "@/features/order-book/model/order-book-checksum";
import type { OrderBookStoreApi } from "@/features/order-book/model/order-book.store";
import type {
  OrderBookDeltaMessage,
  OrderBookSnapshotMessage,
  OrderBookWsMessage,
} from "@/features/order-book/types/order-book.types";
import { env } from "@/shared/config/env";

interface StartOrderBookStreamParams {
  store: OrderBookStoreApi;
}

const isSnapshotMessage = (message: OrderBookWsMessage): message is OrderBookSnapshotMessage =>
  message.type === "snapshot" &&
  message.channel === "orderbook" &&
  typeof message.market_id === "string";

const isUpdateMessage = (message: OrderBookWsMessage): message is OrderBookDeltaMessage =>
  message.type === "update" &&
  message.channel === "orderbook" &&
  typeof message.market_id === "string";

const toChecksumLevel = (
  level: { price: string; quantity: string },
): { price: string; quantity: string } => ({
  price: level.price,
  quantity: level.quantity,
});

const parseChecksum = (value: number | string | undefined): number | null => {
  if (value == null) return null;
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string") {
    const parsed = value.startsWith("0x") ? parseInt(value, 16) : parseInt(value, 10);
    return Number.isInteger(parsed) ? parsed : null;
  }
  return null;
};

const handleChecksumMismatch = (store: OrderBookStoreApi): void => {
  const marketId = resolveMarketId(store.getState().selectedMarketId);
  const subscribeRequest = createOrderBookSubscribeRequest(marketId);
  orderBookWebSocketService.send(subscribeRequest);
};

const verifyMessageChecksum = (
  store: OrderBookStoreApi,
  checksumValue: number | string | undefined,
  messageKind: "snapshot" | "update",
): void => {
  const checksum = parseChecksum(checksumValue);
  if (checksum == null) return;

  const next = store.getState();
  const valid = verifyOrderBookChecksum(
    next.topBids.map(toChecksumLevel),
    next.topAsks.map(toChecksumLevel),
    checksum,
    CHECKSUM_DEPTH,
  );
  if (!valid) {
    console.warn(
      `[Order book] ${messageKind} checksum mismatch; re-subscribing for fresh snapshot.`,
    );
    handleChecksumMismatch(store);
  }
};

const handleOrderBookMessage = (store: OrderBookStoreApi, message: OrderBookWsMessage): void => {
  const state = store.getState();

  if (message.market_id !== state.selectedMarketId) {
    return;
  }

  if (isSnapshotMessage(message)) {
    state.applySnapshotMessage(message);
    verifyMessageChecksum(store, message.checksum, "snapshot");
    return;
  }

  if (isUpdateMessage(message)) {
    state.applyUpdateMessage(message);
    verifyMessageChecksum(store, message.checksum, "update");
  }
};

const resolveMarketId = (selectedMarketId: string): number => {
  const parsed = Number(selectedMarketId);
  const fallbackMarketId = env.orderBookMarketIds[0] ?? 1;

  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  return fallbackMarketId;
};

export const startOrderBookStream = ({ store }: StartOrderBookStreamParams): (() => void) => {
  const unsubscribeMessage = orderBookWebSocketService.subscribe((message) => {
    handleOrderBookMessage(store, message);
  });

  const unsubscribeOpen = orderBookWebSocketService.subscribeOpen(() => {
    const state = store.getState();
    const marketId = resolveMarketId(state.selectedMarketId);
    const subscribeRequest = createOrderBookSubscribeRequest(marketId);

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

  const unsubscribeStore = store.subscribe((state, previousState) => {
    if (state.selectedMarketId === previousState.selectedMarketId) {
      return;
    }

    const marketId = resolveMarketId(state.selectedMarketId);
    const subscribeRequest = createOrderBookSubscribeRequest(marketId);
    orderBookWebSocketService.send(subscribeRequest);
  });

  orderBookWebSocketService.connect();

  return () => {
    unsubscribeMessage();
    unsubscribeOpen();
    unsubscribeClose();
    unsubscribeError();
    unsubscribeStore();
    orderBookWebSocketService.disconnect(1000, "Order book stream stopped");
  };
};
