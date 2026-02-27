import { useMemo } from "react";

import { useOrderBookSelectedMarketId } from "@/features/order-book/model/order-book-store-provider";
import type { Market } from "@/features/market/types/market.types";
import { useMarkets } from "@/features/order-book/ui/hooks/use-markets";

export interface CurrentMarketMetadata {
  market: Market | null;
  baseSymbol: string | null;
  quoteSymbol: string | null;
}

export const useCurrentMarket = (): CurrentMarketMetadata => {
  const { markets } = useMarkets();
  const selectedMarketId = useOrderBookSelectedMarketId();

  const metadata = useMemo<CurrentMarketMetadata>(() => {
    const market = markets.find((item) => item.market_id === selectedMarketId) ?? null;

    if (!market) {
      return {
        market: null,
        baseSymbol: null,
        quoteSymbol: null,
      };
    }

    const name = market.config.name;
    const [rawBase, rawQuote] = name.split(/[-/]/);
    const baseFromName = rawBase?.trim() ?? "";
    const quoteFromName = rawQuote?.trim() ?? "";

    let quoteSymbol = quoteFromName || market.config.quote;

    if (quoteSymbol.startsWith("0x") && quoteFromName) {
      quoteSymbol = quoteFromName;
    }

    return {
      market,
      baseSymbol: baseFromName || null,
      quoteSymbol: quoteSymbol || null,
    };
  }, [markets, selectedMarketId]);

  return metadata;
};

