"use client";

import { memo, type ReactNode } from "react";

import OrderBookHeader from "@/features/order-book/ui/components/order-book-header";
import OrderBookAsks from "@/features/order-book/ui/components/order-book-asks";
import OrderBookBids from "@/features/order-book/ui/components/order-book-bids";

export const OrderBookView = memo(function OrderBookView(): ReactNode {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
      <OrderBookHeader />
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OrderBookAsks />
        <OrderBookBids />
      </section>
    </main>
  );
});
