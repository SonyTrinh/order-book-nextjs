"use client";

import { memo, useMemo, type ReactNode } from "react";
import type { OrderBookLevel, OrderBookSide } from "@/features/order-book/types/order-book.types";
import {
  formatCompactIntegerString,
  formatIntegerString,
  toRows,
} from "@/features/order-book/ui/order-book-view.utils";

interface OrderBookSidePanelProps {
  title: string;
  side: OrderBookSide;
  levels: OrderBookLevel[];
}

const OrderBookSidePanel = ({ title, side, levels }: OrderBookSidePanelProps): ReactNode => {
  const rows = useMemo(() => toRows(levels), [levels]);
  const lastRow = rows.length > 0 ? rows[rows.length - 1] : undefined;
  const maxCumulative = lastRow ? lastRow.cumulativeQuantity : BigInt(0);
  const rowBgClass = side === "bids" ? "bg-emerald-500/10" : "bg-rose-500/10";
  const accentClass = side === "bids" ? "text-emerald-400" : "text-rose-400";

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className={`mb-3 text-sm font-semibold uppercase tracking-wide ${accentClass}`}>
        {title}
      </h2>
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
                <div
                  className={`absolute inset-y-0 right-0 ${rowBgClass}`}
                  style={{ width: `${depthPercent}%` }}
                />
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
};

export default memo(OrderBookSidePanel);
