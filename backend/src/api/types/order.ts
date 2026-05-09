export type OrderType = 'buy' | 'sell';
export type OrderStatus = 'pending' | 'partially_filled' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  stockId: string;
  quantity: number;
  price: number;
  orderType: OrderType;
  status: OrderStatus;
  filledQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaceOrderInput {
  stockSymbol: string;
  orderType: string;
  price: number;
  quantity: number;
}


export interface TradeEvent {
  stockId: string;
  price: number;
  quantity: number;
  timestamp: string;
}