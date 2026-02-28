"use client";

import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { OrderBookLevel, OrderBookSide } from "@/features/order-book/types/order-book.types";
import { ORDER_BOOK_HIGHLIGHT_DURATION_MS } from "@/features/order-book/model/order-book.constants";
import { useOrderBookIsInitialized } from "@/features/order-book/model/order-book-store-provider";
import { formatCoinAmount, getDisplayDecimalsFromStepSize, toRows } from "@/features/order-book/ui/order-book-view.utils";
import { useCurrentMarket } from "@/features/order-book/ui/hooks/use-current-market";
import OrderBookSkeletonRow from "./order-book-skeleton";

interface OrderBookSidePanelProps {
  title: string;
  side: OrderBookSide;
  levels: OrderBookLevel[];
}

const OrderBookSidePanel = ({ title, side, levels }: OrderBookSidePanelProps): ReactNode => {
  const rows = useMemo(() => toRows(levels), [levels]);
  const previousRowsRef = useRef<OrderBookLevel[]>([]);
  const lastRow = rows.length > 0 ? rows[rows.length - 1] : undefined;
  const maxCumulative = lastRow ? lastRow.cumulativeQuantity : BigInt(0);
  const rowBgClass =
    side === "bids"
      ? "bg-emerald-100 dark:bg-emerald-900/60"
      : "bg-rose-100 dark:bg-rose-900/60";
  const accentClass =
    side === "bids"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";
  const { market, baseSymbol, quoteSymbol } = useCurrentMarket();
  const sizeDecimals = market ? getDisplayDecimalsFromStepSize(market.config.step_size) : 4;
  const priceDecimals = market ? getDisplayDecimalsFromStepSize(market.config.step_price) : 2;
  const [highlightedPrices, setHighlightedPrices] = useState<Set<string>>(new Set());
  const highlightBgClass =
    side === "bids"
      ? "bg-emerald-100 dark:bg-emerald-500/20"
      : "bg-rose-100 dark:bg-rose-500/20";
  const isInitialized = useOrderBookIsInitialized();

  useEffect(() => {
    const previousByPrice = new Map(
      previousRowsRef.current.map((row) => [row.price, row.quantity]),
    );
    const changed: string[] = [];

    rows.forEach((row) => {
      const previousQuantity = previousByPrice.get(row.price);
      if (previousQuantity === undefined || previousQuantity !== row.quantity) {
        changed.push(row.price);
      }
    });

    previousRowsRef.current = rows;

    if (changed.length === 0) {
      return;
    }

    setHighlightedPrices((previous) => {
      const next = new Set(previous);
      changed.forEach((price) => next.add(price));
      return next;
    });

    const timeoutId = window.setTimeout(() => {
      setHighlightedPrices((previous) => {
        const next = new Set(previous);
        changed.forEach((price) => next.delete(price));
        return next;
      });
    }, ORDER_BOOK_HIGHLIGHT_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [rows]);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-slate-950">
      <h2 className={`mb-3 text-sm font-semibold uppercase tracking-wide ${accentClass}`}>
        {title}
      </h2>
      <div className="mb-2 grid grid-cols-3 gap-2 px-2 text-xs text-zinc-500 dark:text-slate-400">
        <span>Total</span>
        <span className="text-right">
          Quantity{" "}
          {baseSymbol ? (
            <span className="ml-1 inline-flex items-center rounded border border-zinc-400 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-zinc-700 dark:border-slate-600 dark:text-slate-300">
              {baseSymbol}
            </span>
          ) : null}
        </span>
        <span className="text-right">
          Price{" "}
          {quoteSymbol ? (
            <span className="ml-1 inline-flex items-center rounded border border-zinc-400 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-zinc-700 dark:border-slate-600 dark:text-slate-300">
              {quoteSymbol}
            </span>
          ) : null}
        </span>
      </div>
      <div className="space-y-1">
        {!isInitialized ? (
          Array.from({ length: 20 }).map((_, index) => (
            <OrderBookSkeletonRow key={`skeleton-${side}-${index}`} />
          ))
        ) : rows.length === 0 ? (
          <p className="px-2 py-4 text-sm text-zinc-500 dark:text-slate-500">No levels yet.</p>
        ) : (
          rows.map((row) => {
            const depthPercent =
              maxCumulative === BigInt(0)
                ? 0
                : Number((row.cumulativeQuantity * BigInt(10000)) / maxCumulative) / 100;
            const formattedSize = formatCoinAmount(row.quantity, sizeDecimals);
            const formattedTotal = formatCoinAmount(
              row.cumulativeQuantity.toString(),
              sizeDecimals,
            );
            const formattedPrice = formatCoinAmount(row.price, priceDecimals);
            const isHighlighted = highlightedPrices.has(row.price);

            return (
              <div
                key={`${side}-${row.price}`}
                className="relative overflow-hidden rounded-md transition-transform duration-200 ease-out hover:scale-[1.02] origin-center"
              >
                <div
                  className={`absolute inset-y-0 ${side === "bids" ? "right-0" : "left-0"} ${rowBgClass}`}
                  style={{ width: `${depthPercent}%` }}
                />
                <div
                  className={`relative grid grid-cols-3 gap-2 px-2 py-1.5 text-sm transition-colors duration-500 ${
                    isHighlighted ? highlightBgClass : ""
                  }`}
                >
                  <span
                    className="truncate font-mono tabular-nums text-zinc-700 dark:text-slate-300"
                    title={formattedTotal}
                  >
                    {formattedTotal}
                  </span>
                  <span
                    className="truncate text-right font-mono tabular-nums text-zinc-900 dark:text-slate-100"
                    title={formattedSize}
                  >
                    {formattedSize}
                  </span>
                  <span
                    className={`text-right font-medium tabular-nums ${accentClass}`}
                    title={formattedPrice}
                  >
                    {formattedPrice}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default memo(OrderBookSidePanel);
