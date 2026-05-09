import { OrderSide } from "./orders";


export interface Trade{
    id:string;
    symbol:string;
    price:number;
    quantity:number;
    buyOrderId:string;
    sellOrderId:string;
    type: OrderSide;
    buyUserId:string;
    sellUserId:string;
    executedAt: string;
}
