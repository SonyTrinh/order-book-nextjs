"use client";

import { memo, useMemo, type ReactNode } from "react";

import {
  useOrderBookIsInitialized,
  useOrderBookTopAsks,
  useOrderBookTopBids,
} from "@/features/order-book/model/order-book-store-provider";
import { sumNotional } from "@/features/order-book/ui/order-book-view.utils";

const OrderBookVolumeBar = (): ReactNode => {
  const isInitialized = useOrderBookIsInitialized();
  const topBids = useOrderBookTopBids();
  const topAsks = useOrderBookTopAsks();

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

  if (isInitialized && (topBids.length > 0 || topAsks.length > 0)) {
    return (
      <div className="mt-2 flex w-52 items-center gap-2">
        <span className="flex shrink-0 items-center gap-1 text-xs text-zinc-900 dark:text-slate-100">
          B
          <span className="w-11 tabular-nums font-medium text-emerald-500 dark:text-emerald-400">
            {bidPercent.toFixed(2)}%
          </span>
        </span>
        <div className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="absolute inset-y-0 left-0 rounded-l-full bg-emerald-500 dark:bg-emerald-500"
            style={{ width: `${bidPercent}%` }}
          />
          <div
            className="absolute inset-y-0 rounded-r-full bg-rose-500 dark:bg-rose-500"
            style={{ left: `${bidPercent}%`, width: `${askPercent}%` }}
          />
        </div>
        <span className="flex shrink-0 items-center gap-1 text-xs text-zinc-900 dark:text-slate-100">
          <span className="w-11 tabular-nums text-right font-medium text-rose-500 dark:text-rose-400">
            {askPercent.toFixed(2)}%
          </span>
          S
        </span>
      </div>
    );
  }

  return (
    <div className="mt-2 flex w-52 items-center gap-2">
      <span className="whitespace-nowrap text-xs text-zinc-500 dark:text-slate-500">B</span>
      <div
        className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse"
        aria-label="Loading volume bar"
      />
      <span className="whitespace-nowrap text-xs text-zinc-500 dark:text-slate-500">S</span>
    </div>
  );
};

export default memo(OrderBookVolumeBar);
