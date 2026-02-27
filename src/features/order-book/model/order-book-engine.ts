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
  _side: OrderBookSide,
  limit?: number,
): OrderBookLevel[] => {
  const result: OrderBookLevel[] = [];

  for (const level of sideMap.values()) {
    result.push(mapLevelToView(level));

    if (typeof limit === "number" && result.length >= limit) {
      break;
    }
  }

  return result;
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

export const selectOrderBookTopLevels = (
  normalizedState: NormalizedOrderBookState,
  depth: number,
): OrderBookTopLevels => ({
  bids: toOrderedLevels(normalizedState.bids, "bids", depth),
  asks: toOrderedLevels(normalizedState.asks, "asks", depth),
});
