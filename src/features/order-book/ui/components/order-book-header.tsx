"use client";

import { memo, type ReactNode } from "react";
import { Moon, Sun } from "lucide-react";

import PairSelector from "@/features/order-book/ui/components/pair-selector";
import SpreadDepthSelector from "@/features/order-book/ui/components/spread-depth-selector";
import OrderBookVolumeBar from "@/features/order-book/ui/components/order-book-volume-bar";
import { useTheme } from "@/shared/theme/theme-provider";

const OrderBookHeader = (): ReactNode => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-slate-950">
      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-slate-100">Order Book</h1>
        <OrderBookVolumeBar />
      </div>
      <div className="flex flex-1 items-center justify-center gap-2">
        <PairSelector />
        <SpreadDepthSelector />
      </div>
      <div className="flex flex-1 justify-end">
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
