"use client";

import type { PropsWithChildren, ReactNode } from "react";

import {
  OrderBookStreamBootstrap,
  OrderBookStoreProvider,
} from "@/features/order-book";

export const Providers = ({ children }: PropsWithChildren): ReactNode => {
  return (
    <OrderBookStoreProvider>
      <OrderBookStreamBootstrap />
      {children}
    </OrderBookStoreProvider>
  );
};
