export interface Stock {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  sector: string;
  created_at: Date;
}

export interface OhlcCandle {
  bucket: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PriceHistoryInput {
  stockId: string;
  price: number;
  volume: number;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  change: string;
  changePercent: string;
  timestamp: string;
}