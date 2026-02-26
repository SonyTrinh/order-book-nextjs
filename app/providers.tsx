"use client";

import { useEffect, type PropsWithChildren, type ReactNode } from "react";

import {
  createOrderBookSubscribeRequest,
  orderBookWebSocketService,
  OrderBookStoreProvider,
} from "@/features/order-book";
import { env } from "@/shared/config/env";

export const Providers = ({ children }: PropsWithChildren): ReactNode => {
  useEffect(() => {
    const unsubscribeMessage = orderBookWebSocketService.subscribe((message) => {
      console.debug("[order-book-ws] message", message);
    });

    const unsubscribeOpen = orderBookWebSocketService.subscribeOpen(() => {
      const subscribeRequest = createOrderBookSubscribeRequest(env.orderBookMarketIds);
      console.debug("[order-book-ws] connected");
      console.debug("[order-book-ws] subscribing", subscribeRequest);
      orderBookWebSocketService.send(subscribeRequest);
    });

    const unsubscribeClose = orderBookWebSocketService.subscribeClose((event) => {
      console.debug("[order-book-ws] closed", {
        code: event.code,
        reason: event.reason,
      });
    });

    const unsubscribeError = orderBookWebSocketService.subscribeError((event) => {
      console.error("[order-book-ws] error", event);
    });

    console.debug("[order-book-ws] connecting", {
      url: env.wsBaseUrl,
      marketIds: env.orderBookMarketIds,
    });
    orderBookWebSocketService.connect();

    return () => {
      unsubscribeMessage();
      unsubscribeOpen();
      unsubscribeClose();
      unsubscribeError();
      orderBookWebSocketService.disconnect(1000, "App unmounted");
    };
  }, []);

  return <OrderBookStoreProvider>{children}</OrderBookStoreProvider>;
};
