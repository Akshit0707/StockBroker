import{ Request, Response } from 'express';
import { getCache } from '../../../redis';
import { TradeRecent } from '../../types';
import { query } from '../../../utils/db';

export const getRecentTrades= async(req:Request, res:Response) => {
    try{
        const {symbol}= req.params as {symbol:string};
        const limit= Math.min(Number(req.query.limit as string) || 50, 500);

        const cachedKey=`trades:recent:${symbol. toUpperCase()}:${limit}`;
        const cachedData= await getCache<TradeRecent[]>(cachedKey);
        if(cachedData){
            return res.json({data: cachedData, source: 'cache'});
        }
        const result = await query(
            `SELECT
         t.id,
         t.price,
         t.quantity,
         t.executed_at,
         s.symbol,
         (t.price * t.quantity) AS total_value
            FROM trades t
            JOIN stocks s ON t.stock_id = s.id
            WHERE s.symbol = $1
            ORDER BY t.executed_at DESC
            LIMIT $2
            `[symbol.toUpperCase(), limit]
        );
        const trades= result.rows as TradeRecent[];
        res.json({success:true, data:trades});
    }catch(error){
        console.error('Error fetching recent trades:', error);
        res.status(500).json({success:false, message:'Internal server error'});
    }
}