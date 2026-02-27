import { useMarketsQuery } from "@/features/market/api/market.queries";
import type { UseMarketsResult } from "@/features/order-book/types/order-book.types";

export const useMarkets = (): UseMarketsResult => {
  const { data, isPending, error } = useMarketsQuery();

  let errorMessage: string | null = null;

  if (error) {
    errorMessage = error instanceof Error ? error.message : "Unknown error";
  }

  return {
    markets: data?.markets ?? [],
    isLoading: isPending,
    error: errorMessage,
  };
};
