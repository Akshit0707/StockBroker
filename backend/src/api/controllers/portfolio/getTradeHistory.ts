import type { Response } from 'express';
import { query } from '../../../utils/db';
import type { AuthRequest, TradeHistoryRow } from '../../types';

export const getTradeHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const limit = Math.min(Number(req.query.limit as string) || 50, 200);

    const result = await query(
      `SELECT
         t.id,
         t.price,
         t.quantity,
         t.executed_at AS "executedAt",
         s.symbol,
         s.name as stock_name,
         CASE
           WHEN buy_order.user_id = $1 THEN 'BUY'
           ELSE 'SELL'
         END AS trade_side,
         (t.price * t.quantity) AS total_value
       FROM trades t
       JOIN orders buy_order ON t.buy_order_id = buy_order.id
       JOIN orders sell_order ON t.sell_order_id = sell_order.id
       JOIN stocks s ON t.stock_id = s.id
       WHERE buy_order.user_id = $1 OR sell_order.user_id = $1
       ORDER BY t.executed_at DESC
       LIMIT $2`,
      [userId, limit],
    );

    const rows = result.rows as TradeHistoryRow[];

    res.json({
      success: true,
      data: rows,
      count: rows.length,
    });
  } catch (error) {
    console.error('Trade history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};