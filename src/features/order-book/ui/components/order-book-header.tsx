"use client";

import { memo, useMemo, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";

import {
  useOrderBookIsInitialized,
  useOrderBookTopAsks,
  useOrderBookTopBids,
} from "@/features/order-book/model/order-book-store-provider";
import PairSelector from "@/features/order-book/ui/components/pair-selector";
import SpreadDepthSelector from "@/features/order-book/ui/components/spread-depth-selector";
import {
  toBigIntSafe,
} from "@/features/order-book/ui/order-book-view.utils";
import { useTheme } from "@/shared/theme/theme-provider";

const NOTIONAL_SCALE = BigInt(10) ** BigInt(18);

const sumNotional = (
  levels: readonly { price: string; quantity: string }[],
): bigint =>
  levels.reduce(
    (acc, l) =>
      acc + (toBigIntSafe(l.price) * toBigIntSafe(l.quantity)) / NOTIONAL_SCALE,
    BigInt(0),
  );

const OrderBookHeader = (): ReactNode => {
  const isInitialized = useOrderBookIsInitialized();
  const topBids = useOrderBookTopBids();
  const topAsks = useOrderBookTopAsks();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const { bidPercent, askPercent } = useMemo(() => {
    const bidVol = sumNotional(topBids);
    const askVol = sumNotional(topAsks);
    const total = bidVol + askVol;
    if (total === BigInt(0)) {
      return { bidPercent: 50, askPercent: 50 };
    }
    const bidPct = Number((bidVol * BigInt(10000)) / total) / 100;
    const askPct = Number((askVol * BigInt(10000)) / total) / 100;
    return { bidPercent: bidPct, askPercent: askPct };
  }, [topBids, topAsks]);

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
        {isInitialized && (topBids.length > 0 || topAsks.length > 0) ? (
          <div className="mt-2 flex w-full max-w-md items-center gap-2">
            <span className="whitespace-nowrap text-xs text-zinc-900 dark:text-slate-100">
              B{" "}
              <span className="font-medium text-emerald-500 dark:text-emerald-400">
                {bidPercent.toFixed(2)}%
              </span>
            </span>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="absolute inset-y-0 left-0 rounded-l-full bg-emerald-500 dark:bg-emerald-500"
                style={{ width: `${bidPercent}%` }}
              />
              <div
                className="absolute inset-y-0 rounded-r-full bg-rose-500 dark:bg-rose-500"
                style={{ left: `${bidPercent}%`, width: `${askPercent}%` }}
              />
            </div>
            <span className="whitespace-nowrap text-xs text-zinc-900 dark:text-slate-100">
              <span className="font-medium text-rose-500 dark:text-rose-400">
                {askPercent.toFixed(2)}%
              </span>{" "}
              S
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <PairSelector />
        <SpreadDepthSelector />
      </div>
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
    </header>
  );
};

export default memo(OrderBookHeader);
