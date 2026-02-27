"use client";

import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  useOrderBookIsConnected,
  useOrderBookIsInitialized,
  useOrderBookSelectedMarketId,
  useOrderBookSnapshot,
  useSetOrderBookSelectedMarketId,
  useOrderBookTopAsks,
  useOrderBookTopBids,
} from "@/features/order-book/model/order-book-store-provider";
import type { OrderBookLevel } from "@/features/order-book/types/order-book.types";
import { fetchMarkets } from "@/features/market/api/market.api";
import type { Market } from "@/features/market/types/market.types";
import {
  formatCompactIntegerString,
  formatIntegerString,
  formatTimestamp,
  toRows,
} from "@/features/order-book/ui/order-book-view.utils";

type OrderBookSide = "bids" | "asks";

const PairSelector = memo(function PairSelector(): ReactNode {
  const selectedMarketId = useOrderBookSelectedMarketId();
  const setSelectedMarketId = useSetOrderBookSelectedMarketId();
  const [isOpen, setIsOpen] = useState(false);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }

    let mounted = true;
    hasLoadedRef.current = true;

    const loadMarkets = async (): Promise<void> => {
      const result = await fetchMarkets();

      if (!mounted) {
        return;
      }

      if (!result.ok) {
        setError(result.error.message);
        setIsLoading(false);
        return;
      }

      const fetchedMarkets = result.data.markets;
      setMarkets(fetchedMarkets);
      setError(null);
      setIsLoading(false);

      const hasSelected = fetchedMarkets.some((market) => market.market_id === selectedMarketId);
      const firstMarket = fetchedMarkets.at(0);
      if (!hasSelected && firstMarket) {
        setSelectedMarketId(firstMarket.market_id);
      }
    };

    void loadMarkets();

    return () => {
      mounted = false;
    };
  }, [selectedMarketId, setSelectedMarketId]);

  const selectedMarketName = useMemo(() => {
    const selectedMarket = markets.find((market) => market.market_id === selectedMarketId);
    return selectedMarket?.config.name ?? `Market ${selectedMarketId}`;
  }, [markets, selectedMarketId]);

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
        onClick={() => setIsOpen((previous) => !previous)}
      >
        <span>{selectedMarketName}</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{isOpen ? "▲" : "▼"}</span>
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
                      <span className="font-medium">{market.config.name}</span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">{market.market_id}</span>
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
});

const OrderBookHeader = memo(function OrderBookHeader(): ReactNode {
  const isConnected = useOrderBookIsConnected();
  const isInitialized = useOrderBookIsInitialized();
  const snapshot = useOrderBookSnapshot();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Order Book</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Market {snapshot?.marketId ?? "-"} | Last update:{" "}
          {snapshot ? formatTimestamp(snapshot.timestamp) : "-"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <PairSelector />
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            isConnected
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
          }`}
        >
          {isConnected ? "Connected" : "Disconnected"}
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            isInitialized
              ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
              : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          {isInitialized ? "Live" : "Waiting Snapshot"}
        </span>
      </div>
    </header>
  );
});

interface OrderBookSidePanelProps {
  title: string;
  side: OrderBookSide;
  levels: OrderBookLevel[];
}

const OrderBookSidePanel = memo(function OrderBookSidePanel({
  title,
  side,
  levels,
}: OrderBookSidePanelProps): ReactNode {
  const rows = useMemo(() => toRows(levels), [levels]);
  const lastRow = rows.length > 0 ? rows[rows.length - 1] : undefined;
  const maxCumulative = lastRow ? lastRow.cumulativeQuantity : BigInt(0);
  const rowBgClass = side === "bids" ? "bg-emerald-500/10" : "bg-rose-500/10";
  const accentClass = side === "bids" ? "text-emerald-400" : "text-rose-400";

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className={`mb-3 text-sm font-semibold uppercase tracking-wide ${accentClass}`}>{title}</h2>
      <div className="mb-2 grid grid-cols-3 gap-2 px-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span>Price</span>
        <span className="text-right">Quantity</span>
        <span className="text-right">Orders</span>
      </div>
      <div className="space-y-1">
        {rows.length === 0 ? (
          <p className="px-2 py-4 text-sm text-zinc-500 dark:text-zinc-400">No levels yet.</p>
        ) : (
          rows.map((row) => {
            const depthPercent =
              maxCumulative === BigInt(0)
                ? 0
                : Number((row.cumulativeQuantity * BigInt(10000)) / maxCumulative) / 100;

            return (
              <div key={`${side}-${row.price}`} className="relative overflow-hidden rounded-md">
                <div className={`absolute inset-y-0 right-0 ${rowBgClass}`} style={{ width: `${depthPercent}%` }} />
                <div className="relative grid grid-cols-3 gap-2 px-2 py-1.5 text-sm">
                  <span
                    className={`truncate font-medium tabular-nums ${accentClass}`}
                    title={formatIntegerString(row.price)}
                  >
                    {formatCompactIntegerString(row.price)}
                  </span>
                  <span
                    className="truncate text-right font-mono tabular-nums text-zinc-800 dark:text-zinc-200"
                    title={formatIntegerString(row.quantity)}
                  >
                    {formatCompactIntegerString(row.quantity)}
                  </span>
                  <span className="text-right tabular-nums text-zinc-500 dark:text-zinc-400">
                    {row.orderCount}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
});

const OrderBookAsks = memo(function OrderBookAsks(): ReactNode {
  const asks = useOrderBookTopAsks();

  return <OrderBookSidePanel title="Asks" side="asks" levels={asks} />;
});

const OrderBookBids = memo(function OrderBookBids(): ReactNode {
  const bids = useOrderBookTopBids();

  return <OrderBookSidePanel title="Bids" side="bids" levels={bids} />;
});

export const OrderBookView = memo(function OrderBookView(): ReactNode {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
      <OrderBookHeader />
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OrderBookAsks />
        <OrderBookBids />
      </section>
    </main>
  );
});
