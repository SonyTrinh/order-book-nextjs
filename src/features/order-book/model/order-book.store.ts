import { createStore, type StateCreator } from "zustand/vanilla";
import { devtools } from "zustand/middleware";
import type { StoreApi } from "zustand";

import type { OrderBookState, OrderBookStore } from "@/features/order-book/types/order-book.types";

export const defaultOrderBookState: OrderBookState = {
  isConnected: false,
  snapshot: null,
};

const createOrderBookState: StateCreator<OrderBookStore, [], []> = (set) => ({
  ...defaultOrderBookState,
  setConnectionStatus: (isConnected) => set({ isConnected }),
  setSnapshot: (snapshot) => set({ snapshot }),
  reset: () => set(defaultOrderBookState),
});

export type OrderBookStoreApi = StoreApi<OrderBookStore>;

export const createOrderBookStore = (
  initialState: Partial<OrderBookState> = {},
): OrderBookStoreApi =>
  createStore<OrderBookStore>()(
    devtools(
      (set, get, store) => ({
        ...createOrderBookState(set, get, store),
        ...initialState,
      }),
      {
        name: "order-book-store",
      },
    ),
  );
