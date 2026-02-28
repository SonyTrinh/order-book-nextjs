"use client";

import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { useStore } from "zustand";

import { ORDER_BOOK_UPDATE_THROTTLE_MS } from "@/features/order-book/model/order-book.constants";
import {
  createOrderBookStore,
  type OrderBookStoreApi,
} from "@/features/order-book/model/order-book.store";
import type { OrderBookState, OrderBookStore } from "@/features/order-book/types/order-book.types";
import { useThrottledValue } from "@/shared/hooks/use-throttled-value";

const OrderBookStoreContext = createContext<OrderBookStoreApi | null>(null);

interface OrderBookStoreProviderProps extends PropsWithChildren {
  initialState?: Partial<OrderBookState>;
}

export const OrderBookStoreProvider = ({
  children,
  initialState,
}: OrderBookStoreProviderProps): ReactNode => {
  const [store] = useState<OrderBookStoreApi>(() => createOrderBookStore(initialState));

  return (
    <OrderBookStoreContext.Provider value={store}>{children}</OrderBookStoreContext.Provider>
  );
};

export const useOrderBookStore = <TSelected,>(
  selector: (state: OrderBookStore) => TSelected,
): TSelected => {
  const store = useContext(OrderBookStoreContext);

  if (!store) {
    throw new Error("useOrderBookStore must be used within OrderBookStoreProvider");
  }

  return useStore(store, selector);
};

export const useOrderBookStoreApi = (): OrderBookStoreApi => {
  const store = useContext(OrderBookStoreContext);

  if (!store) {
    throw new Error("useOrderBookStoreApi must be used within OrderBookStoreProvider");
  }

  return store;
};

export const useOrderBookIsConnected = (): boolean =>
  useOrderBookStore((state) => state.isConnected);

export const useOrderBookIsInitialized = (): boolean =>
  useOrderBookStore((state) => state.isInitialized);

export const useOrderBookSnapshot = (): OrderBookState["snapshot"] => {
  const snapshot = useOrderBookStore((state) => state.snapshot);
  return useThrottledValue(snapshot, ORDER_BOOK_UPDATE_THROTTLE_MS);
};

export const useOrderBookTopBids = (): OrderBookState["topBids"] => {
  const topBids = useOrderBookStore((state) => state.topBids);
  return useThrottledValue(topBids, ORDER_BOOK_UPDATE_THROTTLE_MS);
};

export const useOrderBookTopAsks = (): OrderBookState["topAsks"] => {
  const topAsks = useOrderBookStore((state) => state.topAsks);
  return useThrottledValue(topAsks, ORDER_BOOK_UPDATE_THROTTLE_MS);
};

export const useOrderBookSelectedMarketId = (): OrderBookState["selectedMarketId"] =>
  useOrderBookStore((state) => state.selectedMarketId);

export const useSetOrderBookSelectedMarketId = (): OrderBookStore["setSelectedMarketId"] =>
  useOrderBookStore((state) => state.setSelectedMarketId);
