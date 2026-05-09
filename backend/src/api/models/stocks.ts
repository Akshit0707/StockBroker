import { query } from '../../utils/db';
import type { Stock, OhlcCandle, PriceHistoryInput } from '../types';
import type { PoolClient } from 'pg';

export class StockModel {
  static async findAll(): Promise<Stock[]> {
    const result = await query(
      `SELECT id, name, symbol, "currentPrice", "createdAt" FROM stocks ORDER BY symbol ASC`,
    );
    return result.rows;
  }

  static async findBySymbol(symbol: string): Promise<Stock | null> {
    const result = await query(
      `SELECT id, name, symbol, "currentPrice", "createdAt" FROM stocks WHERE symbol = $1`,
      [symbol.toUpperCase()],
    );
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<Stock | null> {
    const result = await query(
      `SELECT id, name, symbol, "currentPrice", "createdAt" FROM stocks WHERE id = $1`,
      [id],
    );
    return result.rows[0] || null;
  }

  static async updatePrice(stockId: string, newPrice: number, client: PoolClient): Promise<void> {
    await client.query('UPDATE stocks SET "currentPrice" = $1 WHERE id = $2', [newPrice, stockId]);
  }

  static async insertPriceHistory(input: PriceHistoryInput, client: PoolClient): Promise<void> {
    await client.query(
      'INSERT INTO price_history (time, stock_id, price, volume) VALUES (NOW(), $1, $2, $3)',
      [input.stockId, input.price, input.volume],
    );
  }

  static async getPriceHistory(stockId: string, interval: string, limit: number): Promise<OhlcCandle[]> {
    const intervalMap: Record<string, string> = {
      '1m': '1 minute', '5m': '5 minutes', '15m': '15 minutes',
      '1h': '1 hour', '4h': '4 hours', '1d': '1 day',
    };
    const pgInterval = intervalMap[interval] || '1 hour';
    const result = await query(
      `SELECT
         time_bucket($1::interval, time) AS bucket,
         FIRST(price, time) AS open,
         MAX(price) AS high,
         MIN(price) AS low,
         LAST(price, time) AS close,
         SUM(volume) AS volume
       FROM price_history
       WHERE stock_id = $2
       GROUP BY bucket
       ORDER BY bucket DESC
       LIMIT $3`,
      [pgInterval, stockId, limit],
    );
    return result.rows;
  }

  static async getLatestPrice(stockId: string): Promise<number | null> {
    const result = await query(
      `SELECT "currentPrice" FROM stocks WHERE id = $1`,
      [stockId],
    );
    return result.rows[0]?.currentPrice || null;
  }

  static async getAllStocks() {
    const result = await query(
      `SELECT
        s.id, s.symbol, s.name,
        COALESCE(s."currentPrice", 0) AS "currentPrice",
        COALESCE(ph.last_price, COALESCE(s."currentPrice", 0)) AS last_price,
        COALESCE(ph.prev_price, NULL) AS prev_price,
        (COALESCE(ph.last_price, COALESCE(s."currentPrice", 0)) - COALESCE(ph.prev_price, COALESCE(ph.last_price, COALESCE(s."currentPrice", 0)))) AS change,
        CASE
          WHEN COALESCE(ph.prev_price, 0) = 0 THEN 0
          ELSE ROUND(
            ((COALESCE(ph.last_price, COALESCE(s."currentPrice", 0)) - COALESCE(ph.prev_price, 0))
              / COALESCE(ph.prev_price, 1)) * 100, 2)
        END AS change_percent
       FROM stocks s
       LEFT JOIN LATERAL (
         SELECT latest.price AS last_price, prev.price AS prev_price
         FROM (SELECT price, time FROM price_history ph1 WHERE ph1.stock_id = s.id ORDER BY ph1.time DESC LIMIT 1) latest
         LEFT JOIN LATERAL (SELECT price FROM price_history ph2 WHERE ph2.stock_id = s.id AND ph2.time < latest.time ORDER BY ph2.time DESC LIMIT 1) prev ON true
       ) ph ON true
       ORDER BY s.symbol ASC`
    );
    return result.rows;
  }
}