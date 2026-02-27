"use client";

import { memo, type ReactNode } from "react";

import {
  useOrderBookIsConnected,
  useOrderBookIsInitialized,
  useOrderBookSnapshot,
} from "@/features/order-book/model/order-book-store-provider";
import PairSelector from "@/features/order-book/ui/components/pair-selector";
import { formatTimestamp } from "@/features/order-book/ui/order-book-view.utils";

const OrderBookHeader = (): ReactNode => {
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
};

export default memo(OrderBookHeader);
