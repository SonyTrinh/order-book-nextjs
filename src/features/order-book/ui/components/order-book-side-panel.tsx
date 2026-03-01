"use client";

import { memo, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { OrderBookLevel, OrderBookSide } from "@/features/order-book/types/order-book.types";
import { ORDER_BOOK_HIGHLIGHT_DURATION_MS } from "@/features/order-book/model/order-book.constants";
import {
  useOrderBookIsInitialized,
  useOrderBookLastMessageType,
} from "@/features/order-book/model/order-book-store-provider";
import {
  computeNotionalQuoteRaw,
  formatCoinAmount,
  getDisplayDecimalsFromStepSize,
  toRows,
} from "@/features/order-book/ui/order-book-view.utils";
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
  const clearHighlightTimeoutRef = useRef<number | null>(null);
  const highlightBgClass =
    side === "bids"
      ? "bg-emerald-100 dark:bg-emerald-500/20"
      : "bg-rose-100 dark:bg-rose-500/20";
  const isInitialized = useOrderBookIsInitialized();
  const lastMessageType = useOrderBookLastMessageType();

  useEffect(() => {
    if (lastMessageType === "snapshot") {
      setHighlightedPrices(new Set());
      previousRowsRef.current = rows;
      if (clearHighlightTimeoutRef.current !== null) {
        window.clearTimeout(clearHighlightTimeoutRef.current);
        clearHighlightTimeoutRef.current = null;
      }
      return;
    }

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

    if (clearHighlightTimeoutRef.current === null) {
      clearHighlightTimeoutRef.current = window.setTimeout(() => {
        clearHighlightTimeoutRef.current = null;
        setHighlightedPrices(new Set());
      }, ORDER_BOOK_HIGHLIGHT_DURATION_MS);
    }
  }, [rows, lastMessageType]);

  useEffect(() => {
    return () => {
      if (clearHighlightTimeoutRef.current !== null) {
        window.clearTimeout(clearHighlightTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section
      role="region"
      aria-label={`Order book ${title}`}
      className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-slate-950"
    >
      <h2 className={`mb-3 text-sm font-semibold uppercase tracking-wide ${accentClass}`}>
        {title}
      </h2>
      <div className="mb-2 grid grid-cols-3 gap-2 px-2 text-xs text-zinc-500 dark:text-slate-400">
        <span>
          Price{" "}
          {quoteSymbol ? (
            <span className="ml-1 inline-flex items-center rounded border border-zinc-400 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-zinc-700 dark:border-slate-600 dark:text-slate-300">
              {quoteSymbol}
            </span>
          ) : null}
        </span>
        <span className="text-right">
          Amount{" "}
          {baseSymbol ? (
            <span className="ml-1 inline-flex items-center rounded border border-zinc-400 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-zinc-700 dark:border-slate-600 dark:text-slate-300">
              {baseSymbol}
            </span>
          ) : null}
        </span>
        <span className="text-right">
          Total{" "}
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
            const notionalRaw = computeNotionalQuoteRaw(row.price, row.quantity);
            const formattedTotal = formatCoinAmount(notionalRaw, 2, 18);
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
                    className={`font-medium tabular-nums ${accentClass}`}
                    title={formattedPrice}
                  >
                    {formattedPrice}
                  </span>
                  <span
                    className="truncate text-right font-mono tabular-nums text-zinc-900 dark:text-slate-100"
                    title={formattedSize}
                  >
                    {formattedSize}
                  </span>
                  <span
                    className="truncate text-right font-mono tabular-nums text-zinc-700 dark:text-slate-300"
                    title={formattedTotal}
                  >
                    {formattedTotal}
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
