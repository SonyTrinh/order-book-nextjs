"use client";

import { memo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import {
  useOrderBookSpread,
  useSetOrderBookSpread,
} from "@/features/order-book/model/order-book-store-provider";
import { SPREAD_OPTIONS } from "@/features/order-book/model/order-book.constants";

const SpreadDepthSelector = (): ReactNode => {
  const spread = useOrderBookSpread();
  const setSpread = useSetOrderBookSpread();
  const [isOpen, setIsOpen] = useState(false);

  const isValidSpread = (SPREAD_OPTIONS as readonly number[]).includes(spread);
  const displaySpread = isValidSpread ? spread : 1;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Select spread"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus:ring-slate-500 dark:focus:ring-offset-slate-950"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{displaySpread}</span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Close spread menu"
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            role="listbox"
            aria-label="Spread options"
            className="absolute right-0 z-20 mt-2 min-w-[5rem] rounded-xl border border-zinc-200 bg-white py-2 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
          >
            {SPREAD_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={spread === option}
                className={`flex w-full justify-center px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-inset dark:focus:ring-slate-500 ${
                  spread === option
                    ? "bg-sky-100 font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
                onClick={() => {
                  setSpread(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default memo(SpreadDepthSelector);
