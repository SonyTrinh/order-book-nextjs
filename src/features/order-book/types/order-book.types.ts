import type { NormalizedOrderBookState } from "@/features/order-book/model/order-book-engine";

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
    market_ids: number[];
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
}

export interface OrderBookDeltaMessage {
  method: "update" | "delta";
  channel: "orderbook";
  type: "delta" | "update";
  market_id: string;
  data: OrderBookDeltaRaw;
  level_count: number;
  timestamp: string;
}

export type OrderBookWsMessage = OrderBookSnapshotMessage | OrderBookDeltaMessage;

export interface OrderBookDelta {
  asks?: OrderBookLevelRaw[];
  bids?: OrderBookLevelRaw[];
  market_id: string;
  timestamp: string;
}

export interface OrderBookState {
  isConnected: boolean;
  snapshot: OrderBookSnapshot | null;
  topBids: OrderBookLevel[];
  topAsks: OrderBookLevel[];
  isInitialized: boolean;
  selectedMarketId: string;
}

export interface OrderBookActions {
  setConnectionStatus: (isConnected: boolean) => void;
  setSelectedMarketId: (marketId: string) => void;
  applySnapshotMessage: (message: OrderBookSnapshotMessage) => void;
  applyDeltaMessage: (message: OrderBookDeltaMessage) => void;
  reset: () => void;
}

export type OrderBookStore = OrderBookState & OrderBookActions;

export interface OrderBookStoreInternalState extends OrderBookState {
  normalized: NormalizedOrderBookState | null;
}

export type OrderBookStoreInternal = Omit<OrderBookStore, keyof OrderBookState> &
  OrderBookStoreInternalState;
