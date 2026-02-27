import { useQuery } from "@tanstack/react-query";

import { fetchMarkets } from "@/features/market/api/market.api";
import type { MarketsResponse } from "@/features/market/types/market.types";

const marketsQueryKey = ["markets"] as const;

export const useMarketsQuery = () =>
  useQuery<MarketsResponse, Error>({
    queryKey: marketsQueryKey,
    queryFn: async () => {
      const result = await fetchMarkets();

      if (!result.ok) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
    refetchInterval: 10_000,
  });
