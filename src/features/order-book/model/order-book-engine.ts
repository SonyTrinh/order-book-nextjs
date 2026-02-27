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

export type { NormalizedOrderBookState };

const createSideMap = (levels: OrderBookLevelRaw[]): Map<string, OrderBookLevelRaw> => {
  const sideMap = new Map<string, OrderBookLevelRaw>();

  levels.forEach((level) => {
    sideMap.set(level.price, level);
  });

  return sideMap;
};

const isZeroQuantity = (quantity: string): boolean => /^0+$/.test(quantity);

const compareNumericStrings = (left: string, right: string): number => {
  const leftBigInt = BigInt(left);
  const rightBigInt = BigInt(right);

  if (leftBigInt === rightBigInt) {
    return 0;
  }

  return leftBigInt > rightBigInt ? 1 : -1;
};

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

const toSortedLevels = (
  sideMap: Map<string, OrderBookLevelRaw>,
  side: OrderBookSide,
  limit?: number,
): OrderBookLevel[] => {
  const sorted = [...sideMap.values()].sort((left, right) => {
    const compareResult = compareNumericStrings(left.price, right.price);

    if (side === "bids") {
      return compareResult * -1;
    }

    return compareResult;
  });

  const levels = typeof limit === "number" ? sorted.slice(0, limit) : sorted;
  return levels.map(mapLevelToView);
};

export const toOrderBookSnapshotView = (
  normalizedState: NormalizedOrderBookState,
): OrderBookSnapshot => ({
  marketId: normalizedState.marketId,
  bids: toSortedLevels(normalizedState.bids, "bids"),
  asks: toSortedLevels(normalizedState.asks, "asks"),
  timestamp: normalizedState.timestamp,
  levelCount: normalizedState.levelCount,
});

export const selectOrderBookTopLevels = (
  normalizedState: NormalizedOrderBookState,
  depth: number,
): OrderBookTopLevels => ({
  bids: toSortedLevels(normalizedState.bids, "bids", depth),
  asks: toSortedLevels(normalizedState.asks, "asks", depth),
});
