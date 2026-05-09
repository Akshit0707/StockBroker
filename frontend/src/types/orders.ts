export type OrderSide = 'buy' | 'sell';
export type OrderStatus = 'pending' | 'partially_filled' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  stockSymbol: string;
  stockName?: string;
  orderType: OrderSide;
  quantity: number;
  filledQuantity: number;
  price: number; 
  status: OrderStatus;
  createdAt: string;
}

export interface PlaceOrderInput {
  stockSymbol: string;
  orderType: OrderSide;
  quantity: number;
  price: number;
}