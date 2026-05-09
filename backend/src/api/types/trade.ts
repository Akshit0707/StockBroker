export interface TradeRecord {
  id: string;
  buyOrderId: string;
  sellOrderId: string;
  stockId: string;
  price: number;
  quantity: number;
  executedAt: Date;
}

export interface TradeResponse extends TradeRecord {
  symbol: string;
  stockName: string;
  tradeSide: 'BUY' | 'SELL';
  totalValue: number;
}

export interface TradeHistoryRow {
  id: string;
  price: number;
  quantity: number;
  executedAt: Date;
  symbol: string;
  stock_name: string;
  trade_side: 'BUY' | 'SELL';
  total_value: number;
}

export interface TradeRecent{
  id: string;
  price: number;
  quantity: number;
  executedAt: Date;
  symbol: string;
  stock_name: string;
  total_value: number;
}

export interface OrderLevel{
  price:number;
  total_quantity:number;
  order_count:number;
}

export interface OrderBook {
  symbol: string;
  current_price: number;
  asks: OrderLevel[];
  bids: OrderLevel[];
  spread: number | null;
  timestamp: Date;
}