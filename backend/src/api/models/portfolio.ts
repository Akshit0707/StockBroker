import { query } from '../../utils/db';
import type { Portfolio, PortfolioHolding } from '../types';
import type { PoolClient } from 'pg';

export class PortfolioModel {
  // Fix: safe SQL (no stray 'not' token) to fetch a user's holding for a stock
  static async findByUserAndStock(userId: string, stockId: string): Promise<Portfolio | null> {
    const result = await query(
      `SELECT *
       FROM portfolio
       WHERE user_id = $1
         AND stock_id = $2
       LIMIT 1`,
      [userId, stockId],
    );

    return result.rows[0] ?? null;
  }

  static async getUserPortfolio(userId: string): Promise<PortfolioHolding[]> {
    const result = await query(
      `SELECT
         s.symbol,
         s.name,
         p.quantity,
         p.average_buy_price AS "averageBuyPrice",
         s.current_price AS "currentPrice",
         (p.quantity * s.current_price) AS "totalValue",
         ((p.quantity * s.current_price) - (p.quantity * p.average_buy_price)) AS "gainLoss",
         (((s.current_price - p.average_buy_price) / p.average_buy_price) * 100) AS "gainLossPercent"
       FROM portfolio p
       JOIN stocks s ON p.stock_id = s.id
       WHERE p.user_id = $1`,
      [userId],
    );
    return result.rows;
  }

  static async addShares(
    userId: string,
    stockId: string,
    quantity: number,
    price: number,
    client: PoolClient,
  ): Promise<void> {
    await client.query(
      `INSERT INTO portfolio (user_id, stock_id, quantity, average_buy_price, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (user_id, stock_id)
       DO UPDATE SET
         average_buy_price = (
           (portfolio.quantity * portfolio.average_buy_price + $3 * $4)
           / (portfolio.quantity + $3)
         ),
         quantity = portfolio.quantity + $3,
         updated_at = NOW()`,
      [userId, stockId, quantity, price],
    );
  }

  static async removeShares(
    userId: string,
    stockId: string,
    quantity: number,
    client: PoolClient,
  ): Promise<void> {
    await client.query(
      `UPDATE portfolio
       SET quantity = quantity - $1, updated_at = NOW()
       WHERE user_id = $2 AND stock_id = $3`,
      [quantity, userId, stockId],
    );
  }
}