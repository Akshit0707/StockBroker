export interface OrderBookEntry {
  id: string;
  orderId: string;
  stockId: string;
  symbol: string;
  quantity: number;
  price: number;
  orderType: "buy" | "sell";
  status: "open" | "executed" | "cancelled";
  timestamp: string;
}

export interface OrderBook {
  stockId: string;
  symbol: string;
  buyOrders: OrderBookEntry[];
  sellOrders: OrderBookEntry[];
}