import { createStore, type StateCreator } from "zustand/vanilla";
import { devtools } from "zustand/middleware";
import type { StoreApi } from "zustand";

import {
  applyOrderBookDelta,
  createNormalizedOrderBookFromSnapshot,
  type NormalizedOrderBookState,
  selectOrderBookTopLevels,
  toOrderBookSnapshotView,
} from "@/features/order-book/model/order-book-engine";
import type {
  OrderBookDeltaMessage,
  OrderBookSnapshotMessage,
  OrderBookState,
  OrderBookStore,
} from "@/features/order-book/types/order-book.types";
import { DEFAULT_TOP_LEVEL_DEPTH } from "@/features/order-book/model/order-book.constants";

interface OrderBookStoreInternalState extends OrderBookState {
  normalized: NormalizedOrderBookState | null;
}

type OrderBookStoreInternal = OrderBookStore & {
  normalized: NormalizedOrderBookState | null;
};

export const defaultOrderBookState: OrderBookState = {
  isConnected: false,
  snapshot: null,
  topBids: [],
  topAsks: [],
  isInitialized: false,
  selectedMarketId: "1",
};

const applySnapshotState = (message: OrderBookSnapshotMessage): OrderBookStoreInternalState => {
  const normalized = createNormalizedOrderBookFromSnapshot(message);
  const topLevels = selectOrderBookTopLevels(normalized, DEFAULT_TOP_LEVEL_DEPTH);

  return {
    ...defaultOrderBookState,
    isInitialized: true,
    selectedMarketId: message.market_id,
    normalized,
    snapshot: toOrderBookSnapshotView(normalized),
    topBids: topLevels.bids,
    topAsks: topLevels.asks,
  };
};

const applyUpdateState = (
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
  setSelectedMarketId: (marketId) =>
    set((state) => ({
      ...state,
      selectedMarketId: marketId,
      isInitialized: false,
      snapshot: null,
      topBids: [],
      topAsks: [],
      normalized: null,
    })),
  applySnapshotMessage: (message) => set(applySnapshotState(message)),
  applyUpdateMessage: (message) => {
    const previous = get();
    set(applyUpdateState(previous, message));
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
