import { useEffect, useRef, useState } from "react";

import { fetchMarkets } from "@/features/market/api/market.api";
import type { Market } from "@/features/market/types/market.types";
import type { UseMarketsResult } from "@/features/order-book/types/order-book.types";

export const useMarkets = (): UseMarketsResult => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) {
      return;
    }

    let mounted = true;
    hasLoadedRef.current = true;

    const loadMarkets = async (): Promise<void> => {
      const result = await fetchMarkets();

      if (!mounted) {
        return;
      }

      if (!result.ok) {
        setError(result.error.message);
        setIsLoading(false);
        return;
      }

      const fetchedMarkets = result.data.markets;
      setMarkets(fetchedMarkets);
      setError(null);
      setIsLoading(false);
    };

    void loadMarkets();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    markets,
    isLoading,
    error,
  };
};

