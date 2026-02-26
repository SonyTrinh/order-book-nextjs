export interface OrderBookLevel {
  price: number;
  amount: number;
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
  symbol: string;
  timestamp: number;
}

export interface OrderBookSnapshotRaw {
  market_id: number;
  bids: OrderBookLevelRaw[];
  asks: OrderBookLevelRaw[];
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

export type OrderBookWsMessage = OrderBookSnapshotMessage;

export interface OrderBookDelta {
  asks?: OrderBookLevelRaw[];
  bids?: OrderBookLevelRaw[];
  market_id: string;
  timestamp: string;
}

export interface OrderBookState {
  isConnected: boolean;
  snapshot: OrderBookSnapshot | null;
}

export interface OrderBookActions {
  setConnectionStatus: (isConnected: boolean) => void;
  setSnapshot: (snapshot: OrderBookSnapshot) => void;
  reset: () => void;
}

export type OrderBookStore = OrderBookState & OrderBookActions;