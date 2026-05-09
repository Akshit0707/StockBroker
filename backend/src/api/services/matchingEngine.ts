import pool, { query } from '../../utils/db';
import { publish } from '../../redis';
import type { PoolClient } from 'pg';

type OrderType = 'buy' | 'sell';

interface OrderRow {
  id: string;
  user_id: string;
  stock_id: string;
  quantity: number;
  price: number;
  order_type: OrderType;
  status: string;
  filled_quantity: number;
}

export const runMatchingEngine = async (
  orderId: string,
  stockId: string,
  orderType: OrderType,
  price: number,
  quantity: number,
): Promise<void> => {
  const oppositeType: OrderType = orderType === 'buy' ? 'sell' : 'buy';
  const priceCondition = orderType === 'buy' ? '<=' : '>=';
  const priceSort = orderType === 'buy' ? 'ASC' : 'DESC';

  const oppositeOrders = await query(
    `SELECT *
     FROM orders
     WHERE stock_id = $1
       AND order_type = $2
       AND status IN ('pending', 'partially_filled')
       AND price ${priceCondition} $3
       AND user_id != (SELECT user_id FROM orders WHERE id = $4)
     ORDER BY price ${priceSort}, created_at ASC`,
    [stockId, oppositeType, price, orderId],
  );

  if (oppositeOrders.rows.length === 0) return;

  let remainingQty = quantity;

  for (const match of oppositeOrders.rows as OrderRow[]) {
    if (remainingQty <= 0) break;

    const matchAvailable = Number(match.quantity) - Number(match.filled_quantity ?? 0);
    if (matchAvailable <= 0) continue;

    const fillQty = Math.min(remainingQty, matchAvailable);
    const tradePrice = Number(match.price);

    const matchClient = await pool.connect();

    try {
      await executeTrade(
        matchClient,
        orderId,
        match.id,
        orderType,
        stockId,
        tradePrice,
        fillQty,
        match.user_id,
      );
      remainingQty -= fillQty;
    } catch (error) {
      console.error('Match execution error:', error);
    } finally {
      matchClient.release();
    }
  }
};

const executeTrade = async (
  client: PoolClient,
  takerId: string,
  makerId: string,
  takerType: OrderType,
  stockId: string,
  tradePrice: number,
  fillQty: number,
  makerUserId: string,
): Promise<void> => {
  await client.query('BEGIN');

  try {
    await client.query(
      `INSERT INTO trades (buy_order_id, sell_order_id, stock_id, price, quantity)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        takerType === 'buy' ? takerId : makerId,
        takerType === 'sell' ? takerId : makerId,
        stockId,
        tradePrice,
        fillQty,
      ],
    );

    await client.query(
      `UPDATE orders
       SET filled_quantity = filled_quantity + $1,
           status = CASE
             WHEN filled_quantity + $1 >= quantity THEN 'completed'
             ELSE 'partially_filled'
           END,
           updated_at = NOW()
       WHERE id = $2`,
      [fillQty, makerId],
    );

    await client.query(
      `UPDATE orders
       SET filled_quantity = filled_quantity + $1,
           status = CASE
             WHEN filled_quantity + $1 >= quantity THEN 'completed'
             ELSE 'partially_filled'
           END,
           updated_at = NOW()
       WHERE id = $2`,
      [fillQty, takerId],
    );

    const takerResult = await client.query('SELECT user_id FROM orders WHERE id = $1', [takerId]);
    const takerUserId = takerResult.rows[0].user_id;

    const buyUserId = takerType === 'buy' ? takerUserId : makerUserId;
    const sellUserId = takerType === 'sell' ? takerUserId : makerUserId;
    const tradeTotal = tradePrice * fillQty;
    
    await client.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [tradeTotal, buyUserId]);

    await client.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [tradeTotal, sellUserId]);

    await client.query(
      `INSERT INTO portfolio (user_id, stock_id, quantity, average_buy_price)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, stock_id)
       DO UPDATE SET
         average_buy_price = (
           (portfolio.quantity * portfolio.average_buy_price + $3 * $4)
           / (portfolio.quantity + $3)
         ),
         quantity = portfolio.quantity + $3,
         updated_at = NOW()`,
      [buyUserId, stockId, fillQty, tradePrice],
    );

    await client.query(
      `UPDATE portfolio
       SET quantity = quantity - $1, updated_at = NOW()
       WHERE user_id = $2 AND stock_id = $3`,
      [fillQty, sellUserId, stockId],
    );

    await client.query(
      `DELETE FROM portfolio
       WHERE user_id = $1 AND stock_id = $2 AND quantity <= 0`,
      [sellUserId, stockId],
    );

await client.query('UPDATE stocks SET "currentPrice" = $1 WHERE id = $2', [tradePrice, stockId]);    await client.query(
      `INSERT INTO price_history (stock_id, time, price, open_price, high_price, low_price, volume)
       VALUES ($1, NOW(), $2, $3, $4, $5, $6)`,
      [
        stockId,
        tradePrice,
        Math.round(tradePrice * 0.99), 
        Math.round(tradePrice * 1.01),  
        Math.round(tradePrice * 0.98),  
        fillQty
      ]
    );

    await client.query('COMMIT');

    await publish('trades', {
      stockId,
      price: tradePrice,
      quantity: fillQty,
      timestamp: new Date().toISOString(),
    });

    await publish('price_updates', {
      stockId,
      price: tradePrice,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
};