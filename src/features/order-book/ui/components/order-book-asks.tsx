"use client";

import { memo, type ReactNode } from "react";

import { useOrderBookTopAsks } from "@/features/order-book/model/order-book-store-provider";
import OrderBookSidePanel from "@/features/order-book/ui/components/order-book-side-panel";

const OrderBookAsks = (): ReactNode => {
  const asks = useOrderBookTopAsks();

  return <OrderBookSidePanel title="Asks" side="asks" levels={asks} />;
};

export default memo(OrderBookAsks);
