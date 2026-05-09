import { Request, Response } from 'express';
import { getCache, setCache } from '../../../redis';
import { OrderBook, OrderLevel } from '../../types';
import { query } from '../../../utils/db';

export const getOrderBook= async(req:Request, res:Response) => {
    try{
        const {symbol }= req.params as {symbol:string};
        const depth = Math.min(Number(req.query.depth as string) || 10, 50);

        const cachedKey = `orderbook:${symbol.toUpperCase()}:${depth}`;
        const cachedData = await getCache<OrderBook>(cachedKey);
        if(cachedData){
            res.json({success:true, data:cachedData, fromCache:true});
            return;
        }

        const stockResults= await query(`SELECT id, symbol, current_price FROM stocks WHERE symbol = $1`, [symbol.toUpperCase()]);
        if(stockResults.rowCount === 0){
            res.status(404).json({success:false, message:'Stock not found'});
            return;
        }
        const stock= stockResults.rows[0];

        const asksResult = await query(
            `SELECT price, SUM(quantity) AS total_quantity, COUNT(*) AS order_count
             FROM orders
            WHERE stock_id = $1
         AND order_type = 'sell'
         AND status IN ('pending', 'partially_filled')
            GROUP BY price
            ORDER BY price ASC
            LIMIT $2`,
            [stock.id, depth],
        );

        const bidResult= await query(
            `SELECT
         price,
         SUM(quantity - filled_quantity) AS total_quantity,
         COUNT(*) AS order_count
            FROM orders
            WHERE stock_id = $1
         AND order_type = 'buy'
         AND status IN ('pending', 'partially_filled')
            GROUP BY price
            ORDER BY price DESC
            LIMIT $2`,
            [stock.id, depth],
        );

        const asks= asksResult.rows as OrderLevel[];
        const bids= bidResult.rows as OrderLevel[];

        let spread: number | null = null;
        if (asks.length > 0 && bids.length > 0) {
            spread = Number((asks[0].price - bids[0].price).toFixed(2));
        }

        const orderBook: OrderBook={
            symbol: stock.symbol,
            current_price: Number(stock.current_price),
            asks,
            bids,
            spread,
            timestamp: new Date(),
        };
        await setCache(cachedKey, orderBook, 1);
        res.json({success:true, data:orderBook});

    }catch(error){
        console.error('Error fetching order book:', error);
        res.status(500).json({success:false, message:'Internal server error'});
    }
}