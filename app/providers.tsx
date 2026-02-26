"use client";

import type { PropsWithChildren, ReactNode } from "react";

import { OrderBookStoreProvider } from "@/features/order-book";

export const Providers = ({ children }: PropsWithChildren): ReactNode => {
  return <OrderBookStoreProvider>{children}</OrderBookStoreProvider>;
};
