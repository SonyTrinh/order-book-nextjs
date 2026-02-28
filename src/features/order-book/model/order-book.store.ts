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
import {
  DEFAULT_TOP_LEVEL_DEPTH,
  SPREAD_OPTIONS,
} from "@/features/order-book/model/order-book.constants";

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
  lastMessageType: null,
  topLevelDepth: DEFAULT_TOP_LEVEL_DEPTH,
  spread: 0.01,
};

const applySnapshotState = (
  message: OrderBookSnapshotMessage,
  depth: number,
  spread: number,
): OrderBookStoreInternalState => {
  const normalized = createNormalizedOrderBookFromSnapshot(message);
  const topLevels = selectOrderBookTopLevels(normalized, depth, spread);

  return {
    ...defaultOrderBookState,
    isInitialized: true,
    selectedMarketId: message.market_id,
    topLevelDepth: depth,
    spread,
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
  const depth = previous.topLevelDepth;
  const spread = previous.spread;
  const topLevels = selectOrderBookTopLevels(normalized, depth, spread);

  return {
    ...previous,
    lastMessageType: "update",
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
      lastMessageType: null,
    })),
  setTopLevelDepth: (depth) =>
    set((state) => {
      if (!state.normalized || state.topLevelDepth === depth) return state;
      const topLevels = selectOrderBookTopLevels(
        state.normalized,
        depth,
        state.spread,
      );
      return {
        ...state,
        topLevelDepth: depth,
        topBids: topLevels.bids,
        topAsks: topLevels.asks,
      };
    }),
  setSpread: (spread) =>
    set((state) => {
      const isValid = (SPREAD_OPTIONS as readonly number[]).includes(spread);
      const nextSpread = isValid ? spread : 1;
      if (!state.normalized || state.spread === nextSpread) return state;
      const topLevels = selectOrderBookTopLevels(
        state.normalized,
        state.topLevelDepth,
        nextSpread,
      );
      return {
        ...state,
        spread: nextSpread,
        topBids: topLevels.bids,
        topAsks: topLevels.asks,
      };
    }),
  applySnapshotMessage: (message) => {
    const { topLevelDepth, spread } = get();
    set(applySnapshotState(message, topLevelDepth, spread));
  },
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
