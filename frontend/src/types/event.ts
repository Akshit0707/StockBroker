import { OrderStatus } from "./orders";

export interface PriceUpdateEvent {
    symbol:string;
    price:number;
    change:number;
    changePercent:number;
    timestamp: number;
}

export interface OrderUpdateEvent {
    orderId: string;
    symbol: string;
    quantity: number;
    price: number;
    status: OrderStatus;
    timestamp: number;
}

export interface TradeExecutionEvent {
    tradeId: string;
    orderId: string;
    symbol: string;
    quantity: number;
    price: number;
    timestamp: number;
}