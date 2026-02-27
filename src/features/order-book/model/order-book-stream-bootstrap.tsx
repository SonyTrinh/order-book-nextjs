"use client";

import { useEffect } from "react";

import { startOrderBookStream } from "@/features/order-book/api/order-book-stream.service";
import {
  useOrderBookSelectedMarketId,
  useOrderBookStoreApi,
} from "@/features/order-book/model/order-book-store-provider";
import { env } from "@/shared/config/env";

export const OrderBookStreamBootstrap = (): null => {
  const store = useOrderBookStoreApi();
  const selectedMarketId = useOrderBookSelectedMarketId();

  useEffect(() => {
    const marketId = Number(selectedMarketId);
    const fallbackMarketId = env.orderBookMarketIds[0] ?? 1;
    const targetMarketId = Number.isInteger(marketId) && marketId > 0 ? marketId : fallbackMarketId;

    const stop = startOrderBookStream({
      marketIds: [targetMarketId],
      store,
    });

    return () => {
      stop();
    };
  }, [selectedMarketId, store]);

  return null;
};
