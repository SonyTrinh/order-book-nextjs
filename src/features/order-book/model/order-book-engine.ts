import type {
  NormalizedOrderBookState,
  OrderBookDeltaMessage,
  OrderBookLevel,
  OrderBookLevelRaw,
  OrderBookSide,
  OrderBookSnapshot,
  OrderBookSnapshotMessage,
  OrderBookTopLevels,
} from "@/features/order-book/types/order-book.types";
import { SPREAD_OPTIONS } from "@/features/order-book/model/order-book.constants";

export type { NormalizedOrderBookState };

const createSideMap = (levels: OrderBookLevelRaw[]): Map<string, OrderBookLevelRaw> => {
  const sideMap = new Map<string, OrderBookLevelRaw>();

  levels.forEach((level) => {
    sideMap.set(level.price, level);
  });

  return sideMap;
};

const isZeroQuantity = (quantity: string): boolean => /^0+$/.test(quantity);

const mapLevelToView = (level: OrderBookLevelRaw): OrderBookLevel => ({
  price: level.price,
  quantity: level.quantity,
  orderCount: level.order_count,
  blockNumber: level.block_number,
  logIndex: level.log_index,
});

const patchSide = (
  previous: Map<string, OrderBookLevelRaw>,
  incomingLevels: OrderBookLevelRaw[] | undefined,
): Map<string, OrderBookLevelRaw> => {
  const next = new Map(previous);

  if (!incomingLevels) {
    return next;
  }

  incomingLevels.forEach((level) => {
    if (isZeroQuantity(level.quantity)) {
      next.delete(level.price);
      return;
    }

    next.set(level.price, level);
  });

  return next;
};

export const createNormalizedOrderBookFromSnapshot = (
  message: OrderBookSnapshotMessage,
): NormalizedOrderBookState => ({
  marketId: message.market_id,
  bids: createSideMap(message.data.bids),
  asks: createSideMap(message.data.asks),
  timestamp: message.timestamp,
  levelCount: message.level_count,
});

export const applyOrderBookDelta = (
  previousState: NormalizedOrderBookState,
  message: OrderBookDeltaMessage,
): NormalizedOrderBookState => ({
  marketId: message.market_id,
  bids: patchSide(previousState.bids, message.data.bids),
  asks: patchSide(previousState.asks, message.data.asks),
  timestamp: message.timestamp,
  levelCount: message.level_count,
});

const toOrderedLevels = (
  sideMap: Map<string, OrderBookLevelRaw>,
  side: OrderBookSide,
  limit?: number,
): OrderBookLevel[] => {
  const levels = Array.from(sideMap.values());
  const sorted =
    side === "bids"
      ? levels.sort((a, b) => Number(BigInt(b.price) - BigInt(a.price)))
      : levels.sort((a, b) => Number(BigInt(a.price) - BigInt(b.price)));
  const limited = typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  return limited.map(mapLevelToView);
};

export const toOrderBookSnapshotView = (
  normalizedState: NormalizedOrderBookState,
): OrderBookSnapshot => ({
  marketId: normalizedState.marketId,
  bids: toOrderedLevels(normalizedState.bids, "bids"),
  asks: toOrderedLevels(normalizedState.asks, "asks"),
  timestamp: normalizedState.timestamp,
  levelCount: normalizedState.levelCount,
});

const E18 = BigInt("1000000000000000000");

const SPREAD_SCALES: readonly bigint[] = [
  BigInt("10000000000000000"),
  BigInt("100000000000000000"),
  E18,
];

const spreadToScale = (spread: number): bigint => {
  const idx = SPREAD_OPTIONS.findIndex((s) => Math.abs(s - spread) < 1e-12);
  return idx >= 0 ? SPREAD_SCALES[idx] ?? E18 : E18;
};

export const aggregateLevelsBySpread = (
  levels: OrderBookLevel[],
  spread: number,
  side: OrderBookSide,
): OrderBookLevel[] => {
  const scale = spreadToScale(spread);
  const buckets = new Map<
    string,
    { quantity: bigint; orderCount: number; blockNumber: number; logIndex: number }
  >();

  for (const level of levels) {
    const priceBig = BigInt(level.price);
    const bucketPrice = (priceBig / scale) * scale;
    const key = bucketPrice.toString();
    const existing = buckets.get(key);
    const qty = BigInt(level.quantity);
    if (existing) {
      existing.quantity += qty;
      existing.orderCount += level.orderCount;
    } else {
      buckets.set(key, {
        quantity: qty,
        orderCount: level.orderCount,
        blockNumber: level.blockNumber,
        logIndex: level.logIndex,
      });
    }
  }

  const result: OrderBookLevel[] = [];
  for (const [price, data] of buckets) {
    result.push({
      price,
      quantity: data.quantity.toString(),
      orderCount: data.orderCount,
      blockNumber: data.blockNumber,
      logIndex: data.logIndex,
    });
  }

  return result.sort((a, b) =>
    side === "bids"
      ? Number(BigInt(b.price) - BigInt(a.price))
      : Number(BigInt(a.price) - BigInt(b.price)),
  );
};


export const selectOrderBookTopLevels = (
  normalizedState: NormalizedOrderBookState,
  depth: number,
  spread: number = 1,
): OrderBookTopLevels => {
  const rawBids = toOrderedLevels(normalizedState.bids, "bids", depth);
  const rawAsks = toOrderedLevels(normalizedState.asks, "asks", depth);
  const aggregatedBids = aggregateLevelsBySpread(rawBids, spread, "bids").slice(0, depth);
  const aggregatedAsks = aggregateLevelsBySpread(rawAsks, spread, "asks").slice(0, depth);
  return { bids: aggregatedBids, asks: aggregatedAsks };
};
