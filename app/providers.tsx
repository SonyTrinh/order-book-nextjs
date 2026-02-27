"use client";

import { type PropsWithChildren, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { OrderBookStreamBootstrap, OrderBookStoreProvider } from "@/features/order-book";
import { env } from "@/shared/config/env";
import { ThemeProvider } from "@/shared/theme/theme-provider";

const queryClient = new QueryClient();

export const Providers = ({ children }: PropsWithChildren): ReactNode => {
  const initialSelectedMarketId = String(env.orderBookMarketIds[0] ?? 1);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <OrderBookStoreProvider initialState={{ selectedMarketId: initialSelectedMarketId }}>
          <OrderBookStreamBootstrap />
          {children}
        </OrderBookStoreProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};
