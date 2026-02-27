"use client";

import type { PropsWithChildren, ReactNode } from "react";

import {
  OrderBookStreamBootstrap,
  OrderBookStoreProvider,
} from "@/features/order-book";
import { env } from "@/shared/config/env";

export const Providers = ({ children }: PropsWithChildren): ReactNode => {
  const initialSelectedMarketId = String(env.orderBookMarketIds[0] ?? 1);

  return (
    <OrderBookStoreProvider initialState={{ selectedMarketId: initialSelectedMarketId }}>
      <OrderBookStreamBootstrap />
      {children}
    </OrderBookStoreProvider>
  );
};
