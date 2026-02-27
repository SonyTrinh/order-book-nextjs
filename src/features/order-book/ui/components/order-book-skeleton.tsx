import type { ReactNode } from "react";

const OrderBookSkeletonRow = (): ReactNode => (
  <div className="relative overflow-hidden rounded-md bg-zinc-100 animate-pulse dark:bg-slate-900">
    <div className="absolute inset-y-0 right-0 bg-zinc-200 dark:bg-slate-800" />
    <div className="relative grid grid-cols-3 gap-2 px-2 py-1.5 text-sm">
      <span className="h-5 rounded bg-zinc-200 dark:bg-slate-800" />
      <span className="h-5 rounded bg-zinc-200 dark:bg-slate-800" />
      <span className="h-5 rounded bg-zinc-200 dark:bg-slate-800" />
    </div>
  </div>
);

export default OrderBookSkeletonRow;