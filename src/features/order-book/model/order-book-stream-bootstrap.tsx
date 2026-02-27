"use client";

import { useEffect } from "react";

import { startOrderBookStream } from "@/features/order-book/api/order-book-stream.service";
import { useOrderBookStoreApi } from "@/features/order-book/model/order-book-store-provider";

export const OrderBookStreamBootstrap = (): null => {
  const store = useOrderBookStoreApi();

  useEffect(() => {
    const stop = startOrderBookStream({
      store,
    });

    return () => {
      stop();
    };
  }, [store]);

  return null;
};
