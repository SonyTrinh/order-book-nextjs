"use client";

import { memo, useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import {
  useOrderBookSelectedMarketId,
  useSetOrderBookSelectedMarketId,
} from "@/features/order-book/model/order-book-store-provider";
import { useMarkets } from "@/features/order-book/ui/hooks/use-markets";

const PairSelector = (): ReactNode => {
  const selectedMarketId = useOrderBookSelectedMarketId();
  const setSelectedMarketId = useSetOrderBookSelectedMarketId();
  const [isOpen, setIsOpen] = useState(false);
  const { markets, isLoading, error } = useMarkets();

  useEffect(() => {
    if (markets.length === 0) {
      return;
    }

    const hasSelected = markets.some((market) => market.market_id === selectedMarketId);
    const firstMarket = markets.at(0);

    if (!hasSelected && firstMarket) {
      setSelectedMarketId(firstMarket.market_id);
    }
  }, [markets, selectedMarketId, setSelectedMarketId]);

  const selectedMarketName = useMemo(() => {
    const selectedMarket = markets.find((market) => market.market_id === selectedMarketId);
    return selectedMarket?.config.name.split('/')[0] + '-PERP'
  }, [markets, selectedMarketId]);

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <span>{selectedMarketName}</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </span>
      </button>

      {isOpen ? (
        <div className="absolute z-20 mt-2 w-72 max-w-[85vw] rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          {isLoading ? (
            <p className="px-2 py-3 text-sm text-zinc-500 dark:text-zinc-400">Loading pairs...</p>
          ) : error ? (
            <p className="px-2 py-3 text-sm text-rose-500">{error}</p>
          ) : (
            <ul className="max-h-72 space-y-1 overflow-auto">
              {markets.map((market) => {
                const isActive = market.market_id === selectedMarketId;

                return (
                  <li key={market.market_id}>
                    <button
                      type="button"
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                        isActive
                          ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      }`}
                      onClick={() => {
                        setSelectedMarketId(market.market_id);
                        setIsOpen(false);
                      }}
                    >
                      <span className="font-medium">{market.config.name.split('/')[0]}-PERP</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default memo(PairSelector);