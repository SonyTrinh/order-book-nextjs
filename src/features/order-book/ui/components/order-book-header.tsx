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

  const statusLabel = isInitialized ? "Live" : "Waiting Snapshot";
  const statusVariant = isInitialized ? "live" : "waiting";

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-slate-950">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-slate-100">Order Book</h1>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              statusVariant === "live"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-zinc-200 text-zinc-600 dark:bg-slate-800 dark:text-slate-300"
            }`}
            aria-live="polite"
            aria-label={`Status: ${statusLabel}`}
          >
            {statusLabel}
          </span>
        </div>
        <p className="text-sm text-zinc-500 dark:text-slate-400">
          Market {snapshot?.marketId ?? "-"} | Last update:{" "}
          {snapshot ? formatTimestamp(snapshot.timestamp) : "-"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <PairSelector />
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white p-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 dark:border-zinc-700 dark:bg-transparent dark:text-slate-100 dark:hover:bg-zinc-800 dark:focus:ring-slate-500 dark:focus:ring-offset-slate-950"
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
