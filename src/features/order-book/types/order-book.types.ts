import type { Market } from "@/features/market";

export interface OrderBookLevel {
  price: string;
  quantity: string;
  orderCount: number;
  blockNumber: number;
  logIndex: number;
}

export interface OrderBookLevelRaw {
  price: string;
  quantity: string;
  order_count: number;
  block_number: number;
  log_index: number;
}

export interface OrderBookSnapshot {
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
  marketId: string;
  timestamp: string;
  levelCount: number;
}

export interface OrderBookSnapshotRaw {
  market_id: number;
  bids: OrderBookLevelRaw[];
  asks: OrderBookLevelRaw[];
}

export interface OrderBookDeltaRaw {
  market_id: number;
  bids?: OrderBookLevelRaw[];
  asks?: OrderBookLevelRaw[];
}

export interface OrderBookSubscribeRequest {
  method: "subscribe";
  params: {
    channel: "orderbook";
    market_ids?: number[];
  };
}

export interface OrderBookSnapshotMessage {
  method: "snapshot";
  channel: "orderbook";
  type: "snapshot";
  market_id: string;
  data: OrderBookSnapshotRaw;
  level_count: number;
  timestamp: string;
  checksum?: number | string;
}

export interface OrderBookDeltaMessage {
  method: "update";
  channel: "orderbook";
  type: "update";
  market_id: string;
  data: OrderBookDeltaRaw;
  level_count: number;
  timestamp: string;
  checksum?: number | string;
}

export type OrderBookWsMessage = OrderBookSnapshotMessage | OrderBookDeltaMessage;

export type OrderBookLastMessageType = "snapshot" | "update" | null;

export interface OrderBookState {
  isConnected: boolean;
  snapshot: OrderBookSnapshot | null;
  topBids: OrderBookLevel[];
  topAsks: OrderBookLevel[];
  isInitialized: boolean;
  selectedMarketId: string;
  lastMessageType: OrderBookLastMessageType;
  topLevelDepth: number;
  spread: number;
}

export interface OrderBookActions {
  setConnectionStatus: (isConnected: boolean) => void;
  setSelectedMarketId: (marketId: string) => void;
  setTopLevelDepth: (depth: number) => void;
  setSpread: (spread: number) => void;
  applySnapshotMessage: (message: OrderBookSnapshotMessage) => void;
  applyUpdateMessage: (message: OrderBookDeltaMessage) => void;
  reset: () => void;
}

export type OrderBookStore = OrderBookState & OrderBookActions;

export interface UseMarketsResult {
  markets: Market[];
  isLoading: boolean;
  error: string | null;
}

export type OrderBookSide = "bids" | "asks";

export interface NormalizedOrderBookState {
  marketId: string;
  bids: Map<string, OrderBookLevelRaw>;
  asks: Map<string, OrderBookLevelRaw>;
  timestamp: string;
  levelCount: number;
}

export interface OrderBookTopLevels {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export interface OrderBookRowModel extends OrderBookLevel {
  cumulativeQuantity: bigint;
}