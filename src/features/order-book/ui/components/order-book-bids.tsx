"use client";

import { memo, type ReactNode } from "react";

import { useOrderBookTopBids } from "@/features/order-book/model/order-book-store-provider";
import OrderBookSidePanel from "@/features/order-book/ui/components/order-book-side-panel";

const OrderBookBids = (): ReactNode => {
  const bids = useOrderBookTopBids();

  return <OrderBookSidePanel title="Bids" side="bids" levels={bids} />;
};

export default memo(OrderBookBids);
