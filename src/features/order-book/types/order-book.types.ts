export interface OrderBookLevel {
  price: number;
  amount: number;
}

export interface OrderBookSnapshot {
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
  symbol: string;
  timestamp: number;
}

export interface OrderBookDelta {
  asks?: OrderBookLevel[];
  bids?: OrderBookLevel[];
  symbol: string;
  timestamp: number;
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