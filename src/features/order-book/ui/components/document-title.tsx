"use client";

import { useEffect } from "react";

import { useOrderBookStore } from "@/features/order-book/model/order-book-store-provider";
import { useCurrentMarket } from "@/features/order-book/ui/hooks/use-current-market";
import {
  formatCoinAmount,
  getDisplayDecimalsFromStepSize,
  toBigIntSafe,
} from "@/features/order-book/ui/order-book-view.utils";

const DEFAULT_TITLE = "Order Book Visualization";

export function DocumentTitle(): null {
  const topBids = useOrderBookStore((state) => state.topBids);
  const topAsks = useOrderBookStore((state) => state.topAsks);
  const { market, baseSymbol, quoteSymbol } = useCurrentMarket();

  useEffect(() => {
    const bestBid = topBids[0];
    const bestAsk = topAsks[0];

    if (!bestBid || !bestAsk || !baseSymbol || !quoteSymbol) {
      document.title = DEFAULT_TITLE;
      return;
    }

    const midRaw = (toBigIntSafe(bestBid.price) + toBigIntSafe(bestAsk.price)) / BigInt(2);
    const priceDecimals = market
      ? getDisplayDecimalsFromStepSize(market.config.step_price)
      : 2;
    const formattedPrice = formatCoinAmount(midRaw.toString(), priceDecimals);

    document.title = `${formattedPrice} | ${baseSymbol}-PERP`;
  }, [topBids, topAsks, market, baseSymbol, quoteSymbol]);

  useEffect(() => {
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);

  return null;
}
