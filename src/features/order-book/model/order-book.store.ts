import { createStore, type StateCreator } from "zustand/vanilla";
import { devtools } from "zustand/middleware";
import type { StoreApi } from "zustand";

import {
  applyOrderBookDelta,
  createNormalizedOrderBookFromSnapshot,
  selectOrderBookTopLevels,
  toOrderBookSnapshotView,
} from "@/features/order-book/model/order-book-engine";
import type {
  OrderBookDeltaMessage,
  OrderBookSnapshotMessage,
  OrderBookState,
  OrderBookStore,
  OrderBookStoreInternal,
  OrderBookStoreInternalState,
} from "@/features/order-book/types/order-book.types";

const DEFAULT_TOP_LEVEL_DEPTH = 20;

export const defaultOrderBookState: OrderBookState = {
  isConnected: false,
  snapshot: null,
  topBids: [],
  topAsks: [],
  isInitialized: false,
};

const applySnapshotState = (message: OrderBookSnapshotMessage): OrderBookStoreInternalState => {
  const normalized = createNormalizedOrderBookFromSnapshot(message);
  const topLevels = selectOrderBookTopLevels(normalized, DEFAULT_TOP_LEVEL_DEPTH);

  return {
    ...defaultOrderBookState,
    isInitialized: true,
    normalized,
    snapshot: toOrderBookSnapshotView(normalized),
    topBids: topLevels.bids,
    topAsks: topLevels.asks,
  };
};

const applyDeltaState = (
  previous: OrderBookStoreInternalState,
  message: OrderBookDeltaMessage,
): OrderBookStoreInternalState => {
  if (!previous.normalized) {
    return previous;
  }

  const normalized = applyOrderBookDelta(previous.normalized, message);
  const topLevels = selectOrderBookTopLevels(normalized, DEFAULT_TOP_LEVEL_DEPTH);

  return {
    ...previous,
    normalized,
    snapshot: toOrderBookSnapshotView(normalized),
    topBids: topLevels.bids,
    topAsks: topLevels.asks,
  };
};

const createOrderBookState: StateCreator<OrderBookStoreInternal, [], []> = (set, get) => ({
  ...defaultOrderBookState,
  normalized: null,
  setConnectionStatus: (isConnected) => set({ isConnected }),
  applySnapshotMessage: (message) => set(applySnapshotState(message)),
  applyDeltaMessage: (message) => {
    const previous = get();
    set(applyDeltaState(previous, message));
  },
  reset: () =>
    set({
      ...defaultOrderBookState,
      normalized: null,
    }),
});

export type OrderBookStoreApi = StoreApi<OrderBookStore>;

export const createOrderBookStore = (
  initialState: Partial<OrderBookState> = {},
): OrderBookStoreApi =>
  createStore<OrderBookStoreInternal>()(
    devtools(
      (set, get, store) => ({
        ...createOrderBookState(set, get, store),
        ...initialState,
      }),
      {
        name: "order-book-store",
      },
    ),
  ) as OrderBookStoreApi;
