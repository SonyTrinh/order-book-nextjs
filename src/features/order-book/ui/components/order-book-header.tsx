"use client";

import { memo, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";

import {
  useOrderBookIsInitialized,
  useOrderBookSnapshot,
} from "@/features/order-book/model/order-book-store-provider";
import PairSelector from "@/features/order-book/ui/components/pair-selector";
import { formatTimestamp } from "@/features/order-book/ui/order-book-view.utils";
import { useTheme } from "@/shared/theme/theme-provider";

const OrderBookHeader = (): ReactNode => {
  const isInitialized = useOrderBookIsInitialized();
  const snapshot = useOrderBookSnapshot();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

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
            isInitialized
              ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
              : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          }`}
        >
          {isInitialized ? "Live" : "Waiting Snapshot"}
        </span>
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          {isDark ? (
            <>
              <Moon className="h-3 w-3" />
              <span>Dark</span>
            </>
          ) : (
            <>
              <Sun className="h-3 w-3" />
              <span>Light</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default memo(OrderBookHeader);
