"use client";

import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { useStore } from "zustand";

import {
  createOrderBookStore,
  type OrderBookState,
  type OrderBookStore,
  type OrderBookStoreApi,
} from "@/features/order-book/model/order-book.store";

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

export const useOrderBookIsConnected = (): boolean =>
  useOrderBookStore((state) => state.isConnected);

export const useOrderBookSnapshot = (): OrderBookState["snapshot"] =>
  useOrderBookStore((state) => state.snapshot);
